export const PRODUCT_CONTACT_SALE_LINK_TYPE_KEY = 'product_contact_sale_link_type';
export const PRODUCT_CONTACT_SALE_CUSTOM_URL_KEY = 'product_contact_sale_custom_url';

export type ProductContactSaleLinkType = 'contact-page' | 'zalo' | 'messenger' | 'phone' | 'custom';

export const DEFAULT_PRODUCT_CONTACT_SALE_LINK_TYPE: ProductContactSaleLinkType = 'contact-page';

export const PRODUCT_CONTACT_SALE_LINK_OPTIONS: Array<{ value: ProductContactSaleLinkType; label: string }> = [
  { value: 'contact-page', label: 'Trang liên hệ' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'phone', label: 'Gọi điện' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

export const PRODUCT_CONTACT_SALE_LINK_SETTING_KEYS = [
  PRODUCT_CONTACT_SALE_LINK_TYPE_KEY,
  PRODUCT_CONTACT_SALE_CUSTOM_URL_KEY,
  'contact_zalo',
  'contact_messenger',
  'contact_phone',
] as const;

export type ProductContactSaleLinkSettings = Partial<Record<(typeof PRODUCT_CONTACT_SALE_LINK_SETTING_KEYS)[number], unknown>>;

const CONTACT_PAGE_HREF = '/contact';

export function normalizeProductContactSaleLinkType(value: unknown): ProductContactSaleLinkType {
  return PRODUCT_CONTACT_SALE_LINK_OPTIONS.some((option) => option.value === value)
    ? value as ProductContactSaleLinkType
    : DEFAULT_PRODUCT_CONTACT_SALE_LINK_TYPE;
}

export function isValidProductContactSaleCustomUrl(value: string): boolean {
  const trimmed = value.trim();
  return (trimmed.startsWith('/') && !trimmed.startsWith('//'))
    || /^https?:\/\//i.test(trimmed)
    || /^tel:/i.test(trimmed)
    || /^mailto:/i.test(trimmed);
}

export function isInternalProductContactSaleHref(href: string): boolean {
  return (href.startsWith('/') && !href.startsWith('//')) || href.startsWith('#');
}

function getStringSetting(settings: ProductContactSaleLinkSettings | null | undefined, key: (typeof PRODUCT_CONTACT_SALE_LINK_SETTING_KEYS)[number]) {
  const value = settings?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeZaloHref(value: string): string {
  if (!value) {return '';}
  if (/^https?:\/\//i.test(value)) {return value;}
  if (/^zalo\.me\//i.test(value)) {return `https://${value}`;}
  return `https://zalo.me/${value.replace(/\s+/g, '')}`;
}

function normalizeMessengerHref(value: string): string {
  if (!value) {return '';}
  if (/^https?:\/\//i.test(value)) {return value;}
  if (/^m\.me\//i.test(value)) {return `https://${value}`;}
  return `https://m.me/${value.replace(/^@/, '').replace(/\s+/g, '')}`;
}

function normalizePhoneHref(value: string): string {
  if (!value) {return '';}
  if (/^tel:/i.test(value)) {return value;}
  return `tel:${value.replace(/\s+/g, '')}`;
}

export function resolveProductContactSaleHref(settings: ProductContactSaleLinkSettings | null | undefined): string {
  const type = normalizeProductContactSaleLinkType(settings?.[PRODUCT_CONTACT_SALE_LINK_TYPE_KEY]);

  if (type === 'zalo') {
    return normalizeZaloHref(getStringSetting(settings, 'contact_zalo')) || CONTACT_PAGE_HREF;
  }

  if (type === 'messenger') {
    return normalizeMessengerHref(getStringSetting(settings, 'contact_messenger')) || CONTACT_PAGE_HREF;
  }

  if (type === 'phone') {
    return normalizePhoneHref(getStringSetting(settings, 'contact_phone')) || CONTACT_PAGE_HREF;
  }

  if (type === 'custom') {
    const customUrl = getStringSetting(settings, PRODUCT_CONTACT_SALE_CUSTOM_URL_KEY);
    return isValidProductContactSaleCustomUrl(customUrl) ? customUrl : CONTACT_PAGE_HREF;
  }

  return CONTACT_PAGE_HREF;
}

export function navigateProductContactSaleHref(href: string, router: { push: (href: string) => void }) {
  if (isInternalProductContactSaleHref(href)) {
    router.push(href);
    return;
  }
  window.open(href, '_blank', 'noopener,noreferrer');
}
