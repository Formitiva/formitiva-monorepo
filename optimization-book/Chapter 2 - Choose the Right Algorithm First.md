# Chapter 2: Choose the Right Algorithm First

When teams start tuning a slow C++ system, they often begin at the most visible place: a loop that looks expensive, a function that gets called too often, or an allocation that appears in a profiler. Those things matter. But they are usually not the first decision that determines whether the program will be fast.

The first decision is larger.

What algorithm are you using?

That question sounds almost too obvious to matter. In practice, it is the difference between a program that scales and one that collapses under load. If the algorithm forces the machine to do far more work than necessary, no amount of inlining, branch tuning, cache awareness, or compiler optimization will rescue it. Those techniques can reduce the cost of each operation. They cannot remove orders of magnitude of unnecessary work.

This is the first rule of performance engineering:

Choose the algorithm before you optimize the implementation.

A useful way to think about runtime is:

$$
T \approx \text{total work} \times \text{cost per unit of work}
$$

Algorithms mostly control the first term. Data structures and low-level implementation mostly influence the second. If the first term is wrong by a factor of 100, trying to recover with better instruction-level efficiency is a losing strategy.

That is why good performance work begins with a step back, not a dive into assembly listings.

## Complexity Dominates Growth

The reason algorithms matter so much is not that notation is elegant or mathematically satisfying. It matters because input sizes grow. Data accumulates. Traffic spikes. Features compound. Systems that were "fast enough" at 10,000 items fail at 10 million.

Big-O notation is not a perfect model of performance, but it is a very good first filter. It tells you how quickly the amount of work grows as the problem gets larger.

A few common growth patterns are enough to understand most of the decisions you will make:

- $O(1)$: constant work
- $O(\log n)$: grows slowly
- $O(n)$: grows linearly
- $O(n \log n)$: slightly superlinear, often acceptable for sorting and similar tasks
- $O(n^2)$: dangerous once input sizes become large
- $O(2^n)$ or worse: usually infeasible beyond small inputs

The important point is not the notation itself. The important point is what happens as $n$ changes.

Consider the difference between $O(n^2)$ and $O(n \log n)$:

| Input size | Quadratic work | $n \log_2 n$ work |
| --- | ---: | ---: |
| 1,000 | 1,000,000 | about 10,000 |
| 100,000 | 10,000,000,000 | about 1,660,000 |
| 1,000,000 | 1,000,000,000,000 | about 20,000,000 |

These are not runtime measurements. They are rough growth estimates. But they show the central truth clearly: once the input becomes large, the algorithm usually determines the outcome before implementation details enter the conversation.

A compiler can make a good algorithm better. It cannot turn a quadratic algorithm into a scalable one.

## Example: Sorting One Million Values

Sorting is the classic example because the difference is easy to see.

A naive implementation might look like this:

```cpp
void slow_sort(std::vector<int>& vec) {
    const std::size_t n = vec.size();

    for (std::size_t i = 0; i < n; ++i) {
        for (std::size_t j = i + 1; j < n; ++j) {
            if (vec[i] > vec[j]) {
                std::swap(vec[i], vec[j]);
            }
        }
    }
}
```

This is simple and easy to understand. It is also quadratic. For large inputs, that is fatal.

The standard library already gives you a far better option:

```cpp
void fast_sort(std::vector<int>& vec) {
    std::sort(vec.begin(), vec.end());
}
```

`std::sort` is typically implemented as introsort, which combines quicksort, heapsort, and insertion sort to deliver excellent average performance with strong worst-case protection. In complexity terms, it behaves like $O(n \log n)$ for the workloads that matter.

The second version is not just shorter. It represents a fundamentally different amount of work.

For one million elements, a quadratic algorithm may require on the order of $10^{12}$ comparison-like operations. An $O(n \log n)$ algorithm needs on the order of $2 \times 10^7$. That gap is so large that it overwhelms every micro-optimization most developers instinctively reach for:

- Marking functions `inline`
- Rewriting conditions
- Avoiding temporary variables
- Hand-unrolling loops
- Turning on a more aggressive compiler flag

Those choices may matter later. They do not matter first.

If the wrong algorithm is in place, the rest of the optimization effort is misallocated.

## The Faster Solution Is Often "Do Less"

There is an even more important lesson hiding inside the sorting example: sometimes the best algorithm does not solve the full problem you originally wrote down.

Suppose you do not need all values fully sorted. Suppose you only need the largest 100 elements from a collection of one million. Many codebases still do this:

```cpp
std::sort(values.begin(), values.end(), std::greater<>{});
values.resize(100);
```

That works. But it solves a larger problem than necessary. You do not need a full ordering of one million values. You only need the top 100.

A better approach is to partition first, then sort only the part you care about:

```cpp
constexpr std::size_t k = 100;

std::nth_element(values.begin(),
                 values.begin() + k,
                 values.end(),
                 std::greater<>{});

values.resize(k);
std::sort(values.begin(), values.end(), std::greater<>{});
```

This is an algorithmic improvement, not an implementation trick. `std::nth_element` places the element that would appear at position `k` into its correct spot and partitions the range around it. That avoids fully sorting data you do not need ordered.

This is one of the most common performance mistakes in real systems: solving a broader problem than the application actually requires.

You see it everywhere:

- Fully sorting when only the top $k$ results matter
- Scanning all records when an index could answer the query
- Recomputing a value every request instead of precomputing it once
- Checking every pair when a hash-based structure can detect duplicates
- Reformatting or reparsing data repeatedly instead of caching a prepared representation

The fastest code is often not the code that executes instructions more efficiently. It is the code that avoids entire categories of work.

## Example: Duplicate Detection

Consider a simpler but more realistic case. A service receives a batch of IDs and needs to know whether any duplicate exists.

A first implementation might use a nested loop:

```cpp
bool has_duplicate_slow(const std::vector<int>& ids) {
    const std::size_t n = ids.size();

    for (std::size_t i = 0; i < n; ++i) {
        for (std::size_t j = i + 1; j < n; ++j) {
            if (ids[i] == ids[j]) {
                return true;
            }
        }
    }

    return false;
}
```

Again, this is easy to write and easy to explain. It is also $O(n^2)$.

A more scalable approach is to track what you have already seen:

```cpp
bool has_duplicate_fast(const std::vector<int>& ids) {
    std::unordered_set<int> seen;
    seen.reserve(ids.size());

    for (int id : ids) {
        auto [_, inserted] = seen.insert(id);
        if (!inserted) {
            return true;
        }
    }

    return false;
}
```

Average-case complexity drops to about $O(n)$. That is a dramatic change in work. For small batches, the nested-loop version may be acceptable. For large batches or growing traffic, it becomes increasingly costly, while the hash-based version scales far better.

There are tradeoffs, of course. The faster asymptotic algorithm uses additional memory and depends on the quality of hashing. If memory is constrained, or if the data is already sorted, other solutions may be better. A sorted pass with adjacent comparisons can detect duplicates in linear time after sorting. A bitmap may be ideal if IDs live in a small bounded range. If you must handle adversarial hash behavior, average-case $O(1)$ may not be enough of a guarantee.

That does not weaken the central lesson. It strengthens it.

The right question is not "What code can I tweak?" The right question is "What is the most appropriate algorithm for this workload and these constraints?"

## Algorithm, Data Structure, Implementation

A useful mental model for performance work is this hierarchy:

1. Algorithm: How much work must be done?
2. Data structure: How is that work organized in memory and accessed?
3. Implementation: How efficiently is each operation executed?

This ordering matters.

If the algorithm is wrong, the other layers cannot compensate. If the algorithm is reasonable but the data structure is poor, you may still leave large gains on the table. Only after those decisions are sound does it make sense to care deeply about instruction-level details.

This is why performance advice can feel inconsistent when taken out of context.

One engineer says, "Use `std::vector`; it is cache-friendly."

Another says, "Use `std::unordered_map`; lookups are constant time."

Another says, "Avoid virtual dispatch on hot paths."

All of these can be correct. None of them matters more than choosing the right algorithmic shape of the work.

If your program sorts an entire collection every time a single value arrives, replacing `std::map` with `std::unordered_map` is not the first fix. If your system performs repeated linear scans over the same data when it should build an index, improving loop bodies is not the first fix. If a query can be answered with precomputation, low-level tuning is already too late in the conversation.

Choose the algorithm first. Then choose the data structure that supports it. Then tune the implementation that remains.

## Big-O Is a Guide, Not a Verdict

At this point, it is important to add a nuance that many performance discussions skip.

Big-O is essential, but it is not the whole story.

It does not tell you:

- Constant factors
- Memory overhead
- Cache behavior
- Branch predictability
- Allocation cost
- Crossover points for realistic input sizes

Because of that, a theoretically better algorithm may lose for small inputs. A linear scan over a small contiguous `std::vector<int>` can easily outperform an `std::unordered_set<int>` lookup when the collection is tiny. The vector has excellent locality, almost no overhead, and simple control flow. The hash table pays for hashing, indirection, bucket management, and more memory traffic.

This is not a contradiction. It is the correct interpretation of algorithmic thinking.

Big-O tells you how a solution scales. Profiling and benchmarking tell you where the crossover occurs for your actual inputs and hardware.

A good rule is:

- Use algorithmic analysis to eliminate obviously bad approaches.
- Use measurement to choose among the plausible ones.

If you are comparing $O(n^2)$ against $O(n \log n)$ for large inputs, the high-level answer is usually clear before you benchmark. If you are comparing two $O(n)$ approaches with different memory behavior, profiling becomes decisive.

The most costly mistakes happen when developers skip the first step and begin measuring only among bad choices.

## A Better Question: What Problem Are You Really Solving?

Many poor algorithm choices are caused by answering the wrong question.

A team says, "We need to sort these events," when what they really need is to group by key and keep recent values.

A developer says, "We need fast lookup," when what they really need is fast iteration and occasional lookup.

An API says, "Return all matches," when the product only shows the first page.

A background job says, "Recompute everything," when only changed records need to be updated.

Algorithm selection starts with problem framing. Before choosing a data structure or writing a loop, ask whether the task itself is stated correctly.

Some of the best performance wins come from reformulating the problem:

- From repeated queries to precomputed indexes
- From exact ranking to top-$k$
- From per-item work to batch processing
- From global recomputation to incremental updates
- From comparing every pair to using a set, heap, or graph structure
- From eager processing to lazy evaluation

In other words, performance is often about changing the shape of work, not merely accelerating the current shape.

## A Practical Decision Process

When you face a slow subsystem, the first pass should not start with code edits. It should start with questions.

1. What is the actual problem being solved?
2. What are the expected input sizes today, and how might they grow?
3. Is the workload one-shot, repeated, streaming, or batched?
4. Do I need exact answers, full ordering, or only a subset such as top-$k$ or existence checks?
5. Can I precompute, cache, index, or reuse previous work?
6. Is the bottleneck CPU work, memory traffic, or waiting on I/O?
7. What asymptotic class does the current solution belong to?
8. Are there standard algorithms or library facilities that already solve this better?
9. What are the memory and latency constraints?
10. After narrowing the field, where is the crossover point in measurement?

These questions sound simple because they are simple. That is part of their value. Performance work often becomes expensive when teams skip simple reasoning and jump directly into complex tuning.

## Why Standard Algorithms Matter

In C++, a large amount of algorithmic leverage is already available in the standard library. Experienced developers reach for these tools not just for convenience, but because they represent well-tested, broadly optimized solutions to common problems.

A few examples appear repeatedly in performance-sensitive code:

- `std::sort` instead of hand-written quadratic sorts
- `std::nth_element` for top-$k$ or median-like problems
- `std::partial_sort` when only part of the range needs ordering
- `std::lower_bound` and binary search for sorted data
- `std::partition` for grouping by predicate
- Heap operations for continuously maintaining extrema
- Hash-based containers for membership and duplicate checks
- Prefix sums, lookup tables, and preprocessing for repeated queries

The point is not that the standard library always wins automatically. The point is that hand-written code often hides an inferior algorithm in plain sight. Before optimizing custom code, ask whether you are reimplementing a worse version of a standard algorithm.

That is especially true in performance work. Custom code tempts you to optimize what you wrote instead of questioning whether the overall approach is already suboptimal.

## Common Failure Modes

Several patterns show up repeatedly in real codebases.

The first is optimizing the loop body while ignoring loop count. Developers spend days reducing the cost of one iteration and never ask whether the iteration count should exist at all.

The second is mistaking local simplicity for global efficiency. A nested loop may look straightforward and readable, but if it scales poorly, it pushes complexity into runtime instead of source code.

The third is overcommitting to the current representation. Teams build the whole system around one shape of data, then hesitate to add an index, reorder the pipeline, or preprocess inputs because it feels like a larger change. It is a larger change. It is often the right one.

The fourth is treating every benchmark as an implementation contest. If two solutions differ by 5 percent, tuning details matter. If two solutions differ by 100x because one is using the wrong algorithmic class, implementation contests are a distraction.

The fifth is forgetting that production workloads evolve. Code that is adequate for 1,000 records may become the reason a service fails at 1,000,000. Algorithmic mistakes compound with growth.

## The Right Order of Attack

When performance matters, the order of attack should usually look like this:

1. Confirm the bottleneck with measurement.
2. Identify the algorithmic shape of the current solution.
3. Ask whether the problem can be reframed to require less work.
4. Choose a better algorithm if one exists.
5. Choose data structures that support that algorithm well.
6. Only then optimize low-level implementation details.

This ordering is not academic discipline for its own sake. It is practical risk management. Higher-level changes often produce the largest gains. Lower-level changes are most useful after the larger structural waste has been removed.

By the time you reach compiler flags and micro-optimizations, you want confidence that you are improving a fundamentally sound approach.

## Closing Thoughts

When people say performance engineering is hard, they often mean that it requires depth in compilers, CPU architecture, threading, and memory systems. That is true later. But the first difficulty is simpler and more uncomfortable: you have to be willing to challenge the shape of the solution itself.

That is harder than tweaking code you already have.

It is easier to adjust a loop than to admit the loop should not exist. It is easier to inline a helper than to realize the data should have been indexed. It is easier to debate containers than to notice that the full sort is unnecessary.

But the largest wins almost always come from that earlier decision.

Before you optimize the code, ask whether you are doing too much work.
Before you reduce the cost of each operation, ask whether the number of operations is justified.
Before you tune the machine, choose a better method.

That is where performance begins.

## Chapter Summary

- Algorithm choice usually dominates performance because it determines total work.
- $O(n^2)$ solutions fail quickly as input sizes grow, while $O(n \log n)$ and $O(n)$ often remain practical.
- The right improvement is often to solve a smaller problem, such as top-$k$ instead of full sorting.
- Standard library algorithms frequently encode better approaches than custom hand-written loops.
- Big-O is not sufficient by itself, but it is the correct first filter.
- Use measurement to compare plausible solutions, not to justify clearly poor algorithmic choices.
- The practical order is: algorithm, then data structure, then implementation.

## Chapter Checklist

Before optimizing a hot path, ask:

- Am I solving the exact problem, or a larger one than necessary?
- What is the complexity of the current approach?
- How large can the input become in production?
- Can I precompute, batch, index, cache, or short-circuit?
- Is there a standard algorithm that fits better?
- Am I trying to tune away work that should not exist at all?