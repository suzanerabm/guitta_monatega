import { Box, Flex, Text, Heading } from '@chakra-ui/react';
import NextLink from 'next/link';

export interface HomeBannerProps {
  href: string;
  label: string;
  title: string;
  description: string;
  variant: 'bichittos' | 'kammara' | 'arte';
  fullWidth?: boolean;
  /** Optional height override. Defaults to {base:'70vh', md:'100vh'}. */
  height?: { base: string; md: string } | string;
  /** Optional minHeight override. Defaults to {base:'400px', md:'700px'}. */
  minHeight?: { base: string; md: string } | string;
  /** Optional title color override (ex: laranja zeco no Bichittos da home). */
  titleColor?: string;
  /** Optional label color override. */
  labelColor?: string;
  /** Optional description color override. */
  descriptionColor?: string;
  /** Optional order number shown at a corner of the banner. */
  order?: number;
  /** Corner for the order number. Defaults to 'right'. */
  orderSide?: 'left' | 'right';
}

import { palettes } from '@/theme/palettes';

// Home banner gradients. Bichittos/kammara/arte reuse the primary palette
// gradient so changing a palette automatically refreshes the banner.
const variantBg: Record<HomeBannerProps['variant'], string> = {
  bichittos: palettes.bichittos.gradient,
  kammara: palettes.kammara.gradient,
  arte: palettes.arte.gradient,
};

const variantAnimation: Record<HomeBannerProps['variant'], string | undefined> = {
  bichittos: 'fluidBichittos 12s ease-in-out infinite',
  kammara: 'fluidKammara 15s ease-in-out infinite',
  arte: undefined,
};

export function HomeBanner({
  href,
  label,
  title,
  description,
  variant,
  fullWidth = false,
  height = { base: '70vh', md: '100vh' },
  minHeight = { base: '400px', md: '700px' },
  titleColor,
  labelColor,
  descriptionColor,
  order,
  orderSide = 'right',
}: HomeBannerProps) {
  const isArte = variant === 'arte';

  return (
    <NextLink
      href={href}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <Box
        as="section"
        position="relative"
        width={fullWidth ? '100vw' : '100%'}
        height={height}
        minHeight={minHeight}
        overflow="hidden"
        cursor="pointer"
        css={{
          '&:hover .banner-bg': { transform: 'scale(1.03)' },
        }}
      >
        {/* Background */}
        <Box
          className="banner-bg"
          data-bannerbg
          position="absolute"
          top="-10%"
          left={0}
          width="100%"
          height="120%"
          background={variantBg[variant]}
          backgroundSize="400% 400%"
          backgroundPosition="center"
          transition="transform 0.6s ease"
          animation={variantAnimation[variant]}
          css={
            variant === 'bichittos'
              ? {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(255,107,157,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(109,213,250,0.2) 0%, transparent 50%)',
                    animation: 'glowShift 8s ease-in-out infinite alternate',
                  },
                }
              : variant === 'kammara'
                ? {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(ellipse at 25% 40%, rgba(100,80,200,0.2) 0%, transparent 60%), radial-gradient(ellipse at 75% 60%, rgba(15,52,96,0.2) 0%, transparent 50%)',
                      animation: 'glowShift 10s ease-in-out infinite alternate',
                    },
                  }
                : undefined
          }
        />

        {/* Bichittos shapes */}
        {variant === 'bichittos' && (
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            overflow="hidden"
            css={{
              '& .shape': {
                position: 'absolute',
                borderRadius: '50%',
                opacity: 0.08,
                animation: 'shapeFloat 8s ease-in-out infinite',
              },
              '& .shape:nth-of-type(1)': {
                width: '180px',
                height: '180px',
                background: 'rgba(255,255,255,0.5)',
                top: '10%',
                left: '5%',
                filter: 'blur(30px)',
              },
              '& .shape:nth-of-type(2)': {
                width: '120px',
                height: '120px',
                background: 'rgba(255,107,157,0.4)',
                top: '55%',
                left: '70%',
                animationDelay: '2s',
                filter: 'blur(25px)',
              },
              '& .shape:nth-of-type(3)': {
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.3)',
                top: '25%',
                right: '10%',
                animationDelay: '4s',
                filter: 'blur(20px)',
              },
              '& .shape:nth-of-type(4)': {
                width: '150px',
                height: '150px',
                background: 'rgba(255,226,89,0.3)',
                bottom: '15%',
                left: '20%',
                animationDelay: '2s',
                borderRadius: '40%',
              },
              '& .shape:nth-of-type(5)': {
                width: '90px',
                height: '90px',
                background: 'rgba(109,213,250,0.3)',
                top: '65%',
                left: '45%',
                animationDelay: '3s',
                filter: 'blur(20px)',
              },
            }}
          >
            <div className="shape" />
            <div className="shape" />
            <div className="shape" />
            <div className="shape" />
            <div className="shape" />
          </Box>
        )}

        {/* Kammara stars + glow */}
        {variant === 'kammara' && (
          <>
            <Box
              position="absolute"
              inset={0}
              pointerEvents="none"
              overflow="hidden"
              css={{
                '& .star': {
                  position: 'absolute',
                  background: '#ffffff',
                  borderRadius: '50%',
                  width: '2px',
                  height: '2px',
                  animation: 'starTwinkle 4s ease-in-out infinite',
                },
                '& .star:nth-of-type(1)': { top: '12%', left: '8%' },
                '& .star:nth-of-type(2)': {
                  width: '3px',
                  height: '3px',
                  top: '25%',
                  left: '45%',
                  animationDelay: '0.7s',
                },
                '& .star:nth-of-type(3)': {
                  width: '1.5px',
                  height: '1.5px',
                  top: '18%',
                  right: '20%',
                  animationDelay: '1.4s',
                },
                '& .star:nth-of-type(4)': {
                  width: '2.5px',
                  height: '2.5px',
                  top: '40%',
                  left: '25%',
                  animationDelay: '2s',
                },
                '& .star:nth-of-type(5)': {
                  top: '55%',
                  right: '35%',
                  animationDelay: '2.8s',
                },
                '& .star:nth-of-type(6)': {
                  width: '3px',
                  height: '3px',
                  top: '35%',
                  right: '10%',
                  animationDelay: '1s',
                },
                '& .star:nth-of-type(7)': {
                  width: '1.5px',
                  height: '1.5px',
                  top: '65%',
                  left: '60%',
                  animationDelay: '3.5s',
                },
                '& .star:nth-of-type(8)': {
                  top: '75%',
                  left: '15%',
                  animationDelay: '1.2s',
                },
                '& .star:nth-of-type(9)': {
                  width: '2.5px',
                  height: '2.5px',
                  top: '50%',
                  left: '80%',
                  animationDelay: '0.3s',
                },
                '& .star:nth-of-type(10)': {
                  top: '80%',
                  right: '25%',
                  animationDelay: '1.8s',
                },
              }}
            >
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
              <div className="star" />
            </Box>
            <Box
              position="absolute"
              width="250px"
              height="250px"
              borderRadius="50%"
              top="25%"
              left="50%"
              transform="translateX(-50%)"
              background="radial-gradient(circle, rgba(100,80,200,0.2) 0%, rgba(60,60,180,0.05) 50%, transparent 70%)"
              animation="kammaraGlow 8s ease-in-out infinite"
              pointerEvents="none"
              filter="blur(15px)"
            />
          </>
        )}

        {/* Arte strokes */}
        {variant === 'arte' && (
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            overflow="hidden"
            css={{
              '& .stroke': {
                position: 'absolute',
                background:
                  'linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)',
                height: '1px',
                animation: 'strokeDraw 4s ease-in-out infinite',
              },
              '& .stroke:nth-of-type(1)': { width: '40%', top: '25%', left: '5%' },
              '& .stroke:nth-of-type(2)': {
                width: '30%',
                top: '45%',
                right: '10%',
                animationDelay: '1s',
              },
              '& .stroke:nth-of-type(3)': {
                width: '50%',
                top: '65%',
                left: '15%',
                animationDelay: '2s',
              },
              '& .stroke:nth-of-type(4)': {
                width: '25%',
                top: '35%',
                left: '40%',
                animationDelay: '0.5s',
                transform: 'rotate(45deg)',
              },
              '& .stroke:nth-of-type(5)': {
                width: '35%',
                top: '55%',
                right: '5%',
                animationDelay: '1.5s',
                transform: 'rotate(-15deg)',
              },
            }}
          >
            <div className="stroke" />
            <div className="stroke" />
            <div className="stroke" />
            <div className="stroke" />
            <div className="stroke" />
          </Box>
        )}

        {/* Overlay content */}
        <Flex
          data-textblock
          position="absolute"
          inset={0}
          direction="column"
          align="center"
          justify="center"
          gap="clamp(0.3rem, 0.8vw, 0.8rem)"
          zIndex={1}
          transition="transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)"
        >
          <Text
            fontSize="bannerLabel"
            letterSpacing="widest"
            textTransform="uppercase"
            color={labelColor ?? (isArte ? 'arteLabel' : 'bannerLabel')}
            fontWeight="regular"
            transition="color 0.4s ease"
          >
            {label}
          </Text>
          <Heading
            as="h2"
            fontSize="h2"
            fontWeight="bold"
            color={titleColor ?? (isArte ? 'ink' : 'white')}
            letterSpacing="normal"
            textTransform="uppercase"
            textAlign="center"
            lineHeight={1.05}
            textShadow={isArte ? 'none' : 'text'}
            transition="color 0.4s ease"
          >
            {title}
          </Heading>
          <Text
            fontSize="bannerDesc"
            color={descriptionColor ?? (isArte ? 'arteDesc' : 'bannerDesc')}
            fontWeight="light"
            maxW="400px"
            textAlign="center"
            lineHeight={1.5}
            transition="color 0.4s ease"
          >
            {description}
          </Text>
        </Flex>

        {order !== undefined && (
          <Text
            position="absolute"
            bottom="70px"
            left={orderSide === 'left' ? '70px' : 'auto'}
            right={orderSide === 'right' ? '70px' : 'auto'}
            fontSize="bannerOrder"
            fontWeight="bold"
            color={isArte ? 'ink' : 'white'}
            opacity={0.85}
            lineHeight={1}
            textShadow={isArte ? 'none' : 'text'}
            zIndex={2}
            pointerEvents="none"
          >
            {order}
          </Text>
        )}
      </Box>
    </NextLink>
  );
}
