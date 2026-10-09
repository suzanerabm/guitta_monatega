import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { mediaUrl } from '@/lib/media';
import { palettes } from '@/theme/palettes';

const pituImage = mediaUrl('/imgs/bichittos/taylo/pitu_chorando.png');

export function NotFoundContent({ locale }: { locale: 'pt' | 'en' }) {
  const copy = locale === 'en'
    ? {
        imageAlt: 'Pitu crying because he could not find the page',
        eyebrow: 'error 404',
        title: 'Oops… Pitu lost this page.',
        description: 'It may have moved somewhere else or gone looking for stars with Taylo.',
        home: 'back home',
        taylo: 'find Taylo and Pitu',
      }
    : {
        imageAlt: 'Pitu chorando porque não encontrou a página',
        eyebrow: 'erro 404',
        title: 'Ops… o Pitu perdeu esta página.',
        description: 'Ela pode ter mudado de lugar ou saído para procurar estrelas com o Taylo.',
        home: 'voltar para casa',
        taylo: 'encontrar Taylo e Pitu',
      };
  const taylo = palettes.taylo;

  return (
    <Flex
      as="main"
      minH="100vh"
      align="center"
      justify="center"
      background={taylo.gradientBg}
      px="lg"
      py="2xl"
      color="ink"
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="center"
        gap={{ base: 'lg', md: '3xl' }}
        width="100%"
        maxW="4xl"
        bg="overlayLightSoft"
        borderWidth="thin"
        borderColor={taylo.colors[0]}
        borderRadius="3xl"
        boxShadow="lg"
        px={{ base: 'lg', md: '3xl' }}
        py={{ base: 'xl', md: '3xl' }}
        overflow="hidden"
      >
        <Box width={{ base: '60%', md: '40%' }} maxW="sm" flexShrink={0}>
          <Image
            src={pituImage}
            alt={copy.imageAlt}
            width="100%"
            height="auto"
            objectFit="contain"
          />
        </Box>

        <Flex direction="column" align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }}>
          <Text
            m={0}
            color={taylo.colors[1]}
            fontSize="sm"
            fontWeight="semibold"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            {copy.eyebrow}
          </Text>
          <Heading
            as="h1"
            mt="sm"
            mb="md"
            fontFamily="heading"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="semibold"
            lineHeight="tight"
            color={taylo.colors[5]}
          >
            {copy.title}
          </Heading>
          <Text m={0} maxW="xl" fontSize="md" fontWeight="light" lineHeight="relaxed" color="inkSoft">
            {copy.description}
          </Text>

          <Flex mt="xl" gap="md" align="center" justify={{ base: 'center', md: 'flex-start' }} flexWrap="wrap">
            <NextLink href={`/${locale}`} style={{ textDecoration: 'none' }}>
              <Box
                as="span"
                display="inline-flex"
                borderWidth="thin"
                borderColor={taylo.colors[5]}
                borderRadius="full"
                bg={taylo.colors[5]}
                color="offWhite"
                px="lg"
                py="md"
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="wide"
                textTransform="uppercase"
                transitionProperty="opacity"
                transitionDuration="default"
                _hover={{ opacity: 0.72 }}
              >
                {copy.home}
              </Box>
            </NextLink>
            <NextLink href={`/${locale}/bichittos?bichitto=taylo`} style={{ textDecoration: 'none' }}>
              <Box
                as="span"
                display="inline-flex"
                borderWidth="thin"
                borderColor={taylo.colors[5]}
                borderRadius="full"
                color={taylo.colors[5]}
                px="lg"
                py="md"
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="wide"
                textTransform="uppercase"
                transitionProperty="opacity"
                transitionDuration="default"
                _hover={{ opacity: 0.72 }}
              >
                {copy.taylo}
              </Box>
            </NextLink>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function NotFound() {
  return <NotFoundContent locale="pt" />;
}
