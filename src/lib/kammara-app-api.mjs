/** Small public pages only; the build snapshot stays server-side. Apply WAF rate limits to this API. */
import { createHash } from 'node:crypto';

const PAGE_SIZE = 20;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function createContentApi(snapshot) {
  const entries = snapshot.files['catalog.json'].entries;
  const pages = [];
  for (let offset = 0; offset < entries.length; offset += PAGE_SIZE) {
    const items = entries.slice(offset, offset + PAGE_SIZE);
    pages.push({ schemaVersion: 1, index: pages.length, revision: hash(items), entries: items });
  }
  const manifest = { schemaVersion: 1, revision: snapshot.revision, pageSize: PAGE_SIZE, entryCount: entries.length,
    pages: pages.map(page => ({ index: page.index, revision: page.revision })),
    files: { ...snapshot.files, 'catalog.json': { ...snapshot.files['catalog.json'], entries: [] } } };
  function respond(body, request, revision) {
    const etag = `"${revision}"`;
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'ETag': etag,
      'Cache-Control': 'private, no-cache', 'X-Robots-Tag': 'noindex, nofollow' };
    return request.headers.get('if-none-match') === etag
      ? new Response(null, { status: 304, headers }) : Response.json(body, { headers });
  }
  return {
    manifest(request) {
      if ([...new URL(request.url).searchParams].length) return Response.json({ error: 'Invalid query' }, { status: 400 });
      return respond(manifest, request, snapshot.revision);
    },
    page(request) {
      const params = new URL(request.url).searchParams;
      if ([...params.keys()].some(key => key !== 'index' && key !== 'revision') || params.getAll('index').length !== 1 || params.getAll('revision').length !== 1)
        return Response.json({ error: 'Invalid query' }, { status: 400 });
      if (params.get('revision') !== snapshot.revision) return Response.json({ error: 'Content changed; reload manifest' }, { status: 409 });
      const index = params.get('index');
      if (!/^(0|[1-9]\d*)$/.test(index || '') || !pages[Number(index)]) return Response.json({ error: 'Page not found' }, { status: 404 });
      return respond(pages[Number(index)], request, pages[Number(index)].revision);
    },
  };
}
