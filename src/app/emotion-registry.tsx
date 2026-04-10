'use client';

/**
 * Emotion SSR style registry for Next.js App Router.
 *
 * Chakra v3 uses Emotion under the hood but doesn't ship its own registry.
 * Without this wrapper the global styles Chakra injects on the server end up
 * in a different position than on the client, producing hydration mismatches
 * like `+ <header> - <style data-emotion="css-global">`.
 *
 * Pattern follows the Next docs for CSS-in-JS + the Chakra v3 "nextjs-app-guide".
 */
import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache: EmotionCache = createCache({ key: 'css' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
