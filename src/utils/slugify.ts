const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    // Replace accents/diacritics
    .normalize("NFD").replace(/\p{Diacritic}+/gu, "")
    // Replace non-alphanumerics with hyphens
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
};

export default slugify;
