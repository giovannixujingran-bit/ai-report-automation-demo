export function createI18n({ defaultLocale = "zh", resources = {} } = {}) {
  let currentLocale = resources[defaultLocale] ? defaultLocale : Object.keys(resources)[0] || defaultLocale;
  const listeners = new Set();

  function getValue(key, locale = currentLocale) {
    const parts = key.split(".");
    let cursor = resources[locale];
    for (const part of parts) {
      if (!cursor) return undefined;
      cursor = cursor[part];
    }
    return cursor;
  }

  function t(key, fallback = "", vars) {
    const template = getValue(key);
    if (template === undefined) {
      return interpolate(fallback || key, vars);
    }
    if (typeof template === "function") {
      return template(vars || {}, { locale: currentLocale });
    }
    return interpolate(template, vars);
  }

  function setLocale(locale) {
    if (!resources[locale] || locale === currentLocale) return false;
    currentLocale = locale;
    listeners.forEach((fn) => fn(locale));
    return true;
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    t,
    setLocale,
    getLocale: () => currentLocale,
    onChange,
    hasLocale: (locale) => Boolean(resources[locale])
  };
}

function interpolate(value, vars) {
  if (!value || !vars) return value;
  return String(value).replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] === undefined ? `{{${key}}}` : vars[key]
  );
}

