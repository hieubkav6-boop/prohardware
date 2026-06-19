'use client';

import React, { useMemo, useState } from 'react';
import { Download, GripVertical, LayoutGrid, Link2, Plus, Share2, Trash2 } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { IA_SETTINGS_KEYS } from '@/lib/ia/settings';
import {
  Button,
  Card,
  CardContent,
  Label,
  cn,
} from '../../../components/ui';
import { SettingsImageUploader } from '../../../components/SettingsImageUploader';
import { InputWithClear } from '../../stats/_components/InputWithClear';
import { CollapsibleSubSection as SubSection } from '../../_shared/components/CollapsibleSubSection';
import { HomeComponentDisplaySettingsSection } from '../../_shared/components/HomeComponentDisplaySettingsSection';
import { useFormSectionsState } from '../../_shared/hooks/useFormSectionsState';
import { FormSectionsToggleAllButton } from '../../_shared/components/FormSectionsToggleAllButton';
import { getFooterLayoutColors } from '../_lib/colors';
import { generateFooterConfigFromData } from '../_lib/auto-generate';
import type { FooterBrandMode, FooterConfig, FooterColumn, FooterLogoBackgroundStyle, FooterSocialLink } from '../_types';
import { AiDemoFooterImport } from '../../product-list/_components/AiDemoProductsImport';
import { QuickRoutePickerModal, type QuickRouteOption } from '@/app/admin/components/QuickRoutePickerModal';

interface FooterFormProps {
  value: FooterConfig;
  onChange: (next: FooterConfig) => void;
  primary: string;
  secondary: string;
  mode: FooterBrandMode;
  /** create = mở hết, edit = đóng hết */
  defaultExpanded?: boolean;
}

type PickerTarget =
  | { type: 'column'; columnId: number | string }
  | { type: 'link'; columnId: number | string; linkIndex: number };

const SOCIAL_PLATFORMS = [
  { icon: 'facebook', key: 'facebook', label: 'Facebook' },
  { icon: 'instagram', key: 'instagram', label: 'Instagram' },
  { icon: 'youtube', key: 'youtube', label: 'Youtube' },
  { icon: 'tiktok', key: 'tiktok', label: 'TikTok' },
  { icon: 'zalo', key: 'zalo', label: 'Zalo' },
  { icon: 'messenger', key: 'messenger', label: 'Messenger' },
  { icon: 'x', key: 'x', label: 'X (Twitter)' },
  { icon: 'telegram', key: 'telegram', label: 'Telegram' },
  { icon: 'shopee', key: 'shopee', label: 'Shopee' },
  { icon: 'lazada', key: 'lazada', label: 'Lazada' },
  { icon: 'tiki', key: 'tiki', label: 'Tiki' },
  { icon: 'pinterest', key: 'pinterest', label: 'Pinterest' },
  { icon: 'linkedin', key: 'linkedin', label: 'LinkedIn' },
  { icon: 'github', key: 'github', label: 'GitHub' },
  { icon: 'phone', key: 'phone', label: 'Điện thoại' },
  { icon: 'mail', key: 'mail', label: 'Email' },
  { icon: 'map-pin', key: 'map-pin', label: 'Địa chỉ' },
];

const normalizePhoneUrl = (value: string) => value.startsWith('tel:') ? value : `tel:${value.replace(/\s+/g, '')}`;
const normalizeEmailUrl = (value: string) => value.startsWith('mailto:') ? value : `mailto:${value}`;
const normalizeMapUrl = (value: string) =>
  /^https?:\/\//.test(value) ? value : `https://maps.google.com/?q=${encodeURIComponent(value)}`;
const normalizeZaloUrl = (value: string) => {
  if (/^https?:\/\//.test(value)) return value;
  return `https://zalo.me/${value.replace(/\s+/g, '')}`;
};
const getSocialPlaceholder = (platform: string) => {
  switch (platform) {
    case 'phone': return 'tel:0123456789';
    case 'mail': return 'mailto:contact@example.com';
    case 'zalo': return 'https://zalo.me/...';
    case 'messenger': return 'https://m.me/...';
    case 'map-pin': return 'https://maps.google.com/...';
    case 'shopee': return 'https://shopee.vn/...';
    case 'lazada': return 'https://lazada.vn/...';
    case 'tiki': return 'https://tiki.vn/...';
    default: return 'https://...';
  }
};

const MAX_WIDTH_OPTIONS = [
  { value: '6xl', label: '6xl' },
  { value: '7xl', label: '7xl' },
  { value: '8xl', label: '8xl' },
  { value: '9xl', label: '9xl' },
] as const;

const LOGO_BACKGROUND_OPTIONS: { value: FooterLogoBackgroundStyle; label: string }[] = [
  { value: 'none', label: 'Không nền' },
  { value: 'flat-light', label: 'Nền sáng phẳng' },
  { value: 'flat-dark', label: 'Nền tối phẳng' },
  { value: 'flat-brand', label: 'Nền brand nhạt' },
];

const CORE_ROUTE_OPTIONS: QuickRouteOption[] = [
  { label: 'Trang chủ', url: '/', source: 'core', group: 'Trang cơ bản' },
  { label: 'Liên hệ', url: '/contact', source: 'core', group: 'Trang cơ bản' },
];

const MODULE_SITE_ROUTE_CATALOG: Record<string, { label: string; url: string }[]> = {
  cart: [{ label: 'Giỏ hàng', url: '/cart' }],
  customers: [
    { label: 'Đăng nhập', url: '/account/login' },
    { label: 'Đăng ký', url: '/account/register' },
    { label: 'Tài khoản', url: '/account/profile' },
    { label: 'Đơn hàng', url: '/account/orders' },
  ],
  orders: [
    { label: 'Đơn hàng', url: '/account/orders' },
    { label: 'Checkout', url: '/checkout' },
  ],
  posts: [{ label: 'Danh sách bài viết', url: '/posts' }],
  products: [{ label: 'Danh sách sản phẩm', url: '/products' }],
  promotions: [{ label: 'Khuyến mãi', url: '/promotions' }],
  services: [{ label: 'Danh sách dịch vụ', url: '/services' }],
  wishlist: [{ label: 'Wishlist', url: '/wishlist' }],
};

const STATIC_QUICK_ROUTE_OPTIONS: QuickRouteOption[] = [
  ...CORE_ROUTE_OPTIONS,
  ...Object.entries(MODULE_SITE_ROUTE_CATALOG).flatMap(([moduleKey, routes]) =>
    routes.map((route) => ({
      ...route,
      source: moduleKey,
      group: 'Module' as const,
    }))
  ),
];

const getNextId = (items: Array<{ id?: number | string }>) => {
  const max = items.reduce((acc, item) => {
    const asNumber = typeof item.id === 'number' ? item.id : Number(item.id);
    return Number.isFinite(asNumber) ? Math.max(acc, asNumber) : acc;
  }, 0);
  return max + 1;
};

const buildSuggestedColumns = (quickRouteOptions: QuickRouteOption[], columnCount: 2 | 4): FooterColumn[] => {
  const coreRoutes = quickRouteOptions.filter((option) => option.group === 'Trang cơ bản').slice(0, columnCount === 2 ? 4 : 3);
  const productRoutes = quickRouteOptions.filter((option) => option.source === 'products').slice(0, 4);
  const serviceRoutes = quickRouteOptions.filter((option) => option.source === 'services').slice(0, 4);
  const postRoutes = quickRouteOptions.filter((option) => option.source === 'posts').slice(0, 4);
  const accountRoutes = quickRouteOptions.filter((option) => ['customers', 'orders', 'wishlist', 'cart'].includes(option.source)).slice(0, 4);
  const promoRoutes = quickRouteOptions.filter((option) => option.source === 'promotions').slice(0, 3);

  const toLinks = (options: QuickRouteOption[]) => options.map((option) => ({ label: option.label, url: option.url }));

  if (columnCount === 2) {
    const firstColumn = [...coreRoutes, ...accountRoutes].slice(0, 5);
    const secondColumn = [...productRoutes, ...serviceRoutes, ...postRoutes, ...promoRoutes].slice(0, 5);

    return [
      {
        id: 1,
        title: 'Thông tin',
        links: toLinks(firstColumn.length > 0 ? firstColumn : CORE_ROUTE_OPTIONS),
      },
      {
        id: 2,
        title: 'Khám phá',
        links: toLinks(secondColumn.length > 0 ? secondColumn : quickRouteOptions.filter((option) => option.group !== 'Trang cơ bản').slice(0, 5)),
      },
    ];
  }

  const columns: FooterColumn[] = [
    { id: 1, title: 'Thông tin', links: toLinks(coreRoutes.length > 0 ? coreRoutes : CORE_ROUTE_OPTIONS) },
    { id: 2, title: 'Sản phẩm', links: toLinks(productRoutes.length > 0 ? productRoutes : accountRoutes.slice(0, 4)) },
    { id: 3, title: 'Dịch vụ', links: toLinks(serviceRoutes.length > 0 ? serviceRoutes : postRoutes.slice(0, 4)) },
    { id: 4, title: 'Tin tức', links: toLinks(postRoutes.length > 0 ? postRoutes : promoRoutes.slice(0, 3)) },
  ];

  return columns.map((column, index) => ({
    ...column,
    id: index + 1,
    links: column.links.length > 0 ? column.links : [{ label: 'Trang chủ', url: '/' }],
  }));
};

const activeSections = ['settings', 'basicInfo', 'bct', 'columns', 'socials'];

export function FooterForm({ value, onChange, primary, secondary, mode, defaultExpanded = true }: FooterFormProps) {
  const { openSections, toggleSection, hasClosedSection, handleToggleAll } = useFormSectionsState(activeSections, defaultExpanded);
  const footerSettings = useQuery(api.settings.getMultiple, {
    keys: [
      ...IA_SETTINGS_KEYS,
      'contact_zalo',
      'site_logo',
      'site_name',
      'site_tagline',
      'social_facebook',
      'social_instagram',
      'social_tiktok',
      'social_youtube',
      'contact_phone',
      'contact_email',
      'contact_address',
      'contact_messenger',
    ],
  });
  const trustPagesFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'settings', featureKey: 'enableTrustPages' });

  const columnsWithId = useMemo<FooterColumn[]>(() => (value.columns ?? []).map((column, index) => ({
    ...column,
    id: column.id ?? index + 1,
    links: column.links ?? [],
  })), [value.columns]);

  const socialsWithId = useMemo<FooterSocialLink[]>(() => value.socialLinks.map((social, index) => ({
    ...social,
    id: social.id ?? index + 1,
  })), [value.socialLinks]);

  const [draggedColumnId, setDraggedColumnId] = useState<number | string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<number | string | null>(null);
  const [draggedSocialId, setDraggedSocialId] = useState<number | string | null>(null);
  const [dragOverSocialId, setDragOverSocialId] = useState<number | string | null>(null);
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  const colors = useMemo(() => getFooterLayoutColors(value.style ?? 'classic', primary, secondary, mode), [mode, primary, secondary, value.style]);
  const bctLogoType = value.bctLogoType ?? 'thong-bao';
  const bctLogoSrc = bctLogoType === 'dang-ky'
    ? '/images/bct/logo-da-dang-ky-bct.webp'
    : '/images/bct/logo-da-thong-bao-bct.png';
  const logoSizeLevel = value.logoSizeLevel ?? 1;
  const maxWidth = value.maxWidth ?? '7xl';

  const updateConfig = (patch: Partial<FooterConfig>) => {
    onChange({ ...value, ...patch });
  };



  const loadFromSettings = () => {
    const newSocialLinks: FooterSocialLink[] = [];
    let idCounter = 1;

    if (typeof footerSettings?.social_facebook === 'string' && footerSettings.social_facebook) {
      newSocialLinks.push({ icon: 'facebook', id: idCounter++, platform: 'facebook', url: footerSettings.social_facebook.trim() });
    }
    if (typeof footerSettings?.social_instagram === 'string' && footerSettings.social_instagram) {
      newSocialLinks.push({ icon: 'instagram', id: idCounter++, platform: 'instagram', url: footerSettings.social_instagram.trim() });
    }
    if (typeof footerSettings?.social_youtube === 'string' && footerSettings.social_youtube) {
      newSocialLinks.push({ icon: 'youtube', id: idCounter++, platform: 'youtube', url: footerSettings.social_youtube.trim() });
    }
    if (typeof footerSettings?.social_tiktok === 'string' && footerSettings.social_tiktok) {
      newSocialLinks.push({ icon: 'tiktok', id: idCounter++, platform: 'tiktok', url: footerSettings.social_tiktok.trim() });
    }
    if (typeof footerSettings?.contact_zalo === 'string' && footerSettings.contact_zalo) {
      newSocialLinks.push({ icon: 'zalo', id: idCounter++, platform: 'zalo', url: normalizeZaloUrl(footerSettings.contact_zalo) });
    }
    if (typeof footerSettings?.contact_messenger === 'string' && footerSettings.contact_messenger) {
      newSocialLinks.push({ icon: 'messenger', id: idCounter++, platform: 'messenger', url: footerSettings.contact_messenger.trim() });
    }
    if (typeof footerSettings?.contact_phone === 'string' && footerSettings.contact_phone) {
      newSocialLinks.push({ icon: 'phone', id: idCounter++, platform: 'phone', url: normalizePhoneUrl(footerSettings.contact_phone) });
    }
    if (typeof footerSettings?.contact_email === 'string' && footerSettings.contact_email) {
      newSocialLinks.push({ icon: 'mail', id: idCounter++, platform: 'mail', url: normalizeEmailUrl(footerSettings.contact_email) });
    }
    if (typeof footerSettings?.contact_address === 'string' && footerSettings.contact_address) {
      newSocialLinks.push({ icon: 'map-pin', id: idCounter++, platform: 'map-pin', url: normalizeMapUrl(footerSettings.contact_address) });
    }

    updateConfig({
      description: (typeof footerSettings?.site_tagline === 'string' && footerSettings.site_tagline) || value.description,
      logo: (typeof footerSettings?.site_logo === 'string' && footerSettings.site_logo) || value.logo,
      logoName: (typeof footerSettings?.site_name === 'string' && footerSettings.site_name) || value.logoName,
      socialLinks: newSocialLinks.length > 0 ? newSocialLinks : socialsWithId,
    });
    toast.success('Đã load dữ liệu từ Settings');
  };

  const handleGenerateFooter = () => {
    if ((trustPagesFeature?.enabled ?? true) === false) {
      toast.error('Trang tin cậy đang tắt ở System Settings');
      return;
    }
    if (!footerSettings) {
      toast.error('Dữ liệu settings chưa sẵn sàng');
      return;
    }

    const generated = generateFooterConfigFromData({
      settings: footerSettings,
      style: value.style,
    });

    updateConfig(generated.patch);

    if (generated.summary.missingTrustKeys.length > 0) {
      toast.warning(`Đã sinh ${generated.summary.totalLinks} links | cột ${generated.summary.balance.join('/')} | loại trùng ${generated.summary.dedupedCount}. Thiếu mapping: ${generated.summary.missingTrustKeys.join(', ')}`);
      return;
    }

    toast.success(`Đã sinh ${generated.summary.totalLinks} links với ${generated.summary.generatedColumns} cột | balance ${generated.summary.balance.join('/')}${generated.summary.dedupedCount > 0 ? ` | loại trùng ${generated.summary.dedupedCount}` : ''}`);
  };

  const handleColumnDragStart = (columnId: number | string) => { setDraggedColumnId(columnId); };
  const handleColumnDragEnd = () => { setDraggedColumnId(null); setDragOverColumnId(null); };
  const handleColumnDragOver = (e: React.DragEvent, columnId: number | string) => {
    e.preventDefault();
    if (draggedColumnId !== columnId) {setDragOverColumnId(columnId);}
  };
  const handleColumnDrop = (e: React.DragEvent, targetId: number | string) => {
    e.preventDefault();
    if (!draggedColumnId || draggedColumnId === targetId) {return;}
    const newColumns = [...columnsWithId];
    const draggedIndex = newColumns.findIndex((c) => c.id === draggedColumnId);
    const targetIndex = newColumns.findIndex((c) => c.id === targetId);
    const [moved] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, moved);
    updateConfig({ columns: newColumns });
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleSocialDragStart = (socialId: number | string) => { setDraggedSocialId(socialId); };
  const handleSocialDragEnd = () => { setDraggedSocialId(null); setDragOverSocialId(null); };
  const handleSocialDragOver = (e: React.DragEvent, socialId: number | string) => {
    e.preventDefault();
    if (draggedSocialId !== socialId) {setDragOverSocialId(socialId);}
  };
  const handleSocialDrop = (e: React.DragEvent, targetId: number | string) => {
    e.preventDefault();
    if (!draggedSocialId || draggedSocialId === targetId) {return;}
    const newSocials = [...socialsWithId];
    const draggedIndex = newSocials.findIndex((s) => s.id === draggedSocialId);
    const targetIndex = newSocials.findIndex((s) => s.id === targetId);
    const [moved] = newSocials.splice(draggedIndex, 1);
    newSocials.splice(targetIndex, 0, moved);
    updateConfig({ socialLinks: newSocials });
    setDraggedSocialId(null);
    setDragOverSocialId(null);
  };

  const addColumn = () => {
    const newId = getNextId(columnsWithId);
    updateConfig({
      columns: [...columnsWithId, { id: newId, links: [{ label: 'Link mới', url: '#' }], title: `Cột ${newId}` }],
    });
  };

  const applySuggestedColumns = (columnCount: 2 | 4) => {
    updateConfig({ columns: buildSuggestedColumns(STATIC_QUICK_ROUTE_OPTIONS, columnCount) });
    toast.success(`Đã áp dụng gợi ý ${columnCount} cột`);
  };

  const removeColumn = (columnId: number | string) => {
    updateConfig({
      columns: columnsWithId.filter((c) => c.id !== columnId),
    });
  };

  const updateColumn = (columnId: number | string, field: 'title', valueInput: string) => {
    updateConfig({
      columns: columnsWithId.map((c) => c.id === columnId ? { ...c, [field]: valueInput } : c),
    });
  };

  const addLink = (columnId: number | string) => {
    updateConfig({
      columns: columnsWithId.map((c) => (
        c.id === columnId ? { ...c, links: [...c.links, { label: 'Link mới', url: '#' }] } : c
      )),
    });
  };

  const removeLink = (columnId: number | string, linkIndex: number) => {
    updateConfig({
      columns: columnsWithId.map((c) => (
        c.id === columnId ? { ...c, links: c.links.filter((_, idx) => idx !== linkIndex) } : c
      )),
    });
  };

  const updateLink = (columnId: number | string, linkIndex: number, field: 'label' | 'url', valueInput: string) => {
    updateConfig({
      columns: columnsWithId.map((c) => (
        c.id === columnId
          ? {
            ...c,
            links: c.links.map((link, idx) => idx === linkIndex ? { ...link, [field]: valueInput } : link),
          }
          : c
      )),
    });
  };

  const handleOpenQuickPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setIsQuickPickerOpen(true);
  };

  const handleCloseQuickPicker = () => {
    setIsQuickPickerOpen(false);
    setPickerTarget(null);
  };

  const handleSelectQuickRoute = (option: QuickRouteOption) => {
    if (!pickerTarget) {return;}

    if (pickerTarget.type === 'link') {
      updateConfig({
        columns: columnsWithId.map((column) => (
          column.id === pickerTarget.columnId
            ? {
              ...column,
              links: column.links.map((link, index) => (
                index === pickerTarget.linkIndex
                  ? { ...link, label: option.label, url: option.url }
                  : link
              )),
            }
            : column
        )),
      });
    } else {
      updateConfig({
        columns: columnsWithId.map((column) => (
          column.id === pickerTarget.columnId
            ? { ...column, links: [...column.links, { label: option.label, url: option.url }] }
            : column
        )),
      });
    }

    handleCloseQuickPicker();
  };

  const addSocialLink = () => {
    const usedPlatforms = new Set(socialsWithId.map((s) => s.platform));
    const availablePlatform = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p.key));
    if (!availablePlatform) {
      toast.error('Đã thêm đủ tất cả mạng xã hội');
      return;
    }
    const newId = getNextId(socialsWithId);
    updateConfig({
      socialLinks: [...socialsWithId, { icon: availablePlatform.icon, id: newId, platform: availablePlatform.key, url: '' }],
    });
  };

  const removeSocialLink = (id: number | string) => {
    updateConfig({
      socialLinks: socialsWithId.filter((s) => s.id !== id),
    });
  };

  const updateSocialLink = (id: number | string, field: 'platform' | 'url', valueInput: string) => {
    updateConfig({
      socialLinks: socialsWithId.map((s) => {
        if (s.id !== id) {return s;}
        if (field === 'platform') {
          const platform = SOCIAL_PLATFORMS.find((p) => p.key === valueInput);
          return { ...s, platform: valueInput, icon: platform?.icon ?? valueInput };
        }
        return { ...s, [field]: valueInput };
      }),
    });
  };



  return (
    <>
      <FormSectionsToggleAllButton hasClosedSection={hasClosedSection} onToggleAll={handleToggleAll} />
      <div className="mb-4 flex justify-end">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateFooter}>
            <LayoutGrid size={14} className="mr-1" /> Sinh footer chuẩn BCT/Google
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={loadFromSettings}>
            <Download size={14} className="mr-1" /> Load từ Settings
          </Button>
        <AiDemoFooterImport onApply={(items) => updateConfig({ columns: items as FooterColumn[] })} />
        </div>
      </div>

      {/* ── Card 1: Cài đặt & Hiển thị ──────────────────── */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <HomeComponentDisplaySettingsSection
            open={openSections.settings}
            onOpenChange={(open) => toggleSection('settings', open)}
            cornerRadius={value.cornerRadius ?? 'lg'}
            onCornerRadiusChange={(cornerRadius) => updateConfig({ cornerRadius, noBorderRadius: cornerRadius === 'none' })}
            spacing={value.spacing ?? 'normal'}
            onSpacingChange={(spacing) => updateConfig({ spacing, noVerticalMargin: spacing === 'none' })}
          >
              <div className="space-y-2">
                <Label>Độ rộng tối đa</Label>
                <select
                  value={maxWidth}
                  onChange={(event) =>{  updateConfig({ maxWidth: event.target.value as FooterConfig['maxWidth'] }); }}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {MAX_WIDTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
          </HomeComponentDisplaySettingsSection>

          <SubSection
            icon={LayoutGrid}
            title="Thông tin cơ bản"
            open={openSections.basicInfo}
            onOpenChange={(open) => toggleSection('basicInfo', open)}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên logo hiển thị</Label>
                <InputWithClear
                  value={value.logoName}
                  onChange={(logoName) =>{  updateConfig({ logoName }); }}
                  placeholder="VD: VietAdmin"
                />
                <p className="text-xs text-slate-400">Để trống = ẩn tên cạnh logo.</p>
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <SettingsImageUploader
                  value={value.logo}
                  onChange={(url) =>{  updateConfig({ logo: url ?? '' }); }}
                  folder="footer"
                  previewSize="sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Nền bảo vệ logo</Label>
                <select
                  value={value.logoBackgroundStyle ?? 'none'}
                  onChange={(event) =>{  updateConfig({ logoBackgroundStyle: event.target.value as FooterLogoBackgroundStyle }); }}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {LOGO_BACKGROUND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Dùng khi logo hòa vào nền footer. Chỉ dùng nền phẳng và viền mảnh, không shadow/3D.</p>
              </div>
              <div className="space-y-2">
                <Label>Kích thước logo</Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={logoSizeLevel}
                  onChange={(event) =>{  updateConfig({ logoSizeLevel: Number(event.target.value) as FooterConfig['logoSizeLevel'] }); }}
                  className="w-full"
                />
                <div className="text-xs font-medium text-slate-600">Nấc {logoSizeLevel}/10</div>
              </div>
              <div className="space-y-2">
                <Label>Slogan</Label>
                <textarea
                  value={value.description}
                  onChange={(e) =>{  updateConfig({ description: e.target.value }); }}
                  placeholder="Đối tác tin cậy cho hành trình số hóa của bạn"
                  className="w-full min-h-[60px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value.showCopyright !== false}
                    onChange={(e) =>{  updateConfig({ showCopyright: e.target.checked }); }}
                    className="h-4 w-4 rounded"
                  />
                  <Label>Hiển thị Copyright</Label>
                </div>
                {value.showCopyright !== false && (
                  <div className="space-y-1">
                    <InputWithClear
                      value={value.copyright}
                      onChange={(v) =>{  updateConfig({ copyright: v }); }}
                      placeholder={`© ${new Date().getFullYear()} Tên Web. All rights reserved.`}
                    />
                    <p className="text-xs text-slate-400">
                      Để trống = tự động dùng: © {new Date().getFullYear()} Tên web từ Settings. All rights reserved.
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value.showSocialLinks !== false}
                    onChange={(e) =>{  updateConfig({ showSocialLinks: e.target.checked }); }}
                    className="h-4 w-4 rounded"
                  />
                  <Label>Hiển thị social links</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value.useOriginalSocialIconColors !== false}
                    onChange={(e) =>{  updateConfig({ useOriginalSocialIconColors: e.target.checked }); }}
                    className="h-4 w-4 rounded"
                  />
                  <Label>Dùng màu icon gốc</Label>
                </div>
              </div>
            </div>
          </SubSection>

          <SubSection
            icon={Share2}
            title="Bộ Công Thương"
            open={openSections.bct}
            onOpenChange={(open) => toggleSection('bct', open)}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.showBctLogo === true}
                  onChange={(e) =>{  updateConfig({ showBctLogo: e.target.checked }); }}
                  className="h-4 w-4 rounded"
                />
                <Label>Hiển thị logo BCT</Label>
              </div>
              {value.showBctLogo && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Loại logo</Label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="bct-logo-type"
                          value="thong-bao"
                          checked={bctLogoType === 'thong-bao'}
                          onChange={() =>{  updateConfig({ bctLogoType: 'thong-bao' }); }}
                        />
                        <img src="/images/bct/logo-da-thong-bao-bct.png" alt="Đã thông báo" className="h-8 w-auto" />
                        <span>Đã thông báo</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="bct-logo-type"
                          value="dang-ky"
                          checked={bctLogoType === 'dang-ky'}
                          onChange={() =>{  updateConfig({ bctLogoType: 'dang-ky' }); }}
                        />
                        <img src="/images/bct/logo-da-dang-ky-bct.webp" alt="Đã đăng ký" className="h-8 w-auto" />
                        <span>Đã đăng ký</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Link xác thực BCT (tuỳ chọn)</Label>
                    <InputWithClear
                      value={value.bctLogoLink ?? ''}
                      onChange={(v) =>{  updateConfig({ bctLogoLink: v }); }}
                      placeholder="https://online.gov.vn/Home/WebSiteDisplay/..."
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Preview:</span>
                    <img src={bctLogoSrc} alt="BCT Logo" className="h-8 w-auto" />
                  </div>
                </div>
              )}
            </div>
          </SubSection>
        </CardContent>
      </Card>

      {/* ── Card 2: Cột menu & Mạng xã hội ──────────────── */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <SubSection
            icon={LayoutGrid}
            title={`Cột menu (${columnsWithId.length}/4)`}
            open={openSections.columns}
            onOpenChange={(open) => toggleSection('columns', open)}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() =>{  applySuggestedColumns(2); }}>
                  Gợi ý 2 cột
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() =>{  applySuggestedColumns(4); }}>
                  Gợi ý 4 cột
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addColumn}
                  disabled={columnsWithId.length >= 4}
                  title={columnsWithId.length >= 4 ? 'Tối đa 4 cột menu' : ''}
                >
                  <Plus size={14} className="mr-1" /> Thêm cột
                </Button>
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                Gợi ý lấy từ route module, danh mục và nội dung đang có để giảm nhập tay và hạn chế lệch dữ liệu thực.
              </div>

          {columnsWithId.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}` }}
              >
                <LayoutGrid size={24} style={{ color: colors.accent }} />
              </div>
              <h3 className="mb-1 font-medium text-slate-900 dark:text-slate-100">Chưa có cột menu</h3>
              <p className="mb-3 text-sm text-slate-500">Nhấn “Gợi ý 2 cột”, “Gợi ý 4 cột” hoặc “Thêm cột” để bắt đầu nhanh</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() =>{  applySuggestedColumns(2); }}>
                  Gợi ý 2 cột
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() =>{  applySuggestedColumns(4); }}>
                  Gợi ý 4 cột
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                  <Plus size={14} className="mr-1" /> Thêm cột đầu tiên
                </Button>
              </div>
            </div>
          ) : (
            columnsWithId.map((column) => (
              <div
                key={column.id}
                draggable
                onDragStart={() =>{  handleColumnDragStart(column.id ?? 0); }}
                onDragEnd={handleColumnDragEnd}
                onDragOver={(e) =>{  handleColumnDragOver(e, column.id ?? 0); }}
                onDrop={(e) =>{  handleColumnDrop(e, column.id ?? 0); }}
                className={cn(
                  'space-y-3 rounded-lg border p-4 transition-all',
                  draggedColumnId === column.id && 'opacity-50',
                  dragOverColumnId === column.id && 'ring-2 ring-blue-500 ring-offset-2',
                  'border-slate-200 dark:border-slate-700'
                )}
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="cursor-grab flex-shrink-0 text-slate-400" />
                  <InputWithClear
                    value={column.title}
                    onChange={(v) =>{  updateColumn(column.id ?? 0, 'title', v); }}
                    placeholder="Tiêu đề cột"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-colors"
                    onClick={() =>{  handleOpenQuickPicker({ type: 'column', columnId: column.id ?? 0 }); }}
                    title="Thêm link gợi ý cho cột"
                  >
                    <Link2 size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>{  removeColumn(column.id ?? 0); }}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="space-y-2 pl-6">
                  <Label className="text-xs text-slate-500">Links ({column.links.length})</Label>
                  {column.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="flex flex-col gap-2 rounded-lg border border-slate-100 p-2 sm:flex-row sm:items-center dark:border-slate-800">
                      <InputWithClear
                        value={link.label}
                        onChange={(v) =>{  updateLink(column.id ?? 0, linkIdx, 'label', v); }}
                        placeholder="Tên link"
                        className="flex-1"
                      />
                      <div className="flex flex-1 items-center gap-2 w-full">
                        <InputWithClear
                          value={link.url}
                          onChange={(v) =>{  updateLink(column.id ?? 0, linkIdx, 'url', v); }}
                          placeholder="/url"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0 text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-colors"
                          onClick={() =>{  handleOpenQuickPicker({ type: 'link', columnId: column.id ?? 0, linkIndex: linkIdx }); }}
                          title="Chọn link gợi ý"
                        >
                          <Link2 size={14} />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>{  removeLink(column.id ?? 0, linkIdx); }}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 sm:flex-shrink-0"
                        disabled={column.links.length <= 1}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>{  addLink(column.id ?? 0); }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Plus size={12} className="mr-1" /> Thêm link
                  </Button>
                </div>
              </div>
            ))
          )}
            </div>
          </SubSection>

          <SubSection
            icon={Share2}
            title={`Mạng xã hội (${socialsWithId.length}/${SOCIAL_PLATFORMS.length})`}
            open={openSections.socials}
            onOpenChange={(open) => toggleSection('socials', open)}
          >
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                  disabled={socialsWithId.length >= SOCIAL_PLATFORMS.length}
                  title={socialsWithId.length >= SOCIAL_PLATFORMS.length ? 'Đã thêm đủ tất cả mạng xã hội' : ''}
                >
                  <Plus size={14} className="mr-1" /> Thêm MXH
                </Button>
              </div>
              {socialsWithId.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div
                    className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}` }}
                  >
                    <Share2 size={24} style={{ color: colors.accent }} />
                  </div>
                  <h3 className="mb-1 font-medium text-slate-900 dark:text-slate-100">Chưa có mạng xã hội</h3>
                  <p className="mb-3 text-sm text-slate-500">Thêm MXH hoặc load từ Settings</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={loadFromSettings}>
                      <Download size={14} className="mr-1" /> Load từ Settings
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                      <Plus size={14} className="mr-1" /> Thêm MXH
                    </Button>
                  </div>
                </div>
              ) : (
                socialsWithId.map((social) => (
                  <div
                    key={social.id}
                    draggable
                    onDragStart={() =>{  handleSocialDragStart(social.id ?? 0); }}
                    onDragEnd={handleSocialDragEnd}
                    onDragOver={(e) =>{  handleSocialDragOver(e, social.id ?? 0); }}
                    onDrop={(e) =>{  handleSocialDrop(e, social.id ?? 0); }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg p-2 transition-all',
                      draggedSocialId === social.id && 'opacity-50',
                      dragOverSocialId === social.id && 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20'
                    )}
                  >
                    <GripVertical size={16} className="cursor-grab flex-shrink-0 text-slate-400" />
                    <select
                      value={social.platform}
                      onChange={(e) =>{  updateSocialLink(social.id ?? 0, 'platform', e.target.value); }}
                      className="h-9 w-36 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option
                          key={p.key}
                          value={p.key}
                          disabled={socialsWithId.some((s) => s.platform === p.key && s.id !== social.id)}
                        >
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <InputWithClear
                      value={social.url}
                      onChange={(v) =>{  updateSocialLink(social.id ?? 0, 'url', v); }}
                      placeholder={getSocialPlaceholder(social.platform)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>{  removeSocialLink(social.id ?? 0); }}
                      className="flex-shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SubSection>
        </CardContent>
      </Card>

      <QuickRoutePickerModal
        open={isQuickPickerOpen}
        onOpenChange={setIsQuickPickerOpen}
        onSelect={handleSelectQuickRoute}
        title={pickerTarget?.type === 'column' ? 'Thêm link gợi ý cho cột' : 'Chọn link gợi ý'}
      />
    </>
  );
}
