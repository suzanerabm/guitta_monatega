/** Convert an author-facing label into the stable ASCII portion of an app ID. */
export function appIdSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/** IDs are readable, authorable and remain stable after their first assignment. */
export function semanticAppId(world, kind, label) {
  const slug = appIdSlug(label);
  if (!slug) throw Error(`Cannot create appId for ${world}/${kind}: missing semantic label`);
  return `${world}-${kind}-${slug}`;
}

export const APP_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
