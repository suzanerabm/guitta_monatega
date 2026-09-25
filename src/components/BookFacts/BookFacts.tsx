import { Box, Text } from '@chakra-ui/react';
import {
  Baby,
  Barcode,
  BookOpen,
  CalendarDays,
  File,
  Languages,
  Ruler,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import type { BookFacts as BookFactsData } from '@/lib/bookCatalog';
import { bookPageLayout } from '@/theme/bookPages';
import { HorizontalCardStrip } from '@/components/HorizontalCardStrip';

export interface BookFactsLabels {
  readingAge: string;
  pageCount: string;
  language: string;
  dimensions: string;
  weight: string;
  fileSize: string;
  publicationDate: string;
  isbn: string;
  pages: string;
}

interface BookFactsProps {
  facts: BookFactsData;
  labels: BookFactsLabels;
  accentColor: string;
  embedded?: boolean;
}

interface FactItem {
  key: keyof BookFactsData;
  label: string;
  value?: string | number;
  Icon: LucideIcon;
}

export function BookFacts({ facts, labels, accentColor, embedded = false }: BookFactsProps) {
  const possibleItems: FactItem[] = [
    { key: 'readingAge', label: labels.readingAge, value: facts.readingAge, Icon: Baby },
    {
      key: 'pageCount',
      label: labels.pageCount,
      value: facts.pageCount ? `${facts.pageCount} ${labels.pages}` : undefined,
      Icon: BookOpen,
    },
    { key: 'language', label: labels.language, value: facts.language, Icon: Languages },
    { key: 'dimensions', label: labels.dimensions, value: facts.dimensions, Icon: Ruler },
    { key: 'weight', label: labels.weight, value: facts.weight, Icon: Scale },
    { key: 'fileSize', label: labels.fileSize, value: facts.fileSize, Icon: File },
    {
      key: 'publicationDate',
      label: labels.publicationDate,
      value: facts.publicationDate,
      Icon: CalendarDays,
    },
    { key: 'isbn', label: labels.isbn, value: facts.isbn, Icon: Barcode },
  ];
  const items = possibleItems.filter((item) => item.value !== undefined);

  if (items.length === 0) return null;

  return (
    <Box
      as="dl"
      mt={embedded ? 'lg' : { base: '2xl', md: '3xl' }}
      mb={embedded ? '0' : { base: '2xl', md: '3xl' }}
    >
      <HorizontalCardStrip
        arrowColor={accentColor}
        arrowVariant="plain"
        gap="sm"
        cardPadding={{ base: 'sm', md: 'sm' }}
      >
        {items.map(({ key, label, value, Icon }) => (
          <Box
            key={key}
            width={bookPageLayout.factItemWidth}
            px="sm"
            py="md"
            textAlign="center"
          >
            <Box color={accentColor} display="flex" justifyContent="center" mb="sm" aria-hidden="true">
              <Icon size={bookPageLayout.factIconSize} strokeWidth={1.5} />
            </Box>
            <Text as="dt" fontSize="xs" color="inkMuted" letterSpacing="wide" textTransform="uppercase" mb="xs">
              {label}
            </Text>
            <Text as="dd" fontSize="sm" color="ink" fontWeight="semibold" lineHeight={1.45} m="0">
              {value}
            </Text>
          </Box>
        ))}
      </HorizontalCardStrip>
    </Box>
  );
}
