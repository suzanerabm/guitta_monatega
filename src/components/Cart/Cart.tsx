'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { cartLayout } from '@/theme/cart';
import type { BookPrice } from '@/lib/books';

const STORAGE_KEY = 'guitta-studio-cart-v1';
const MAX_QUANTITY = 10;

export interface CartProduct {
  editionId: string;
  slug: string;
  title: string;
  format: string;
  cover: string | null;
  price: BookPrice;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  addItem: (product: CartProduct) => void;
  updateQuantity: (editionId: string, quantity: number) => void;
  removeItem: (editionId: string) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<CartItem>;
      return typeof candidate.editionId === 'string'
        && typeof candidate.slug === 'string'
        && typeof candidate.title === 'string'
        && typeof candidate.format === 'string'
        && typeof candidate.quantity === 'number'
        && candidate.quantity > 0
        && typeof candidate.price?.amount === 'number'
        && (candidate.price.currency === 'BRL' || candidate.price.currency === 'USD');
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      setItems(readStoredCart());
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  const addItem = useCallback((product: CartProduct) => {
    setItems((current) => {
      const existing = current.find((item) => item.editionId === product.editionId);
      if (!existing) return [...current, { ...product, quantity: 1 }];
      return current.map((item) => item.editionId === product.editionId
        ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
        : item);
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((editionId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((current) => current.map((item) => item.editionId === editionId
      ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
      : item));
  }, []);

  const removeItem = useCallback((editionId: string) => {
    setItems((current) => current.filter((item) => item.editionId !== editionId));
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    isOpen,
    addItem,
    updateQuantity,
    removeItem,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }), [addItem, isOpen, items, removeItem, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

function useOptionalCart() {
  return useContext(CartContext);
}

function formatPrice(price: BookPrice, locale: string) {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount);
}

export function CartTrigger() {
  const cart = useOptionalCart();
  if (!cart) return null;
  return <CartTriggerContent cart={cart} />;
}

function CartTriggerContent({ cart }: { cart: CartContextValue }) {
  const t = useTranslations('cart');

  return (
    <Box
      as="button"
      aria-label={t('open')}
      onClick={cart.openCart}
      position="relative"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      color="inherit"
      bg="transparent"
      border={0}
      p="sm"
      cursor="pointer"
    >
      <ShoppingBag size={cartLayout.triggerIconSize} strokeWidth={1.5} />
      {cart.itemCount > 0 && (
        <Flex
          as="span"
          position="absolute"
          top={0}
          right={0}
          minW="base"
          height="base"
          px="xs"
          align="center"
          justify="center"
          borderRadius="full"
          bg="ink"
          color="white"
          fontSize="xs"
          fontWeight="semibold"
          lineHeight={1}
        >
          {cart.itemCount}
        </Flex>
      )}
    </Box>
  );
}

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const locale = useLocale();
  const t = useTranslations('cart');
  const subtotal = items.reduce((total, item) => total + item.price.amount * item.quantity, 0);
  const currency = items[0]?.price.currency ?? 'BRL';

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeCart, isOpen]);

  if (!isOpen) return null;

  return (
    <Box position="fixed" inset={0} zIndex={300}>
      <Box
        position="absolute"
        inset={0}
        bg="bgOverlayHeavy"
        onClick={closeCart}
        aria-hidden="true"
      />
      <Flex
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        width={cartLayout.drawerWidth}
        bg="white"
        color="ink"
        direction="column"
        boxShadow="lg"
      >
        <Flex align="center" justify="space-between" p="lg" borderBottom="1px solid" borderColor="border">
          <Heading id="cart-title" as="h2" textStyle="heading" fontSize="h3">
            {t('title')}
          </Heading>
          <Box
            as="button"
            aria-label={t('close')}
            onClick={closeCart}
            display="inline-flex"
            color="ink"
            bg="transparent"
            border={0}
            p="sm"
            cursor="pointer"
          >
            <X size={cartLayout.triggerIconSize} />
          </Box>
        </Flex>

        {items.length === 0 ? (
          <Flex flex={1} direction="column" align="center" justify="center" px="xl" textAlign="center">
            <ShoppingBag size={cartLayout.triggerIconSize} strokeWidth={1.25} />
            <Text mt="md" fontSize="md" color="inkSoft">{t('empty')}</Text>
            <Button mt="lg" onClick={closeCart} bg="ink" color="white" px="xl">
              {t('continueShopping')}
            </Button>
          </Flex>
        ) : (
          <>
            <Box flex={1} overflowY="auto" p="lg">
              {items.map((item) => (
                <Flex key={item.editionId} gap="md" py="lg" borderBottom="1px solid" borderColor="border">
                  <Box
                    width={cartLayout.productImageWidth}
                    height={cartLayout.productImageHeight}
                    bg="surface"
                    flexShrink={0}
                  >
                    {item.cover && (
                      <Image src={item.cover} alt="" width="100%" height="100%" objectFit="contain" />
                    )}
                  </Box>
                  <Flex minW={0} flex={1} direction="column">
                    <Text fontSize="md" fontWeight="semibold" lineHeight={1.35}>{item.title}</Text>
                    <Text fontSize="sm" color="inkMuted" mt="xs">{item.format}</Text>
                    <Text fontSize="md" fontWeight="semibold" mt="sm">
                      {formatPrice(item.price, locale)}
                    </Text>
                    <Flex align="center" justify="space-between" mt="md">
                      <Flex align="center" border="1px solid" borderColor="border">
                        <Button
                          type="button"
                          aria-label={t('decrease', { title: item.title })}
                          onClick={() => updateQuantity(item.editionId, item.quantity - 1)}
                          disabled={item.quantity === 1}
                          minW={0}
                          height="auto"
                          p="sm"
                          bg="transparent"
                          border={0}
                          borderRadius={0}
                          color="ink"
                          cursor="pointer"
                          _hover={{ bg: 'borderSoft' }}
                          _disabled={{ color: 'subtle', cursor: 'not-allowed' }}
                        >
                          <Minus size={cartLayout.itemIconSize} />
                        </Button>
                        <Text
                          aria-live="polite"
                          minW={cartLayout.quantityValueWidth}
                          textAlign="center"
                          fontSize="sm"
                        >
                          {item.quantity}
                        </Text>
                        <Button
                          type="button"
                          aria-label={t('increase', { title: item.title })}
                          onClick={() => updateQuantity(item.editionId, item.quantity + 1)}
                          minW={0}
                          height="auto"
                          p="sm"
                          bg="transparent"
                          border={0}
                          borderRadius={0}
                          color="ink"
                          cursor="pointer"
                          _hover={{ bg: 'borderSoft' }}
                        >
                          <Plus size={cartLayout.itemIconSize} />
                        </Button>
                      </Flex>
                      <Button
                        type="button"
                        aria-label={t('remove', { title: `${item.title} — ${item.format}` })}
                        onClick={() => removeItem(item.editionId)}
                        minW={0}
                        height="auto"
                        p="sm"
                        bg="transparent"
                        border={0}
                        borderRadius={0}
                        color="inkMuted"
                        cursor="pointer"
                        _hover={{ bg: 'borderSoft', color: 'ink' }}
                        _active={{ bg: 'border' }}
                      >
                        <Trash2 size={cartLayout.itemIconSize} />
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Box>
            <Box p="lg" borderTop="1px solid" borderColor="border">
              <Flex justify="space-between" align="center">
                <Text fontSize="md" color="inkSoft">{t('subtotal')}</Text>
                <Text aria-live="polite" fontSize="xl" fontWeight="semibold">
                  {formatPrice({ amount: subtotal, currency }, locale)}
                </Text>
              </Flex>
              <Text fontSize="sm" color="inkMuted" mt="sm">{t('shippingNotice')}</Text>
              <Button width="100%" mt="lg" bg="ink" color="white" disabled>
                {t('checkoutPreparing')}
              </Button>
            </Box>
          </>
        )}
      </Flex>
    </Box>
  );
}
