// Translation cache types
export type TranslationMap = Record<string, string>;
export type TranslationCache = Map<string, TranslationMap>;

export const supportedLanguages: Record<
  string,
  { name: string; nativeName: string }
> = {
  en: { name: "English", nativeName: "English" },
  fr: { name: "French", nativeName: "Français" },
  de: { name: "German", nativeName: "Deutsch" },
  es: { name: "Spanish", nativeName: "Español" },
  "zh-cn": { name: "Chinese (Simplified)", nativeName: "简体中文" },
  bg: { name: "Bulgarian", nativeName: "Български" },
  cs: { name: "Czech", nativeName: "Čeština" },
  da: { name: "Danish", nativeName: "Dansk" },
  el: { name: "Greek", nativeName: "Ελληνικά" },
  fi: { name: "Finnish", nativeName: "Suomi" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  hu: { name: "Hungarian", nativeName: "Magyar" },
  id: { name: "Indonesian", nativeName: "Bahasa Indonesia" },
  it: { name: "Italian", nativeName: "Italiano" },
  ja: { name: "Japanese", nativeName: "日本語" },
  ko: { name: "Korean", nativeName: "한국어" },
  ms: { name: "Malay", nativeName: "Bahasa Melayu" },
  nl: { name: "Dutch", nativeName: "Nederlands" },
  no: { name: "Norwegian", nativeName: "Norsk" },
  pl: { name: "Polish", nativeName: "Polski" },
  pt: { name: "Portuguese", nativeName: "Português" },
  ro: { name: "Romanian", nativeName: "Română" },
  ru: { name: "Russian", nativeName: "Русский" },
  sk: { name: "Slovak", nativeName: "Slovenčina" },
  sv: { name: "Swedish", nativeName: "Svenska" },
  th: { name: "Thai", nativeName: "ไทย" },
  tr: { name: "Turkish", nativeName: "Türkçe" },
  uk: { name: "Ukrainian", nativeName: "Українська" },
  vi: { name: "Vietnamese", nativeName: "Tiếng Việt" },
  "zh-tw": { name: "Chinese (Traditional)", nativeName: "繁體中文" },
};

export const getSupportedLanguages = (): Record<
  string,
  { name: string; nativeName: string }
> => {
  return supportedLanguages;
};

/**
 * Translation loading result
 */
export interface TranslationLoadResult {
  success: boolean;
  translations: TranslationMap;
  error?: string;
  fromCache?: boolean;
}

// Enhanced caches with metadata
const commonTranslationCache: TranslationCache = new Map<
  string,
  TranslationMap
>();
export const userTranslationCache: TranslationCache = new Map<
  string,
  TranslationMap
>();
export const userFailedSet = new Set<string>();

// Cache metadata
const cacheMetadata = new Map<
  string,
  {
    loadedAt: Date;
    size: number;
    source: "common" | "user";
  }
>();

/**
 * Enhanced common translation loader with better error handling
 */
export const loadCommon = async (
  language: string,
): Promise<TranslationLoadResult> => {
  try {
    let translations: TranslationMap = {};

    const abbr = language.toLowerCase();
    if (abbr === "en") {
      translations = {};
    } else {
      // External source: https://formitiva.com/locales/{lang}/common.json
      const langInfo = supportedLanguages[abbr];
      if (langInfo) {
        const url = `https://formitiva.com/locales/${abbr}/common.json`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          translations = data as TranslationMap;
        }
      } else {
        // Language not supported
        translations = {};
      }
    }

    return {
      success: true,
      translations,
      fromCache: false,
    };
  } catch (error) {
    return {
      success: false,
      translations: {},
      error: `Failed to load common translations for ${language}: ${error}`,
    };
  }
};

/**
 * Enhanced common translation loading with caching and metadata
 */
export const loadCommonTranslation = async (
  language: string,
): Promise<TranslationLoadResult> => {
  if (!language || language.toLowerCase() === "en") {
    return { success: true, translations: {}, fromCache: false };
  }

  const normalizedLang = language.toLowerCase();
  // Check cache first
  if (commonTranslationCache.has(normalizedLang)) {
    return {
      success: true,
      translations: commonTranslationCache.get(normalizedLang) || {},
      fromCache: true,
    };
  }

  // Load from source
  const result = await loadCommon(normalizedLang);

  if (result.success) {
    // Cache successful results
    commonTranslationCache.set(normalizedLang, result.translations);
    cacheMetadata.set(normalizedLang, {
      loadedAt: new Date(),
      size: Object.keys(result.translations).length,
      source: "common",
    });
  }

  return result;
};

/**
 * Enhanced user translation loading with better error handling and caching
 */
export const loadUserTranslation = async (
  language: string,
  localizeName: string,
): Promise<TranslationLoadResult> => {
  if (!language || !localizeName) {
    return {
      success: false,
      translations: {},
      error: "Both language and localizeName are required",
    };
  }

  const key = `${language.toLowerCase()}/${localizeName}`;

  // Check failed cache
  if (userFailedSet.has(key)) {
    return {
      success: false,
      translations: {},
      error: "Previously failed to load",
      fromCache: true,
    };
  }

  // Check successful cache
  if (userTranslationCache.has(key)) {
    return {
      success: true,
      translations: userTranslationCache.get(key) || {},
      fromCache: true,
    };
  }

  try {
    let url = localizeName;
    if (!localizeName.includes("/") && !localizeName.includes(".")) {
      url = `/locales/${language}/${localizeName}.json`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        // 404 is not a failure, just no translations available
        userTranslationCache.set(key, {});
        cacheMetadata.set(key, {
          loadedAt: new Date(),
          size: 0,
          source: "user",
        });

        return {
          success: true,
          translations: {},
          fromCache: false,
        };
      }

      userFailedSet.add(key);
      return {
        success: false,
        translations: {},
        error: `HTTP ${response.status}`,
        fromCache: false,
      };
    }

    // Read response as text then parse so we can provide better error messages
    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("application/json") &&
      !contentType.includes("text/json")
    ) {
      // Not strictly required, but warn in debug mode
      if (isDebugMode()) {
        console.warn(
          `Translation file at ${url} has unexpected content-type: ${contentType}`,
        );
      }
    }

    const text = await response.text();

    if (!text) {
      const error = "Empty translation file";
      userFailedSet.add(key);
      return { success: false, translations: {}, error };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const error = `Invalid JSON in translation file: ${
        e instanceof Error ? e.message : String(e)
      }`;
      userFailedSet.add(key);
      return { success: false, translations: {}, error };
    }

    // Ensure we received an object and normalize values to strings.
    if (!parsed || typeof parsed !== "object") {
      const error = "Invalid translation file format";
      userFailedSet.add(key);
      return {
        success: false,
        translations: {},
        error,
      };
    }

    const userTranslations: TranslationMap = Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === "string" ? v : String(v),
      ]),
    );

    // Cache successful result
    userTranslationCache.set(key, userTranslations);
    cacheMetadata.set(key, {
      loadedAt: new Date(),
      size: Object.keys(userTranslations).length,
      source: "user",
    });

    return {
      success: true,
      translations: userTranslations,
      fromCache: false,
    };
  } catch (error) {
    const errorMessage = `Failed to load user translations: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    userFailedSet.add(key);

    return {
      success: false,
      translations: {},
      error: errorMessage,
    };
  }
};

/**
 * Return whether translation subsystem should run in debug mode.
 * Checks multiple env sources (Vite, webpack, Next.js, etc.) for dev/debug mode.
 */
export function isDebugMode(): boolean {
  try {
    // Try Vite's import.meta.env.DEV
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta typing is Vite-specific
    const importMetaDev = import.meta?.env?.DEV;
    if (importMetaDev) {
      return true;
    }
  } catch {
    // import.meta not available in this environment
  }

  try {
    // Try webpack/CRA process.env.NODE_ENV
    const proc = (globalThis as Record<string, unknown>)['process'] as { env?: { NODE_ENV?: string } } | undefined;
    if (proc?.env?.NODE_ENV === "development") {
      return true;
    }
  } catch {
    // process.env not available
  }

  return false;
}

/**
 * Interpolation text
 */
function interpolateText(text: string, args: unknown[]): string {
  if (args.length === 0) return text;
  return text.replace(/\{\{(\d+)\}\}/g, (match, index) => {
    const i = parseInt(index, 10) - 1;
    const val = args[i];
    return val == null ? match : String(val);
  });
}

/**
 * Create a translation function using provided maps
 * @returns A translation function
 * This function processes text using only dictionary lookups and basic string interpolation.
 * Note: handling pluralization is not supported now
 * @example
 * const t = createTranslationFunction('fr', commonMap, userMap);
 * const translated = t("Hello, {{1}}!", "world");
 */
export const createTranslationFunction = (
  language: string,
  commonMap: TranslationMap,
  userMap: TranslationMap,
) => {
  return (defaultText: string, ...args: unknown[]): string => {
    let translateText = defaultText;
    let translated = false;

    // Handle empty or invalid input
    if (!defaultText || typeof defaultText !== "string") {
      return String(defaultText || "");
    }

    const normalizedLang = typeof language === 'string' && language ? language.toLowerCase() : 'en';

    if (normalizedLang === "en") {
      translateText = defaultText;
      translated = true;
    } else {
      // Priority: user-defined > common translations
      if (defaultText in userMap) {
        translateText = userMap[defaultText];
        translated = true;
      } else if (defaultText in commonMap) {
        translateText = commonMap[defaultText];
        translated = true;
      } else {
        translateText = defaultText;
      }
    }

    translateText = interpolateText(translateText, args);

    if (!translated && isDebugMode()) {
      console.debug(
        `Missing translation for "${defaultText}" in language "${language}"`,
      );
    }
    return translateText;
  };
};

/**
 * Clear all caches
 */
export function clearTranslationCaches(): void {
  commonTranslationCache.clear();
  userTranslationCache.clear();
  userFailedSet.clear();
  cacheMetadata.clear();
}
