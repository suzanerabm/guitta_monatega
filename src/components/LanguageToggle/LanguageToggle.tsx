'use client';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface LanguageToggleProps {
  currentPath?: string;
}

export function LanguageToggle({ currentPath }: LanguageToggleProps) {
  const pathname = usePathname();
  // Derive current locale directly from the URL (not from useLocale, which can
  // be stale during soft navigation between locales).
  const fullPath = currentPath ?? pathname ?? '/pt';
  const match = fullPath.match(/^\/(pt|en)(?=\/|$)/);
  const currentLocale = match?.[1] ?? 'pt';
  const isEn = currentLocale === 'en';
  const targetLocale = isEn ? 'pt' : 'en';
  const pathWithoutLocale = fullPath.replace(/^\/(pt|en)(?=\/|$)/, '');
  const altPath = `/${targetLocale}${pathWithoutLocale || ''}`;
  // Show the CURRENT locale (clicking will switch to the other one)
  const label = isEn ? 'EN' : 'PT';

  // Plain anchor with inline styles + color: inherit so it picks up the
  // tinted color from the Header parent
  return (
    <NextLink
      href={altPath}
      style={{
        color: 'inherit',
        fontSize: '0.72rem',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        borderBottom: '1px solid currentColor',
        paddingBottom: '1px',
        textDecoration: 'none',
        transition: 'color 0.4s ease, opacity 0.2s ease',
      }}
    >
      {label}
    </NextLink>
  );
}
