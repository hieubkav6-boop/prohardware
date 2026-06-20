'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from 'convex/react';
import {
  BadgeCheck, Box, ChevronDown, DatabaseZap, ExternalLink, Gem, Hash, Inbox, Layers, Loader2,
  Save, Search, Sparkles, Trash2, TrendingUp, Users, Trophy, Swords, ChevronLeft, ChevronRight, Gamepad2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { Badge, Button, Card, CardContent, Input, Label, cn, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/admin/components/ui';
import { SettingsImageUploader } from '@/app/admin/components/SettingsImageUploader';
import { generatePaginationItems } from '@/app/admin/components/TableUtilities';
import { parseScrapedItems, parseScrapedPokemon, parseScrapedTiers, parseScrapedTeams, parseScrapedTypes } from './scraper';
import { useBrandColors, useSiteSettings } from '@/components/site/hooks';
import { PreviewWrapper, usePreviewDark } from '@/app/admin/home-components/_shared/components/PreviewWrapper';
import { BrowserFrame } from '@/app/admin/home-components/_shared/components/BrowserFrame';
import { deviceWidths, usePreviewDevice, type PreviewDevice } from '@/app/admin/home-components/_shared/hooks/usePreviewDevice';


type GameItem = Doc<'pokemonChampionsGameItems'>;
type Pokemon = Doc<'pokemonChampionsPokemon'>;
type Customer = Doc<'pokemonChampionsCustomers'>;
type Order = Doc<'pokemonChampionsOrders'>;
type MiniAppConfig = Record<string, unknown>;
type AdminSection = 'data' | 'settings' | 'home';
type DataSection = 'pokemon' | 'items' | 'tiers' | 'teams' | 'types' | 'orders' | 'customers';

type PokemonChampionsMiniAppProps = {
  appConfig?: MiniAppConfig;
  appId?: Id<'miniApps'>;
  appName?: string;
  editable?: boolean;
  standalone?: boolean;
};

const CONTACT_OPTIONS = ['discord', 'whatsapp', 'instagram', 'zalo', 'phone', 'other'] as const;
const ORDER_STATUSES = ['new', 'contacted', 'confirmed', 'fulfilled', 'cancelled'] as const;
const POKEMON_TYPES = ['All', 'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

const emptyPokemonDraft = {
  active: true,
  bestItemId: '',
  dexNumber: 25,
  imageUrl: '',
  name: '',
  notes: '',
  primaryType: 'Electric',
  secondaryType: '',
  traits: '',
};

const emptyItemDraft = {
  active: true,
  description: '',
  icon: 'Sparkles',
  imageUrl: '',
  name: '',
  priceLabel: 'Contact',
  rarity: 'rare',
  slug: '',
  tags: '',
};

function formatSlugLabel(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getPokemonSourceSlug(notes?: string) {
  const match = /\/champions\/pokemon\/([^/"'?#\s]+)\/?/i.exec(notes ?? '');
  return match?.[1] ?? '';
}

function getPokemonDisplayName(pokemon: Pokemon) {
  const sourceSlug = getPokemonSourceSlug(pokemon.notes);
  if (sourceSlug) return formatSlugLabel(sourceSlug);

  const fullName = pokemon.name;
  const types = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 
    'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Fairy', 'Dark'
  ];
  
  let cleanName = fullName;
  let minIndex = fullName.length;
  
  const usesIdx = fullName.toLowerCase().indexOf(' uses');
  if (usesIdx !== -1 && usesIdx < minIndex) {
    minIndex = usesIdx;
  }
  
  for (const t of types) {
    const idx = fullName.indexOf(' ' + t);
    if (idx !== -1 && idx < minIndex && idx > 1) {
      minIndex = idx;
    }
  }
  
  if (minIndex < fullName.length) {
    cleanName = fullName.substring(0, minIndex).trim();
  }
  
  cleanName = cleanName.replace(/\d+$/, '').trim();
  return cleanName;
}

export function PokemonChampionsMiniApp({
  appConfig,
  appId,
  editable = false,
  standalone = false,
}: PokemonChampionsMiniAppProps) {
  const ensureDefaults = useMutation(api.pokemonChampions.ensureDefaults);
  const didEnsureDefaults = useRef(false);
  const settingsDoc = useQuery(api.pokemonChampions.getSettings);
  const pokemon = useQuery(api.pokemonChampions.listPokemon, { activeOnly: !editable, limit: 500 });
  const gameItems = useQuery(api.pokemonChampions.listGameItems, { activeOnly: !editable, limit: 200 });
  const orders = useQuery(api.pokemonChampions.listOrders, editable ? { limit: 100 } : 'skip');
  const customers = useQuery(api.pokemonChampions.listCustomers, editable ? { limit: 100 } : 'skip');
  const teams = useQuery(api.pokemonChampions.listTeams, editable ? { limit: 100 } : 'skip');
  const dbTypes = useQuery(api.pokemonChampions.listTypes, {});
  const [adminSection, setAdminSection] = useState<AdminSection>('data');
  const [dataSection, setDataSection] = useState<DataSection>('pokemon');
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);

  useEffect(() => {
    if (didEnsureDefaults.current || pokemon === undefined || gameItems === undefined || settingsDoc === undefined) {
      return;
    }
    didEnsureDefaults.current = true;
    if (pokemon.length === 0 && gameItems.length === 0 && !settingsDoc) {
      void ensureDefaults();
    }
  }, [ensureDefaults, gameItems, pokemon, settingsDoc]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'home') {
      setAdminSection('home');
    }
  }, []);

  const isLoading = pokemon === undefined || gameItems === undefined || settingsDoc === undefined || dbTypes === undefined || (editable && (orders === undefined || customers === undefined || teams === undefined));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!editable) {
    return (
      <PokemonChampionsPublic
        gameItems={gameItems}
        pokemon={pokemon}
        settingsDoc={settingsDoc}
        standalone={standalone}
        appConfig={appConfig}
        dbTypes={dbTypes ?? []}
      />
    );
  }

  return (
    <div className={cn(
      'rounded-xl border border-slate-200 bg-slate-50 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
      standalone ? 'min-h-screen rounded-none border-0' : 'min-h-[680px]'
    )}>
      <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsSyncDialogOpen(true)}
              className="h-9 w-9 border-dashed text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              title="Cào dữ liệu Pokémon Zone"
            >
              <DatabaseZap className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <TopTabButton active={adminSection === 'data'} icon={Box} label="Dữ liệu CRUD" onClick={() => setAdminSection('data')} />
            <TopTabButton active={adminSection === 'home'} icon={Sparkles} label="Home-component" onClick={() => setAdminSection('home')} />
          </div>
        </div>

        {adminSection === 'data' && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {([
              ['pokemon', 'Pokemon', BadgeCheck],
              ['items', 'Game items', Gem],
              ['tiers', 'Tier List', TrendingUp],
              ['teams', 'Teams', Layers],
              ['types', 'Types', Hash],
              ['orders', 'Orders', Inbox],
              ['customers', 'Customers', Users],
            ] as const).map(([key, label, Icon]) => (
              <TopTabButton
                key={key}
                active={dataSection === key}
                icon={Icon}
                label={label}
                subtle
                onClick={() => setDataSection(key)}
              />
            ))}
          </div>
        )}
      </div>

      <main className="min-w-0 p-4 lg:p-6">
        {adminSection === 'data' && dataSection === 'pokemon' && <PokemonCrud gameItems={gameItems} pokemon={pokemon} />}
        {adminSection === 'data' && dataSection === 'items' && <GameItemCrud gameItems={gameItems} />}
        {adminSection === 'data' && dataSection === 'tiers' && <TiersCrud pokemon={pokemon} />}
        {adminSection === 'data' && dataSection === 'teams' && <TeamsCrud teams={teams ?? []} pokemon={pokemon} gameItems={gameItems} />}
        {adminSection === 'data' && dataSection === 'types' && <TypesCrud dbTypes={dbTypes} />}
        {adminSection === 'data' && dataSection === 'orders' && <OrdersPanel gameItems={gameItems} orders={orders ?? []} pokemon={pokemon} />}
        {adminSection === 'data' && dataSection === 'customers' && <CustomersPanel customers={customers ?? []} />}
        {adminSection === 'home' && (
          <HomeComponentPanel
            appConfig={appConfig ?? {}}
            appId={appId}
            gameItems={gameItems}
            pokemon={pokemon}
            settingsDoc={settingsDoc}
            teams={teams ?? []}
            dbTypes={dbTypes ?? []}
          />
        )}
      </main>
      {editable && (
        <SyncDefaultsDialog
          isOpen={isSyncDialogOpen}
          onClose={() => setIsSyncDialogOpen(false)}
          onSyncedSection={(section) => {
            setAdminSection('data');
            setDataSection(section);
          }}
        />
      )}
    </div>
  );
}

function TopTabButton({ active, icon: Icon, label, onClick, subtle = false }: { active: boolean; icon: React.ElementType; label: string; onClick: () => void; subtle?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-slate-900 font-semibold text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
          : subtle
            ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            : 'text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-900'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PokemonChampionsPublic({
  gameItems,
  pokemon,
  settingsDoc: _settingsDoc,
  standalone,
  appConfig,
  dbTypes,
}: {
  gameItems: GameItem[];
  pokemon: Pokemon[];
  settingsDoc: Doc<'pokemonChampionsSettings'> | null;
  standalone?: boolean;
  appConfig?: MiniAppConfig;
  dbTypes: PokemonType[];
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const itemsById = useMemo(() => new Map(gameItems.map((item) => [item._id, item])), [gameItems]);

  const { isDark } = useSiteSettings();
  const brandColors = useBrandColors();
  const primaryColor = brandColors.primary;
  const secondaryColor = brandColors.secondary || '#facc15';

  const homeConfig = (appConfig?.homeComponent && typeof appConfig.homeComponent === 'object' ? appConfig.homeComponent : {}) as Record<string, unknown>;
  const style = typeof homeConfig.style === 'string' ? homeConfig.style : 'grid';
  const cornerRadius = typeof homeConfig.cornerRadius === 'string' ? homeConfig.cornerRadius : 'lg';

  const cardRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-3xl';
  const thumbRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-lg' : 'rounded-2xl';

  const filteredPokemon = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return pokemon.filter((item) => {
      const matchesType = typeFilter === 'All' || item.primaryType === typeFilter || item.secondaryType === typeFilter;
      const haystack = `${item.name} ${item.primaryType} ${item.secondaryType ?? ''} ${item.dexNumber}`.toLowerCase();
      return matchesType && (!keyword || haystack.includes(keyword));
    });
  }, [pokemon, query, typeFilter]);

  return (
    <main
      className={cn(
        'transition-colors duration-200',
        standalone ? 'min-h-screen' : 'rounded-2xl',
        isDark ? 'bg-[#0f0709] text-white' : 'bg-[#fafafa] text-slate-900'
      )}
      style={{
        background: isDark
          ? `radial-gradient(circle at top left, ${primaryColor}1a 0, transparent 34%), radial-gradient(circle at bottom right, ${secondaryColor}15 0, transparent 28%), #0f0709`
          : `radial-gradient(circle at top left, ${primaryColor}0a 0, transparent 40%), radial-gradient(circle at bottom right, ${secondaryColor}08 0, transparent 35%), #fafafa`
      }}
    >
      <section className={cn('relative overflow-hidden border-b px-4 py-12 sm:px-6 lg:px-10', isDark ? 'border-white/10' : 'border-slate-200')}>
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <Badge className={cn('mb-4 border', isDark ? 'border-white/10 bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-800 shadow-sm')}>
                Pokémon Champions
              </Badge>
              <h1 className={cn('text-4xl font-black tracking-tight sm:text-5xl', isDark ? 'text-white' : 'text-slate-900')}>
                Pokémon Champions order desk
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <div
            className={cn(
              'mb-6 flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-5 transition duration-200',
              cardRadiusClass,
              isDark ? 'text-white' : 'text-slate-900'
            )}
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: primaryColor,
              borderColor: isDark ? `${primaryColor}30` : `${primaryColor}20`,
              backgroundColor: isDark ? `${primaryColor}15` : `${primaryColor}08`,
              boxShadow: isDark ? `0 0 15px ${primaryColor}10` : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="flex items-start gap-3 text-left">
              <div
                className="mt-1 rounded-full p-1.5 shrink-0"
                style={{ backgroundColor: isDark ? `${primaryColor}20` : `${primaryColor}10`, color: primaryColor }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>ANNOUNCEMENT</h4>
                <p className={cn('text-sm mt-0.5 font-medium', isDark ? 'text-white/80' : 'text-slate-600')}>
                  The shop is currently open for orders! Submit a quick order request to get support from our admin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickOrderOpen(true)}
              className="w-full shrink-0 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] md:w-auto"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px ${primaryColor}30`
              }}
            >
              Quick Order
            </button>
          </div>
        <div className={cn('mb-5 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row', isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm')}>
          <div className="relative flex-1">
            <Search className={cn('absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2', isDark ? 'text-white/40' : 'text-slate-400')} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, type or Dex number"
              className={cn(
                'h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition',
                isDark
                  ? 'border-white/10 bg-black/20 text-white placeholder:text-white/40 focus:border-white/30'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300'
              )}
            />
          </div>
          <div className="relative w-full sm:w-56">
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className={cn(
                "flex h-11 w-full items-center justify-between px-3.5 border text-sm transition focus:outline-none focus:ring-2 focus:ring-opacity-50 select-none",
                isDark
                  ? "border-white/10 bg-black/30 text-white focus:border-white/30"
                  : "border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-300",
                cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-2xl'
              )}
            >
              <span className="flex items-center gap-2">
                {typeFilter === 'All' ? (
                  <>All types</>
                ) : (
                  <>
                    <TypeIconMini typeName={typeFilter} dbTypes={dbTypes} />
                    {typeFilter}
                  </>
                )}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isTypeDropdownOpen && "rotate-180")} />
            </button>

            {isTypeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTypeDropdownOpen(false)} />
                <div
                  className={cn(
                    "absolute right-0 top-full mt-1.5 z-50 w-full max-h-60 overflow-y-auto border p-1.5 shadow-xl transition-all duration-200",
                    isDark ? "border-white/10 bg-[#160b0e] text-white" : "border-slate-200 bg-white text-slate-900",
                    cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-2xl'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter('All');
                      setIsTypeDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-sm transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/5",
                      typeFilter === 'All' && "bg-slate-100 dark:bg-white/10 font-bold"
                    )}
                  >
                    All types
                  </button>
                  {(dbTypes ?? []).map((t) => {
                    const cleanName = t.name.split(' ')[0];
                    const isSelected = typeFilter === cleanName;
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => {
                          setTypeFilter(cleanName);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-left",
                          isSelected && "bg-slate-100 dark:bg-white/10 font-bold"
                        )}
                      >
                        <TypeIconMini typeName={cleanName} dbTypes={dbTypes} />
                        <span>{cleanName}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={cn(
          'grid gap-4',
          style === 'compact'
            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            : style === 'list'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}>
          {filteredPokemon.map((item) => {
            const bestItem = item.bestItemId ? itemsById.get(item.bestItemId) : null;
            const isList = style === 'list';
            const isCompact = style === 'compact';
            return (
              <article
                key={item._id}
                onClick={() => {
                  setSelectedPokemon(item);
                  setSelectedItemId(item.bestItemId ?? '');
                }}
                className={cn(
                  'border transition duration-200 overflow-hidden group relative cursor-pointer',
                  cardRadiusClass,
                  isDark
                    ? 'border-white/10 bg-white/[0.06] hover:border-white/20'
                    : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-md',
                  isList ? 'flex flex-row items-center gap-4 p-3' : 'flex flex-col h-full ' + (isCompact ? 'p-3' : 'p-4')
                )}
              >
                <div
                  className={cn(
                    'transition duration-200 flex items-center justify-center shrink-0 relative overflow-hidden',
                    thumbRadiusClass,
                    isDark ? 'bg-white/10' : 'bg-slate-100',
                    isList ? 'h-20 w-20' : isCompact ? 'h-24 w-full' : 'h-36 w-full'
                  )}
                >
                  <PokemonThumb
                    imageUrl={item.imageUrl}
                    name={item.name}
                    alt={item.name}
                    className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-105"
                    fallbackClassName="h-full w-full rounded-none text-3xl"
                  />
                  <div className={cn('absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-bold', isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-slate-800 border border-slate-200/60 shadow-sm')}>
                    #{item.dexNumber}
                  </div>
                </div>
                <div className={cn('flex flex-col flex-1 min-w-0', !isList && 'mt-4')}>
                  <div className="flex-grow">
                    <div className={cn('flex items-center gap-2 text-xs', isDark ? 'text-white/50' : 'text-slate-500')}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.primaryType && (() => {
                          const details = getTypeDetails(item.primaryType);
                          const color = details?.color || '#64748b';
                          return (
                            <span 
                              className="inline-flex items-center gap-1 rounded-full pl-1 pr-2.5 py-0.5 text-[10px] font-extrabold border animate-fade-in"
                              style={{ 
                                backgroundColor: `${color}15`, 
                                borderColor: `${color}30`,
                                color: color
                              }}
                            >
                              <TypeIconMini typeName={item.primaryType} dbTypes={dbTypes} />
                              {item.primaryType}
                            </span>
                          );
                        })()}
                        {item.secondaryType && (() => {
                          const details = getTypeDetails(item.secondaryType);
                          const color = details?.color || '#64748b';
                          return (
                            <span 
                              className="inline-flex items-center gap-1 rounded-full pl-1 pr-2.5 py-0.5 text-[10px] font-extrabold border animate-fade-in"
                              style={{ 
                                backgroundColor: `${color}15`, 
                                borderColor: `${color}30`,
                                color: color
                              }}
                            >
                              <TypeIconMini typeName={item.secondaryType} dbTypes={dbTypes} />
                              {item.secondaryType}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <h3 className={cn('font-bold transition duration-200', isList ? 'text-base mt-0.5' : isCompact ? 'text-sm mt-1' : 'text-lg mt-1', isDark ? 'text-white group-hover:text-white/95' : 'text-slate-900 group-hover:text-slate-800')}>{item.name}</h3>
                  </div>
                  {(() => {
                    const cleanBestItemName = bestItem ? bestItem.name : '';
                    const hasAdvice = cleanBestItemName && !cleanBestItemName.toLowerCase().includes('contact for item advice');
                    if (!hasAdvice) return null;
                    return (
                      <div
                        className={cn(
                          'flex items-center gap-2.5 rounded-2xl px-3 py-1.5 text-xs transition duration-200 shrink-0',
                          isList ? 'mt-3' : 'mt-auto w-full',
                          isDark ? 'bg-black/20 text-white/70' : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {bestItem?.imageUrl ? (
                          <img src={bestItem.imageUrl} alt={cleanBestItemName} className="h-10 w-10 object-contain shrink-0" />
                        ) : (
                          <Sparkles className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                        )}
                        <span className="line-clamp-2 whitespace-normal break-words text-left flex-1 font-semibold text-[11px] leading-snug">{cleanBestItemName}</span>
                      </div>
                    );
                  })()}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedPokemon && (
        <OrderDialog
          gameItems={gameItems}
          initialItemId={selectedItemId}
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      <QuickOrderDialog
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        isDark={isDark}
        brandColor={primaryColor}
        cornerRadius={cornerRadius}
      />
    </main>
  );
}



function OrderDialog({ gameItems, initialItemId, pokemon, onClose }: { gameItems: GameItem[]; initialItemId: string; pokemon: Pokemon; onClose: () => void }) {
  const createOrder = useMutation(api.pokemonChampions.createOrder);
  const [customerName, setCustomerName] = useState('');
  const [contactType, setContactType] = useState<(typeof CONTACT_OPTIONS)[number]>('discord');
  const [contactHandle, setContactHandle] = useState('');
  const [gameItemId, setGameItemId] = useState(initialItemId);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrder({
        contactHandle,
        contactType,
        customerName,
        gameItemId: gameItemId ? gameItemId as Id<'pokemonChampionsGameItems'> : undefined,
        note,
        pokemonId: pokemon._id,
        quantity: 1,
      });
      toast.success('Order request sent. We will contact you soon.');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#21090e] p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Place order</h2>
            <p className="text-sm text-white/60">Send contact details for {pokemon.name}.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">Close</button>
        </div>
        <div className="space-y-3">
          <DarkField label="Your name" value={customerName} onChange={setCustomerName} placeholder="Enter your name" required />
          <div className="grid grid-cols-[130px_1fr] gap-2">
            <select value={contactType} onChange={(event) => setContactType(event.target.value as typeof contactType)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none">
              {CONTACT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <input value={contactHandle} onChange={(event) => setContactHandle(event.target.value)} placeholder="Your contact handle" required className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none placeholder:text-white/40" />
          </div>
          <select value={gameItemId} onChange={(event) => setGameItemId(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none">
            <option value="">Need admin advice</option>
            {gameItems.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Notes, build goals or delivery questions" className="min-h-20 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none placeholder:text-white/40" />
          <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center rounded-xl bg-white font-bold text-slate-950 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send order request'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DarkField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return (
    <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-white/60">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/40" />
    </label>
  );
}

const POKEMON_TYPE_ICON_BASE_URL = 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons';
const getPokemonTypeIconUrl = (slug: string) => `${POKEMON_TYPE_ICON_BASE_URL}/${slug}.svg`;

const TYPE_DETAILS: Record<string, { color: string; iconUrl: string }> = {
  Normal: { color: '#A8A77A', iconUrl: getPokemonTypeIconUrl('normal') },
  Fire: { color: '#EE8130', iconUrl: getPokemonTypeIconUrl('fire') },
  Water: { color: '#6390F0', iconUrl: getPokemonTypeIconUrl('water') },
  Grass: { color: '#7AC74C', iconUrl: getPokemonTypeIconUrl('grass') },
  Electric: { color: '#F7D02C', iconUrl: getPokemonTypeIconUrl('electric') },
  Ice: { color: '#96D9D6', iconUrl: getPokemonTypeIconUrl('ice') },
  Fighting: { color: '#C22E28', iconUrl: getPokemonTypeIconUrl('fighting') },
  Poison: { color: '#A33EA1', iconUrl: getPokemonTypeIconUrl('poison') },
  Ground: { color: '#E2BF65', iconUrl: getPokemonTypeIconUrl('ground') },
  Flying: { color: '#A98FF3', iconUrl: getPokemonTypeIconUrl('flying') },
  Psychic: { color: '#F95587', iconUrl: getPokemonTypeIconUrl('psychic') },
  Bug: { color: '#A6B91A', iconUrl: getPokemonTypeIconUrl('bug') },
  Rock: { color: '#B6A136', iconUrl: getPokemonTypeIconUrl('rock') },
  Ghost: { color: '#735797', iconUrl: getPokemonTypeIconUrl('ghost') },
  Dragon: { color: '#6F35FC', iconUrl: getPokemonTypeIconUrl('dragon') },
  Dark: { color: '#705746', iconUrl: getPokemonTypeIconUrl('dark') },
  Steel: { color: '#B7B7CE', iconUrl: getPokemonTypeIconUrl('steel') },
  Fairy: { color: '#D685AD', iconUrl: getPokemonTypeIconUrl('fairy') },
};

function getTypeDetails(typeName?: string) {
  if (!typeName) return undefined;
  const canonicalType = Object.keys(TYPE_DETAILS).find(
    (item) => item.toLowerCase() === typeName.trim().toLowerCase()
  );
  return canonicalType ? TYPE_DETAILS[canonicalType] : undefined;
}

function TypeIconMini({ typeName, dbTypes }: { typeName: string; dbTypes?: any[] }) {
  if (!typeName) return null;
  const details = getTypeDetails(typeName);
  const color = details?.color || '#64748b';
  
  let icon: string | undefined | null = null;
  if (dbTypes && dbTypes.length > 0) {
    const cleanTypeName = typeName.trim().toLowerCase();
    const typeDoc = dbTypes.find((t) => {
      const cleanDocName = t.name.split(' ')[0].trim().toLowerCase();
      return cleanDocName === cleanTypeName || t.slug.toLowerCase() === cleanTypeName;
    });
    if (typeDoc?.imageUrl) {
      icon = typeDoc.imageUrl;
    }
  }
  
  if (!icon) {
    icon = details?.iconUrl;
  }

  return (
    <span 
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden"
      style={{ backgroundColor: color }}
    >
      {icon ? (
        <img src={icon} alt={typeName} className="h-3 w-3 object-contain brightness-0 invert" />
      ) : (
        <span className="text-[8px] text-white font-bold">?</span>
      )}
    </span>
  );
}

function ItemSelect({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (val: string) => void;
  items: GameItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedItem = items.find((i) => i._id === value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        {selectedItem ? (
          <div className="flex items-center gap-2">
            {selectedItem.imageUrl ? (
              <img src={selectedItem.imageUrl} alt="" className="h-5 w-5 object-contain" />
            ) : (
              <span className="text-xs">📦</span>
            )}
            <span>{selectedItem.name}</span>
          </div>
        ) : (
          <span className="text-slate-500">Chưa chọn</span>
        )}
        <span className="text-xs text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Chưa chọn
          </div>
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                onChange(item._id);
                setIsOpen(false);
              }}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-5 w-5 object-contain" />
              ) : (
                <span className="text-xs">📦</span>
              )}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SyncDefaultsDialog({
  isOpen,
  onClose,
  onSyncedSection,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSyncedSection: (section: Extract<DataSection, 'pokemon' | 'items' | 'tiers' | 'teams' | 'types'>) => void;
}) {
  const syncScrapedGameItems = useMutation(api.pokemonChampions.syncScrapedGameItems);
  const syncScrapedPokemon = useMutation(api.pokemonChampions.syncScrapedPokemon);
  const syncScrapedTiers = useMutation(api.pokemonChampions.syncScrapedTiers);
  const syncScrapedTeams = useMutation(api.pokemonChampions.syncScrapedTeams);
  const syncScrapedTypes = useMutation(api.pokemonChampions.syncScrapedTypes);
  const clearAllPokemonData = useMutation(api.pokemonChampions.clearAllPokemonData);

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [htmlSource, setHtmlSource] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [stepStatus, setStepStatus] = useState<Record<number, 'idle' | 'success' | 'error'>>({
    1: 'idle',
    2: 'idle',
    3: 'idle',
    4: 'idle',
    5: 'idle',
  });

  const [stepCounts, setStepCounts] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const steps = [
    {
      step: 1,
      title: 'Pokémon Types',
      url: 'https://www.pokemon-zone.com/champions/types/',
      target: 'types',
      description: 'Scrape Pokémon type list with icon images (used as classification categories).',
    },
    {
      step: 2,
      title: 'Game Items',
      url: 'https://www.pokemon-zone.com/champions/items/',
      target: 'items',
      description: 'Scrape competitive held items list (Choice Band, Life Orb, etc.).',
    },
    {
      step: 3,
      title: 'Pokémon',
      url: 'https://www.pokemon-zone.com/champions/pokemon/',
      target: 'pokemon',
      description: 'Scrape 315 Champions-legal Pokémon (name, Dex number, type, image, etc.)',
    },
    {
      step: 4,
      title: 'Tier List',
      url: 'https://www.pokemon-zone.com/champions/tier-list/',
      target: 'tiers',
      description: 'Update power rankings (Tier S, A, B, C, D, F) for each Pokémon.',
    },
    {
      step: 5,
      title: 'Teams',
      url: 'https://www.pokemon-zone.com/champions/teams/',
      target: 'teams',
      description: 'Scrape VGC Championship teams and auto-assign Best Items.',
    },
  ];

  const currentStepInfo = steps.find(s => s.step === activeStep)!;
  const currentSyncedSection = currentStepInfo.target as Extract<DataSection, 'pokemon' | 'items' | 'tiers' | 'teams' | 'types'>;

  const handleBulkDelete = async () => {
    if (!window.confirm('WARNING: This action will PERMANENTLY DELETE all Pokémon, Game Items, Teams and Types in the database! Are you sure you want to wipe the database and re-scrape from scratch?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await clearAllPokemonData();
      toast.success('All Pokémon data deleted successfully!');
      setStepStatus({ 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle' });
      setStepCounts({ 1: '', 2: '', 3: '', 4: '', 5: '' });
      setHtmlSource('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resolveScrapeSource = async (text: string) => {
    const pastedUrl = text.replace(/^view-source:\s*/i, '').trim();
    const isOnlyUrl = /^https?:\/\/\S+$/i.test(pastedUrl);
    if (!isOnlyUrl) {
      return text;
    }

    const target = currentStepInfo.target;
    const response = await fetch(`/api/pokemon-champions/proxy?target=${target}`);
    const payload = await response.json().catch(() => null) as { error?: string; html?: string } | null;
    if (!response.ok || !payload?.html) {
      throw new Error(payload?.error ?? 'Cannot auto-fetch page from URL. Open the page normally, Ctrl+A/C the rendered content, then paste it here.');
    }
    return payload.html;
  };

  const handleScrape = async () => {
    const text = htmlSource.trim();
    if (!text) {
      toast.error('Please paste HTML/source or copied page content.');
      return;
    }
    setIsProcessing(true);
    try {
      const scrapeSource = await resolveScrapeSource(text);
      if (activeStep === 1) {
        // Step 1: Types
        const types = parseScrapedTypes(scrapeSource);
        if (types.length === 0) throw new Error('No Pokémon type data found in HTML.');
        const result = await syncScrapedTypes({ types });
        setStepCounts(prev => ({ ...prev, 1: `Synced ${types.length} Types. Created: ${result.created}, Updated: ${result.updated}` }));
        setStepStatus(prev => ({ ...prev, 1: 'success' }));
        onSyncedSection('types');
        toast.success('Pokémon Types synced successfully!');
      } else if (activeStep === 2) {
        // Step 2: Items
        const items = parseScrapedItems(scrapeSource);
        if (items.length === 0) throw new Error('No Items data found in HTML.');
        const result = await syncScrapedGameItems({ items });
        setStepCounts(prev => ({ ...prev, 2: `Synced ${items.length} Items. Created: ${result.created}, Updated: ${result.updated}` }));
        setStepStatus(prev => ({ ...prev, 2: 'success' }));
        onSyncedSection('items');
        toast.success('Game Items synced successfully!');
      } else if (activeStep === 3) {
        // Step 3: Pokemon
        const pokemons = parseScrapedPokemon(scrapeSource);
        if (pokemons.length === 0) throw new Error('No Pokémon data found in HTML.');
        const result = await syncScrapedPokemon({ pokemons });
        setStepCounts(prev => ({ ...prev, 3: `Synced ${pokemons.length} Pokémon. Created: ${result.created}, Updated: ${result.updated}` }));
        setStepStatus(prev => ({ ...prev, 3: 'success' }));
        onSyncedSection('pokemon');
        toast.success('Pokémon synced successfully!');
      } else if (activeStep === 4) {
        // Step 4: Tiers
        const tiers = parseScrapedTiers(scrapeSource);
        if (tiers.length === 0) throw new Error('No Tier data found. For the Tier List page, copy the rendered page content instead of pasting just the URL.');
        const result = await syncScrapedTiers({ tiers });
        setStepCounts(prev => ({ ...prev, 4: `Read ${tiers.length} Tier rows. Updated: ${result.updated}, Created: ${result.created}, Skipped: ${result.skipped}` }));
        setStepStatus(prev => ({ ...prev, 4: 'success' }));
        onSyncedSection('tiers');
        toast.success('Tier List synced successfully!');
      } else if (activeStep === 5) {
        // Step 5: Teams
        const teams = parseScrapedTeams(scrapeSource);
        if (teams.length === 0) throw new Error('No Teams data found in HTML.');
        const result = await syncScrapedTeams({ teams });
        const memberCount = teams.reduce((total, team) => total + team.members.length, 0);
        setStepCounts(prev => ({ ...prev, 5: `Read ${teams.length} teams (${memberCount} slots). Created: ${result.createdTeams}, Updated: ${result.updatedTeams}, Best Items: ${result.updatedBestItems}, Missing Pokémon: ${result.skippedMembers}, Missing items: ${result.skippedItems}` }));
        setStepStatus(prev => ({ ...prev, 5: 'success' }));
        onSyncedSection('teams');
        toast.success('Teams & Best Items synced successfully!');
      }
      setHtmlSource('');
    } catch (error) {
      setStepStatus(prev => ({ ...prev, [activeStep]: 'error' }));
      toast.error(error instanceof Error ? error.message : 'Sync error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <DialogTitle className="text-xl font-bold">Scrape Pokémon Zone Data</DialogTitle>
            <p className="text-xs text-slate-500 mt-1">
              Manually scrape data by copying HTML/source or rendered content from each Pokémon Zone page in order.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isDeleting || isProcessing}
            className="text-xs font-semibold px-3 h-9"
          >
            {isDeleting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : '🗑️'} Clear all data
          </Button>
        </DialogHeader>

        {/* Stepper */}
        <div className="mt-4 flex items-center justify-between border rounded-xl bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30 overflow-x-auto gap-2">
          {steps.map((s) => {
            const isActive = activeStep === s.step;
            const status = stepStatus[s.step];
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setHtmlSource('');
                  setActiveStep(s.step as any);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                    : status === 'success'
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                )}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] border",
                  isActive
                    ? "bg-white text-slate-900 border-white"
                    : status === 'success'
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                )}>
                  {status === 'success' ? '✓' : s.step}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              Bước {activeStep}: {currentStepInfo.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{currentStepInfo.description}</p>

            <div className="mt-4 space-y-2 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                👉 Hướng dẫn cào:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-500">
                <li>
                  Click mở liên kết:{" "}
                  <a
                    href={currentStepInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 font-bold underline inline-flex items-center gap-0.5 mr-1"
                  >
                    {currentStepInfo.url} <ExternalLink className="h-3 w-3 inline" />
                  </a>
                  <span>(nhấn <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300">Ctrl + U</kbd> ở tab mới để xem mã nguồn)</span>
                  <span className="mx-1">hoặc</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText("view-source:" + currentStepInfo.url);
                      toast.success("Đã copy link view-source! Hãy dán vào thanh địa chỉ của tab mới.");
                    }}
                    className="h-6 px-2 text-[10px] inline-flex items-center gap-1 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    📋 Copy link View-Source
                  </Button>
                </li>
                <li>Nhấn phím <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Ctrl + A</kbd> (hoặc Cmd+A) trên trang view-source đó để bôi đen toàn bộ.</li>
                <li>Nhấn phím <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Ctrl + C</kbd> (hoặc Cmd+C) để copy mã nguồn.</li>
                <li>Quay lại đây và dán toàn bộ vào ô text bên dưới!</li>
              </ol>
              {activeStep === 4 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
                  Tier List nằm trong HTML card của view-source. Hãy dán toàn bộ source hoặc copy nội dung trang thường sau khi danh sách tier hiện xong. Nếu lỡ dán URL, hệ thống sẽ thử tự tải qua proxy trước.
                </div>
              )}
            </div>
          </div>

          {stepCounts[activeStep] && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 font-semibold space-y-1">
              <div>🎉 {stepCounts[activeStep]}</div>
              <div className="font-normal">
                Đã chuyển tab Dữ liệu CRUD sang đúng mục <span className="font-bold">{currentSyncedSection}</span>. Đóng popup là thấy dữ liệu vừa cào ngay; bấm nút bước tiếp theo để cào tiếp.
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Dán HTML/source hoặc nội dung trang tại đây:</Label>
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              placeholder={`Dán HTML/source hoặc nội dung đã copy từ ${currentStepInfo.url}...`}
              className="min-h-[160px] w-full rounded-lg border border-slate-200 bg-white p-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={activeStep === 1 || isProcessing}
                onClick={() => {
                  setHtmlSource('');
                  setActiveStep((activeStep - 1) as any);
                }}
                className="h-9 text-xs"
              >
                Quay lại Bước {activeStep - 1}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={activeStep === 5 || isProcessing}
                onClick={() => {
                  setHtmlSource('');
                  setActiveStep((activeStep + 1) as any);
                }}
                className="h-9 text-xs"
              >
                {stepStatus[activeStep] === 'success' ? 'Sang' : 'Bỏ qua tới'} Bước {activeStep + 1}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="h-9 text-xs"
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={handleScrape}
                disabled={isProcessing || !htmlSource.trim()}
                className="h-9 text-xs font-bold"
              >
                {isProcessing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                ⚡ Bắt đầu cào & Đồng bộ Bước {activeStep}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TiersCrud({ pokemon }: { pokemon: Pokemon[] }) {
  const savePokemon = useMutation(api.pokemonChampions.savePokemon);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const [openTiers, setOpenTiers] = useState<Set<string> | null>(null);

  const pokemonByTier = useMemo(() => {
    const map = new Map<string, Pokemon[]>();
    tiers.forEach(t => map.set(t, []));
    const unassigned: Pokemon[] = [];

    pokemon.forEach(p => {
      const tierTrait = p.traits.find(t => t.startsWith('Tier '));
      if (tierTrait) {
        const tier = tierTrait.replace('Tier ', '');
        if (map.has(tier)) {
          map.get(tier)!.push(p);
        } else {
          unassigned.push(p);
        }
      } else {
        unassigned.push(p);
      }
    });

    return { map, unassigned };
  }, [pokemon]);

  useEffect(() => {
    if (openTiers !== null) return;
    setOpenTiers(new Set(tiers.filter((tier) => (pokemonByTier.map.get(tier) ?? []).length > 0)));
  }, [openTiers, pokemonByTier]);

  const changeTier = async (p: Pokemon, nextTier: string) => {
    const baseTraits = p.traits.filter(t => !t.startsWith('Tier '));
    if (nextTier) {
      baseTraits.push(`Tier ${nextTier}`);
    }
    try {
      await savePokemon({
        active: p.active,
        bestItemId: p.bestItemId,
        dexNumber: p.dexNumber,
        formName: p.formName,
        id: p._id,
        imageUrl: p.imageUrl,
        name: p.name,
        notes: p.notes,
        primaryType: p.primaryType,
        recommendedItemIds: p.recommendedItemIds,
        secondaryType: p.secondaryType,
        traits: baseTraits,
      });
      toast.success(`Đã đổi ${getPokemonDisplayName(p)} sang Tier ${nextTier || 'Chưa xếp hạng'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi đổi tier');
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Tier List Pokémon" />
      <div className="space-y-3">
        {tiers.map((tier) => {
          const list = pokemonByTier.map.get(tier) || [];
          const isOpen = openTiers?.has(tier) ?? list.length > 0;
          const tierColor = tier === 'S' ? '#ef4444' : tier === 'A' ? '#f97316' : tier === 'B' ? '#eab308' : tier === 'C' ? '#3b82f6' : '#64748b';

          return (
            <Card key={tier} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenTiers((current) => {
                  const next = new Set(current);
                  if (next.has(tier)) {
                    next.delete(tier);
                  } else {
                    next.add(tier);
                  }
                  return next;
                })}
                className="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-lg" style={{ color: tierColor }}>Tier {tier}</span>
                  <Badge>{list.length}</Badge>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen ? 'rotate-180' : '')} />
              </button>

              {isOpen && (
                <CardContent className="p-3">
                  {list.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                      {list.map((p) => {
                        const displayName = getPokemonDisplayName(p);

                        return (
                          <div key={p._id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900">
                            <PokemonThumb imageUrl={p.imageUrl} name={displayName} className="h-11 w-11 shrink-0 object-contain" fallbackClassName="h-11 w-11 text-[11px]" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-bold">{displayName}</div>
                              <select
                                value={tier}
                                onChange={(e) => changeTier(p, e.target.value)}
                                className="mt-1 w-full border-0 bg-transparent p-0 text-[11px] font-semibold text-slate-500 focus:ring-0"
                              >
                                {tiers.map(t => <option key={t} value={t}>Tier {t}</option>)}
                                <option value="">Bỏ xếp hạng</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-slate-800">Trống</div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

type PokemonType = Doc<'pokemonChampionsTypes'>;

function TypesCrud({
  dbTypes
}: {
  dbTypes?: PokemonType[];
}) {
  const syncedTypes = useMemo(() => {
    return [...(dbTypes ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [dbTypes]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader title={`Pokémon Types · ${syncedTypes.length} scraped`} />
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          Source: pokemonChampionsTypes
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold">Synced Type data</div>
              <div className="text-xs text-slate-500">Step 1 writes to its own table — the list below should appear immediately after scraping.</div>
            </div>
            <Badge variant={syncedTypes.length > 0 ? 'success' : 'secondary'}>{syncedTypes.length} records</Badge>
          </div>
          {syncedTypes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {syncedTypes.map((type) => (
                <SyncedTypeRow key={type._id} type={type} />
              ))}
            </div>
          ) : (
            <EmptyState text="No Types in the database yet. Complete Step 1 scrape and the list will appear here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SyncedTypeRow({ type }: { type: PokemonType }) {
  const canonicalType = POKEMON_TYPES.find((item) => item.toLowerCase() === type.slug.toLowerCase() || item.toLowerCase() === type.name.toLowerCase());

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <PokemonTypeIcon label={canonicalType ?? type.name} imageUrl={type.imageUrl} />
      <div className="min-w-0">
        <div className="truncate text-base font-extrabold">{type.name}</div>
        <div className="truncate text-xs text-slate-400">{type.slug}</div>
      </div>
    </div>
  );
}

function PokemonTypeIcon({ label, imageUrl }: { label: string; imageUrl?: string }) {
  const canonicalType = POKEMON_TYPES.find((item) => item.toLowerCase() === label.toLowerCase());
  const details = canonicalType ? TYPE_DETAILS[canonicalType] : undefined;
  const shouldUseFallbackIcon = Boolean(details?.iconUrl);
  const source = details?.iconUrl || imageUrl;

  return (
    <span
      className={cn(
        'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full',
        shouldUseFallbackIcon ? '' : 'bg-slate-100 dark:bg-slate-800'
      )}
      style={shouldUseFallbackIcon ? { backgroundColor: details?.color } : undefined}
    >
      {source ? (
        <img src={source} alt={label} className={cn('object-contain', shouldUseFallbackIcon ? 'h-8 w-8' : 'h-12 w-12')} />
      ) : (
        <span className="text-xs text-slate-400">?</span>
      )}
    </span>
  );
}

type Team = Doc<'pokemonChampionsTeams'>;

function TeamsCrud({
  teams,
  pokemon,
  gameItems,
}: {
  teams: Team[];
  pokemon: Pokemon[];
  gameItems: GameItem[];
}) {
  const saveTeam = useMutation(api.pokemonChampions.saveTeam);
  const removeTeam = useMutation(api.pokemonChampions.removeTeam);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'pokemonChampionsTeams'> | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<{ pokemonId: string; gameItemId: string }[]>(
    Array(6).fill(null).map(() => ({ pokemonId: '', gameItemId: '' }))
  );

  const pokemonMap = useMemo(() => new Map(pokemon.map(p => [p._id, p])), [pokemon]);
  const itemMap = useMemo(() => new Map(gameItems.map(i => [i._id, i])), [gameItems]);

  const startEdit = (team: Team) => {
    setEditingId(team._id);
    setName(team.name);
    setDescription(team.description ?? '');
    const nextSlots = Array(6).fill(null).map((_, i) => {
      const slot = team.slots[i];
      return {
        pokemonId: slot?.pokemonId ?? '',
        gameItemId: slot?.gameItemId ?? '',
      };
    });
    setSlots(nextSlots);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSlots(Array(6).fill(null).map(() => ({ pokemonId: '', gameItemId: '' })));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredSlots = slots
      .filter(s => s.pokemonId)
      .map(s => ({
        pokemonId: s.pokemonId as Id<'pokemonChampionsPokemon'>,
        gameItemId: s.gameItemId ? (s.gameItemId as Id<'pokemonChampionsGameItems'>) : undefined,
      }));

    if (filteredSlots.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 Pokémon cho team.');
      return;
    }

    try {
      await saveTeam({
        id: editingId ?? undefined,
        name,
        description: description || undefined,
        slots: filteredSlots,
      });
      toast.success('Đã lưu team đấu giải.');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi lưu team.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader title={`Đội hình thi đấu (${teams.length})`} />
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          Tạo đội hình mới
        </Button>
      </div>

      <div className="space-y-3">
        {teams.map((team) => {
          const slots = Array.from({ length: 6 }, (_, index) => team.slots[index]);
          const resolvedSlots = slots.map((slot) => ({
            item: slot?.gameItemId ? itemMap.get(slot.gameItemId) : undefined,
            pokemon: slot?.pokemonId ? pokemonMap.get(slot.pokemonId) : undefined,
          }));
          const filledSlots = resolvedSlots.filter((slot) => slot.pokemon).length;
          const itemSlots = resolvedSlots.filter((slot) => slot.item).length;

          return (
            <Card key={team._id} className="overflow-hidden">
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(210px,280px)_1fr_auto] lg:items-center">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>#{team.order + 1}</Badge>
                    <Badge>{filledSlots}/6 Pokémon</Badge>
                    <Badge>{itemSlots} item</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold leading-snug text-slate-900 dark:text-slate-100">
                      {getTeamDisplayName(team, pokemonMap)}
                    </h4>
                    {team.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{team.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {resolvedSlots.map((slot, idx) => (
                    <TeamMemberPill key={idx} index={idx} item={slot.item} pokemon={slot.pokemon} />
                  ))}
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => startEdit(team)}>Edit</Button>
                  <Button size="sm" variant="destructive" className="h-8 px-3" onClick={async () => {
                    if (window.confirm('Delete this team?')) {
                      await removeTeam({ id: team._id });
                      toast.success('Team deleted.');
                    }
                  }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {teams.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400 dark:border-slate-800">No competition teams yet. Click the Pokémon Zone scrape button to sync quickly.</div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Team' : 'Create New Competition Team'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 py-4">
            <Field label="Team / Tournament Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Wolfe Glick - Indianapolis Regional Champion" />
            </Field>
            <Field label="Description / Notes">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a description for this competition team..." />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 pt-2">
              {slots.map((slot, idx) => (
                <Card key={idx} className="p-3 border dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 mb-2">Member #{idx + 1}</div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 block">Pokémon</label>
                    <select
                      value={slot.pokemonId}
                      onChange={(e) => {
                        const next = [...slots];
                        next[idx].pokemonId = e.target.value;
                        setSlots(next);
                      }}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="">Select Pokémon</option>
                      {pokemon.map(p => <option key={p._id} value={p._id}>#{p.dexNumber} {getPokemonDisplayName(p)}</option>)}
                    </select>

                    <label className="text-[10px] font-semibold text-slate-400 block mt-1">Held item</label>
                    <select
                      value={slot.gameItemId}
                      onChange={(e) => {
                        const next = [...slots];
                        next[idx].gameItemId = e.target.value;
                        setSlots(next);
                      }}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="">Select Item</option>
                      {gameItems.map(item => <option key={item._id} value={item._id}>{getGameItemDisplayName(item)}</option>)}
                    </select>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit"><Save className="mr-2 h-4 w-4" />{editingId ? 'Update' : 'Create Team'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getGameItemDisplayName(item: GameItem) {
  if (item.slug) return formatSlugLabel(item.slug);
  const fullName = item.name;
  
  const stopWords = [
    'If ', 'Restores ', 'Boosts ', 'A ', 'When ', 'Prevents ', 'Halves ', 'Raises ', 'Lowers ', 
    'Heals ', 'Increases ', 'Decreases ', 'Allows ', 'Cures ', 'Inflicts ', 'Confuses ', 'Promotes ', 
    'Negates ', 'Temporarily ', 'At ', 'On ', 'Upon ', 'Each ', 'During ', 'The ', 'After ', 'By ',
    'held item', 'held ', 'item '
  ];
  
  let cleanName = fullName;
  let minIndex = fullName.length;
  
  for (const word of stopWords) {
    const idx = fullName.indexOf(word);
    if (idx !== -1 && idx < minIndex && idx > 2) {
      minIndex = idx;
    }
  }
  
  if (minIndex < fullName.length) {
    cleanName = fullName.substring(0, minIndex).trim();
  }
  
  return cleanName.replace(/[,.;:]+$/, '').trim();
}

function getTeamDisplayName(team: Team, pokemonMap: Map<Id<'pokemonChampionsPokemon'>, Pokemon>) {
  const names = team.slots
    .map((slot) => pokemonMap.get(slot.pokemonId))
    .filter((pokemon): pokemon is Pokemon => Boolean(pokemon))
    .map(getPokemonDisplayName);

  return names.length > 0 ? names.join(' / ') : team.name;
}

function GameItemPreviewThumb({
  imageUrl,
  name,
  alt = '',
  className,
  fallbackClassName,
}: {
  imageUrl?: string;
  name: string;
  alt?: string;
  className: string;
  fallbackClassName?: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const canShowImage = Boolean(imageUrl) && !hasImageError;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'IT';

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (canShowImage) {
    return <img src={imageUrl} alt={alt} onError={() => setHasImageError(true)} className={className} />;
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 font-bold text-amber-600 shadow-inner dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-400',
        fallbackClassName ?? className
      )}
    >
      <span className="truncate px-1 text-[10px] uppercase font-black">{initials}</span>
    </div>
  );
}

function TeamMemberPill({
  index,
  item,
  pokemon,
}: {
  index: number;
  item?: GameItem;
  pokemon?: Pokemon;
}) {
  if (!pokemon) {
    return (
      <div className="flex min-h-[96px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
        Slot {index + 1}
      </div>
    );
  }

  const pokemonName = getPokemonDisplayName(pokemon);
  const itemName = item ? getGameItemDisplayName(item) : 'No item';

  return (
    <div className="group/slot flex items-center justify-center min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="relative mx-auto h-20 w-20">
        <PokemonThumb imageUrl={pokemon.imageUrl} name={pokemonName} className="h-20 w-20 object-contain transition duration-200 group-hover/slot:scale-110" fallbackClassName="h-20 w-20 text-[11px]" />
        {item && (
          <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition duration-200 group-hover/slot:scale-110">
            <GameItemPreviewThumb imageUrl={item.imageUrl} name={itemName} className="h-6 w-6 object-contain" fallbackClassName="h-6 w-6 text-[8px] rounded-full" />
          </span>
        )}
      </div>
    </div>
  );
}

function PokemonCrud({ gameItems, pokemon }: { gameItems: GameItem[]; pokemon: Pokemon[] }) {
  const savePokemon = useMutation(api.pokemonChampions.savePokemon);
  const removePokemon = useMutation(api.pokemonChampions.removePokemon);
  const [editingId, setEditingId] = useState<Id<'pokemonChampionsPokemon'> | null>(null);
  const [draft, setDraft] = useState(emptyPokemonDraft);

  const [cols, setCols] = useState<3 | 5>(3);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = cols === 5 ? 15 : 12;

  const startEdit = (item: Pokemon) => {
    setEditingId(item._id);
    setDraft({
      active: item.active,
      bestItemId: item.bestItemId ?? '',
      dexNumber: item.dexNumber,
      imageUrl: item.imageUrl,
      name: item.name,
      notes: item.notes ?? '',
      primaryType: item.primaryType,
      secondaryType: item.secondaryType ?? '',
      traits: item.traits.join(', '),
    });
    setIsDialogOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await savePokemon({
        active: draft.active,
        bestItemId: draft.bestItemId ? draft.bestItemId as Id<'pokemonChampionsGameItems'> : undefined,
        dexNumber: Number(draft.dexNumber) || 0,
        id: editingId ?? undefined,
        imageUrl: draft.imageUrl,
        name: draft.name,
        notes: draft.notes,
        primaryType: draft.primaryType,
        secondaryType: draft.secondaryType,
        traits: draft.traits.split(',').map(t => t.trim()).filter(Boolean),
      });
      setDraft(emptyPokemonDraft);
      setEditingId(null);
      setIsDialogOpen(false);
      toast.success('Đã lưu Pokémon.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu Pokémon.');
    }
  };



  const filteredPokemon = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pokemon;
    return pokemon.filter((item) => {
      const haystack = `${item.name} ${item.primaryType} ${item.secondaryType ?? ''} ${item.dexNumber}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [pokemon, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage) || 1;
  const paginatedPokemon = useMemo(() => {
    return filteredPokemon.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredPokemon, currentPage, itemsPerPage]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeader title={`Pokemon (${filteredPokemon.length})`} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, hệ, số Dex..."
              className="pl-9 h-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCols(3)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                cols === 3
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              3 Cột
            </button>
            <button
              type="button"
              onClick={() => setCols(5)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                cols === 5
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              5 Cột
            </button>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditingId(null);
              setDraft(emptyPokemonDraft);
              setIsDialogOpen(true);
            }}
          >
            Add Pokémon
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Update Pokémon' : 'Add New Pokémon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 py-4 md:grid-cols-2">
            <Field label="Name"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></Field>
            <Field label="Dex"><Input type="number" value={draft.dexNumber} onChange={(e) => setDraft({ ...draft, dexNumber: Number(e.target.value) })} required /></Field>
            <Field label="Primary type">
              <select
                value={draft.primaryType}
                onChange={(e) => setDraft({ ...draft, primaryType: e.target.value })}
                required
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {POKEMON_TYPES.filter(t => t !== 'All').map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Secondary type">
              <select
                value={draft.secondaryType}
                onChange={(e) => setDraft({ ...draft, secondaryType: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Không có</option>
                {POKEMON_TYPES.filter(t => t !== 'All').map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Image">
                <SettingsImageUploader
                  value={draft.imageUrl}
                  onChange={(url) => setDraft({ ...draft, imageUrl: url ?? '' })}
                  folder="pokemon-champions/pokemon"
                  previewSize="md"
                />
              </Field>
            </div>
            <Field label="Best item">
              <ItemSelect
                value={draft.bestItemId}
                onChange={(val) => setDraft({ ...draft, bestItemId: val })}
                items={gameItems}
              />
            </Field>
            <Field label="Traits"><Input value={draft.traits} onChange={(e) => setDraft({ ...draft, traits: e.target.value })} placeholder="Fast attacker, Mega-ready" /></Field>
            <div className="md:col-span-2">
              <Field label="Notes"><Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
              Active
            </label>
            <div className="flex justify-end gap-2 md:col-span-2 pt-4 border-t dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setDraft(emptyPokemonDraft); setEditingId(null); }}>Cancel</Button>
              <Button type="submit"><Save className="mr-2 h-4 w-4" />{editingId ? 'Update' : 'Add Pokémon'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className={cn(
        "grid gap-3",
        cols === 5
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      )}>
        {paginatedPokemon.map((item) => (
          <Card key={item._id}>
            <CardContent className={cn("flex gap-3 p-4", cols === 5 ? "p-3 gap-2" : "")}>
              <PokemonThumb
                imageUrl={item.imageUrl}
                name={item.name}
                alt={item.name}
                className={cn(
                  "rounded-xl bg-slate-100 object-contain dark:bg-slate-800 shrink-0",
                  cols === 5 ? "h-14 w-14 p-1" : "h-20 w-20 p-2"
                )}
                fallbackClassName={cn(
                  cols === 5 ? "h-14 w-14 text-[11px]" : "h-20 w-20 text-xs"
                )}
              />
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 flex-wrap">
                    <div className={cn("font-semibold truncate", cols === 5 ? "text-xs font-bold" : "text-sm font-semibold")}>
                      {item.name}
                    </div>
                    <Badge variant={item.active ? 'success' : 'secondary'} className={cn(cols === 5 ? "text-[10px] px-1.5 py-0" : "")}>
                      {item.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <div className={cn("text-slate-500", cols === 5 ? "text-[10px]" : "text-xs")}>
                    #{item.dexNumber} · {item.primaryType}{item.secondaryType ? ` / ${item.secondaryType}` : ''}
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button type="button" size="sm" variant="outline" className={cn("h-7 px-2 text-xs", cols === 5 ? "h-6 px-1.5 text-[11px]" : "")} onClick={() => startEdit(item)}>Edit</Button>
                  <Button type="button" size="sm" variant="destructive" className={cn("h-7 px-2", cols === 5 ? "h-6 px-1.5" : "")} onClick={async () => {
                    if (window.confirm('Delete this Pokémon?')) {
                      const result = await removePokemon({ id: item._id });
                      toast.success(result.archived ? 'Hidden — has related orders.' : 'Pokémon deleted.');
                    }
                  }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1 flex-wrap">
          {generatePaginationItems(currentPage, totalPages).map((item, idx) => {
            if (item === 'ellipsis') {
              return <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400">...</span>;
            }
            return (
              <Button
                key={`page-${item}`}
                variant={currentPage === item ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GameItemCrud({ gameItems }: { gameItems: GameItem[] }) {
  const saveGameItem = useMutation(api.pokemonChampions.saveGameItem);
  const removeGameItem = useMutation(api.pokemonChampions.removeGameItem);
  const [editingId, setEditingId] = useState<Id<'pokemonChampionsGameItems'> | null>(null);
  const [draft, setDraft] = useState(emptyItemDraft);

  const [cols, setCols] = useState<3 | 5>(3);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = cols === 5 ? 15 : 12;

  const startEdit = (item: GameItem) => {
    setEditingId(item._id);
    setDraft({
      active: item.active,
      description: item.description ?? '',
      icon: item.icon ?? 'Sparkles',
      imageUrl: item.imageUrl ?? '',
      name: item.name,
      priceLabel: item.priceLabel ?? '',
      rarity: item.rarity,
      slug: item.slug,
      tags: item.tags?.join(', ') ?? '',
    });
    setIsDialogOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await saveGameItem({
        active: draft.active,
        description: draft.description,
        icon: draft.icon,
        id: editingId ?? undefined,
        imageUrl: draft.imageUrl,
        name: draft.name,
        priceLabel: draft.priceLabel,
        rarity: draft.rarity as GameItem['rarity'],
        slug: draft.slug,
        tags: draft.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setDraft(emptyItemDraft);
      setEditingId(null);
      setIsDialogOpen(false);
      toast.success('Đã lưu item.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu item.');
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return gameItems;
    return gameItems.filter((item) => {
      const haystack = `${item.name} ${item.description ?? ''} ${item.rarity} ${item.slug} ${item.tags?.join(' ') ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [gameItems, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    return filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeader title={`Game items (${filteredItems.length})`} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mô tả, tags..."
              className="pl-9 h-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCols(3)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                cols === 3
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              3 Cột
            </button>
            <button
              type="button"
              onClick={() => setCols(5)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                cols === 5
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              5 Cột
            </button>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditingId(null);
              setDraft(emptyItemDraft);
              setIsDialogOpen(true);
            }}
          >
            Add Item
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Update Game Item' : 'Add New Game Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 py-4 md:grid-cols-2">
            <Field label="Name"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></Field>
            <Field label="Slug"><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></Field>
            <Field label="Rarity">
              <select value={draft.rarity} onChange={(e) => setDraft({ ...draft, rarity: e.target.value })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                {['common', 'rare', 'epic', 'legendary'].map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
              </select>
            </Field>
            <Field label="Price label"><Input value={draft.priceLabel} onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })} /></Field>
            <Field label="Icon"><Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} /></Field>
            <Field label="Tags"><Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Image">
                <SettingsImageUploader
                  value={draft.imageUrl}
                  onChange={(url) => setDraft({ ...draft, imageUrl: url ?? '' })}
                  folder="pokemon-champions/game-items"
                  previewSize="md"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description"><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
              Active
            </label>
            <div className="flex justify-end gap-2 md:col-span-2 pt-4 border-t dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setDraft(emptyItemDraft); setEditingId(null); }}>Cancel</Button>
              <Button type="submit"><Save className="mr-2 h-4 w-4" />{editingId ? 'Update' : 'Add Item'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className={cn(
        "grid gap-3",
        cols === 5
          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      )}>
        {paginatedItems.map((item) => (
          <Card key={item._id} className="min-w-0 overflow-hidden">
            <CardContent className={cn("flex h-full min-h-[150px] flex-col p-4", cols === 5 ? "min-h-[142px] p-3" : "")}>
              <div className="flex min-w-0 items-start gap-3">
                <GameItemThumb item={item} compact={cols === 5} />
                <div className="min-w-0 flex-1">
                  <div className={cn(
                    "break-words font-bold leading-snug text-slate-900 dark:text-slate-100",
                    cols === 5 ? "line-clamp-2 text-xs" : "line-clamp-2 text-sm"
                  )}>
                    {item.name}
                  </div>
                  <div className={cn("mt-1 truncate text-slate-500", cols === 5 ? "text-[10px]" : "text-xs")}>
                    {item.rarity} · {item.priceLabel ?? 'Contact'}
                  </div>
                </div>
                {!item.active && (
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                    Hidden
                  </Badge>
                )}
              </div>
              <p className={cn("mt-2 min-w-0 break-words text-slate-500", cols === 5 ? "line-clamp-2 text-[11px]" : "line-clamp-2 text-sm")}>
                {item.description || 'No description.'}
              </p>
              <div className="mt-auto flex gap-2 pt-3">
                <Button type="button" size="sm" variant="outline" className={cn("h-7 px-2 text-xs", cols === 5 ? "h-6 px-1.5 text-[11px]" : "")} onClick={() => startEdit(item)}>Edit</Button>
                <Button type="button" size="sm" variant="destructive" className={cn("h-7 px-2", cols === 5 ? "h-6 px-1.5" : "")} onClick={async () => {
                  if (window.confirm('Delete this item?')) {
                    const result = await removeGameItem({ id: item._id });
                    toast.success(result.archived ? 'Hidden — has related orders.' : 'Item deleted.');
                  }
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1 flex-wrap">
          {generatePaginationItems(currentPage, totalPages).map((item, idx) => {
            if (item === 'ellipsis') {
              return <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400">...</span>;
            }
            return (
              <Button
                key={`page-${item}`}
                variant={currentPage === item ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrdersPanel({ gameItems, orders, pokemon }: { gameItems: GameItem[]; orders: Order[]; pokemon: Pokemon[] }) {
  const updateOrderStatus = useMutation(api.pokemonChampions.updateOrderStatus);
  const removeOrder = useMutation(api.pokemonChampions.removeOrder);
  const itemMap = useMemo(() => new Map(gameItems.map((item) => [item._id, item])), [gameItems]);
  const pokemonMap = useMemo(() => new Map(pokemon.map((item) => [item._id, item])), [pokemon]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      const pokeName = order.pokemonId ? (pokemonMap.get(order.pokemonId as Id<'pokemonChampionsPokemon'>)?.name ?? '') : '';
      const itemName = order.gameItemId ? (itemMap.get(order.gameItemId as Id<'pokemonChampionsGameItems'>)?.name ?? '') : '';
      const haystack = `${order.orderNumber} ${order.customerName} ${order.contactHandle} ${order.note ?? ''} ${pokeName} ${itemName}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, searchTerm, pokemonMap, itemMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeader title={`Orders (${filteredOrders.length})`} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã, tên khách, pokemon..."
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {paginatedOrders.map((order) => (
          <Card key={order._id}>
            <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_220px_auto] lg:items-center">
              <div>
                <div className="font-semibold">{order.orderNumber} · {order.customerName}</div>
                <div className="text-sm text-slate-500">
                  {pokemonMap.get(order.pokemonId as Id<'pokemonChampionsPokemon'>)?.name ?? 'Advice needed'} · {itemMap.get(order.gameItemId as Id<'pokemonChampionsGameItems'>)?.name ?? 'No item selected'}
                </div>
                <div className="mt-1 text-xs text-slate-400">{order.contactType}: {order.contactHandle}</div>
                {order.note && <p className="mt-2 text-sm text-slate-500">{order.note}</p>}
              </div>
              <select
                value={order.status}
                onChange={async (event) => {
                  await updateOrderStatus({ id: order._id, status: event.target.value as Order['status'] });
                  toast.success('Order status updated.');
                }}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <Button type="button" variant="destructive" size="sm" onClick={async () => {
                if (window.confirm('Delete this order?')) {
                  await removeOrder({ id: order._id });
                  toast.success('Order deleted.');
                }
              }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && <EmptyState text="No matching orders." />}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1 flex-wrap">
          {generatePaginationItems(currentPage, totalPages).map((item, idx) => {
            if (item === 'ellipsis') {
              return <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400">...</span>;
            }
            return (
              <Button
                key={`page-${item}`}
                variant={currentPage === item ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomersPanel({ customers }: { customers: Customer[] }) {
  const saveCustomer = useMutation(api.pokemonChampions.saveCustomer);
  const removeCustomer = useMutation(api.pokemonChampions.removeCustomer);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => {
      const haystack = `${customer.name} ${customer.contactHandle} ${customer.email ?? ''} ${customer.note ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [customers, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeader title={`Customers (${filteredCustomers.length})`} />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, contact, email..."
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {paginatedCustomers.map((customer) => (
          <Card key={customer._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-xs text-slate-500">{customer.contactType}: {customer.contactHandle}</div>
                </div>
                <Badge variant={customer.status === 'active' ? 'success' : 'secondary'}>{customer.status}</Badge>
              </div>
              <div className="mt-3 text-sm text-slate-500">{customer.orderCount} orders</div>
              <div className="mt-3 flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={async () => {
                  await saveCustomer({
                    contactHandle: customer.contactHandle,
                    contactType: customer.contactType,
                    email: customer.email,
                    id: customer._id,
                    name: customer.name,
                    note: customer.note,
                    status: customer.status === 'active' ? 'blocked' : 'active',
                  });
                  toast.success('Customer updated.');
                }}>{customer.status === 'active' ? 'Block' : 'Unblock'}</Button>
                <Button type="button" size="sm" variant="destructive" onClick={async () => {
                  if (window.confirm('Delete this customer?')) {
                    const result = await removeCustomer({ id: customer._id });
                    toast.success(result.archived ? 'Blocked — has related orders.' : 'Customer deleted.');
                  }
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCustomers.length === 0 && <EmptyState text="No matching customers." />}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1 flex-wrap">
          {generatePaginationItems(currentPage, totalPages).map((item, idx) => {
            if (item === 'ellipsis') {
              return <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400">...</span>;
            }
            return (
              <Button
                key={`page-${item}`}
                variant={currentPage === item ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PokemonThumb({
  imageUrl,
  name,
  alt = '',
  className,
  fallbackClassName,
}: {
  imageUrl?: string;
  name: string;
  alt?: string;
  className: string;
  fallbackClassName?: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const canShowImage = Boolean(imageUrl) && !hasImageError;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (canShowImage) {
    return <img src={imageUrl} alt={alt} onError={() => setHasImageError(true)} className={className} />;
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-200 font-black text-slate-500 shadow-inner dark:border-slate-800 dark:from-slate-800 dark:to-slate-950 dark:text-slate-300',
        fallbackClassName ?? className
      )}
    >
      <span className="truncate px-1">{initials}</span>
    </div>
  );
}

function GameItemThumb({ item, compact }: { item: GameItem; compact: boolean }) {
  const [hasImageError, setHasImageError] = useState(false);
  const canShowImage = Boolean(item.imageUrl) && !hasImageError;
  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'IT';

  useEffect(() => {
    setHasImageError(false);
  }, [item.imageUrl]);

  if (canShowImage) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        onError={() => setHasImageError(true)}
        className={cn(
          "shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-contain dark:border-slate-800 dark:bg-slate-950",
          compact ? "h-11 w-11 p-1" : "h-14 w-14 p-1.5"
        )}
      />
    );
  }

  return (
    <div className={cn(
      "flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-200 font-black text-slate-500 shadow-inner dark:border-slate-800 dark:from-slate-800 dark:to-slate-950 dark:text-slate-300",
      compact ? "h-11 w-11 text-[11px]" : "h-14 w-14 text-xs"
    )}>
      {item.icon && item.icon !== 'Sparkles' ? (
        <span className="truncate px-1">{item.icon.slice(0, 2).toUpperCase()}</span>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}



type PokemonRouteSurface = 'standalone-route' | 'site-layout';
type PokemonCornerRadius = 'none' | 'sm' | 'lg';

function toRouteSurface(value: unknown): PokemonRouteSurface {
  return value === 'standalone-route' ? 'standalone-route' : 'site-layout';
}

function HomeComponentPanel({
  appConfig,
  appId,
  gameItems,
  pokemon,
  settingsDoc: _settingsDoc,
  teams,
  dbTypes,
}: {
  appConfig: MiniAppConfig;
  appId?: Id<'miniApps'>;
  gameItems: GameItem[];
  pokemon: Pokemon[];
  settingsDoc: Doc<'pokemonChampionsSettings'> | null;
  teams: Team[];
  dbTypes: PokemonType[];
}) {
  const updateMiniApp = useMutation(api.miniApps.updateSettings);
  const syncHomeComponent = useMutation(api.pokemonChampions.syncHomeComponent);
  const homeConfig = (appConfig.homeComponent && typeof appConfig.homeComponent === 'object' ? appConfig.homeComponent : {}) as Record<string, unknown>;
  const [enabled, setEnabled] = useState(Boolean(homeConfig.enabled));
  const [style, setStyle] = useState(typeof homeConfig.style === 'string' ? homeConfig.style : 'grid');
  const [maxItems, setMaxItems] = useState(Number(homeConfig.maxItems ?? 8));
  const [routeSurface, setRouteSurface] = useState<PokemonRouteSurface>(toRouteSurface(appConfig.routeSurface));
  const [cornerRadius, setCornerRadius] = useState<PokemonCornerRadius>((homeConfig.cornerRadius as PokemonCornerRadius) || 'lg');
  const { device, setDevice } = usePreviewDevice();

  const save = async () => {
    const routeUrl = routeSurface === 'standalone-route' ? '/apps/pokemon-champions' : '/pokemon-champions';
    const nextConfig = {
      ...appConfig,
      homeComponent: { enabled, maxItems, style, cornerRadius },
      routeSurface,
    };
    if (appId) {
      await updateMiniApp({
        config: nextConfig,
        id: appId,
        routeMode: routeSurface === 'standalone-route' ? 'namespaced' : 'root',
        routeSlug: 'pokemon-champions',
      });
    }
    await syncHomeComponent({
      enabled,
      config: {
        ctaText: 'Open order desk',
        maxItems,
        routeUrl,
        style,
        cornerRadius,
      },
    });
    toast.success(enabled ? 'Đã đồng bộ home-component Pokemon Champions.' : 'Đã tắt home-component Pokemon Champions.');
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Home-component" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="flex h-10 items-center">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Hiện ở Home Components
              </label>
            </div>
            <Field label="Max Pokemon cards">
              <Input
                type="number"
                min={3}
                max={12}
                value={maxItems}
                onChange={(e) => setMaxItems(Number(e.target.value))}
              />
            </Field>
            <Field label="Kiểu route">
              <select
                value={routeSurface}
                onChange={(e) => setRouteSurface(e.target.value as PokemonRouteSurface)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="site-layout">Dùng chung layout site</option>
                <option value="standalone-route">Site route riêng</option>
              </select>
            </Field>
            <Field label="Bo góc card">
              <select
                value={cornerRadius}
                onChange={(e) => setCornerRadius(e.target.value as PokemonCornerRadius)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="none">Không bo góc</option>
                <option value="sm">Bo góc ít</option>
                <option value="lg">Bo góc nhiều</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={save} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />Lưu & đồng bộ Home Component
            </Button>
          </div>
        </CardContent>
      </Card>

      <PokemonHomePreview
        gameItems={gameItems}
        pokemon={pokemon}
        teams={teams}
        dbTypes={dbTypes}
        styleName={style}
        setStyleName={setStyle}
        cornerRadius={cornerRadius}
        device={device}
        setDevice={setDevice}
      />
    </div>
  );
}

function PokemonHomePreview({
  gameItems,
  pokemon,
  teams,
  dbTypes,
  styleName,
  setStyleName,
  cornerRadius,
  device,
  setDevice,
}: {
  gameItems: GameItem[];
  pokemon: Pokemon[];
  teams: Team[];
  dbTypes: PokemonType[];
  styleName: string;
  setStyleName: (style: string) => void;
  cornerRadius: PokemonCornerRadius;
  device: PreviewDevice;
  setDevice: (d: PreviewDevice) => void;
}) {
  const itemMap = useMemo(() => new Map(gameItems.map((item) => [item._id, item])), [gameItems]);
  const { isDark } = usePreviewDark();
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<GameItem | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const brandColors = useBrandColors();
  const primaryColor = brandColors.primary;
  const secondaryColor = brandColors.secondary || '#facc15';

  const previewStyles = [
    { id: 'grid', label: 'Grid Standard' },
    { id: 'compact', label: 'Compact Grid' },
    { id: 'list', label: 'Horizontal Grid' }
  ];

  const cardRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-3xl';
  const thumbRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-lg' : 'rounded-2xl';

  // Tabs state
  const [activeTab, setActiveTab] = useState<'tier-list' | 'team' | 'pokemon' | 'game-item'>('tier-list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [openTiers, setOpenTiers] = useState<Set<string> | null>(null);

  const activePokemon = useMemo(() => pokemon.filter(p => p.active !== false), [pokemon]);

  // 1. Tier list grouping
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const pokemonByTier = useMemo(() => {
    const map = new Map<string, Pokemon[]>();
    tiers.forEach(t => map.set(t, []));
    
    activePokemon.forEach(p => {
      const tierTrait = p.traits?.find(t => t.startsWith('Tier '));
      if (tierTrait) {
        const tier = tierTrait.replace('Tier ', '');
        if (map.has(tier)) {
          map.get(tier)!.push(p);
        }
      }
    });
    return map;
  }, [activePokemon]);

  useEffect(() => {
    if (openTiers !== null || activePokemon === undefined) return;
    const initialTiers = new Set<string>(tiers.filter(t => (pokemonByTier.get(t) ?? []).length > 0));
    setOpenTiers(initialTiers);
  }, [openTiers, activePokemon, pokemonByTier]);

  // 2. Types list


  // 3. Filter Pokémon
  const filteredPokemon = useMemo(() => {
    return activePokemon.filter(p => {
      const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'All' || 
        p.primaryType === selectedType || 
        p.secondaryType === selectedType;
      return matchName && matchType;
    });
  }, [activePokemon, searchQuery, selectedType]);

  // 4. Pagination
  const itemsPerPage = 24;
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  const paginatedPokemon = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPokemon.slice(start, start + itemsPerPage);
  }, [filteredPokemon, currentPage]);

  const tabs = [
    { id: 'tier-list', label: 'Tier List', icon: Trophy },
    { id: 'team', label: 'Teams', icon: Swords },
    { id: 'pokemon', label: 'Pokémon', icon: Gamepad2 },
    { id: 'game-item', label: 'Items', icon: Sparkles },
  ] as const;

  const activeTeams = useMemo(() => teams.filter(t => t.active !== false), [teams]);
  const activeItems = useMemo(() => gameItems.filter(i => i.active !== false), [gameItems]);

  return (
    <div className="space-y-4">
      <PreviewWrapper
        title="Preview Home Component"
        device={device}
        setDevice={setDevice}
        previewStyle={styleName}
        setPreviewStyle={setStyleName}
        styles={previewStyles}
        info={`${activePokemon.length} Pokémon • ${brandColors.mode === 'dual' ? '2 màu' : '1 màu'}`}
        deviceWidthClass={deviceWidths[device]}
      >
        <BrowserFrame url="yoursite.com">
          <div
            className={cn(
              'p-8 transition-colors duration-200 text-left',
              isDark ? 'bg-[#0f0709] text-white' : 'bg-[#fafafa] text-slate-900'
            )}
            style={{
              background: isDark
                ? `radial-gradient(circle at top left, ${primaryColor}1a 0, transparent 34%), radial-gradient(circle at bottom right, ${secondaryColor}15 0, transparent 28%), #0f0709`
                : `radial-gradient(circle at top left, ${primaryColor}0a 0, transparent 40%), radial-gradient(circle at bottom right, ${secondaryColor}08 0, transparent 35%), #fafafa`
            }}
          >
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <div
                  className={cn(
                    'mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                    isDark ? 'border-white/10 bg-white/10' : 'border-slate-200 bg-white shadow-sm'
                  )}
                  style={{ color: primaryColor }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Pokémon Champions
                </div>
                <h3 className="text-3xl font-black tracking-tight md:text-4xl">
                  Pokémon Champions order desk
                </h3>
              </div>
            </div>
            
            <div
              className={cn(
                'mb-6 flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-5 transition duration-200',
                cardRadiusClass,
                isDark ? 'text-white' : 'text-slate-900'
              )}
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: primaryColor,
                borderColor: isDark ? `${primaryColor}30` : `${primaryColor}20`,
                backgroundColor: isDark ? `${primaryColor}15` : `${primaryColor}08`,
                boxShadow: isDark ? `0 0 15px ${primaryColor}10` : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-start gap-3 text-left">
                <div
                  className="mt-1 rounded-full p-1.5 shrink-0"
                  style={{ backgroundColor: isDark ? `${primaryColor}20` : `${primaryColor}10`, color: primaryColor }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>ANNOUNCEMENT</h4>
                  <p className={cn('text-sm mt-0.5 font-medium', isDark ? 'text-white/80' : 'text-slate-600')}>
                    Shop hiện đang mở cửa nhận đơn hàng! Hãy gửi thông tin đặt hàng nhanh để được admin hỗ trợ kịp thời.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickOrderOpen(true)}
                className="w-full shrink-0 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] md:w-auto"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}30`
                }}
              >
                Đặt hàng ngay
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8 flex justify-center border-b border-slate-200 dark:border-slate-800 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-2 -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition duration-200 focus:outline-none whitespace-nowrap",
                        isActive
                          ? "text-cyan-500"
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      )}
                      style={isActive ? { borderColor: primaryColor, color: primaryColor } : {}}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {/* Tab 1: Tier List */}
              {activeTab === 'tier-list' && (
                <div className="space-y-4">
                  {tiers.every(t => (pokemonByTier.get(t) ?? []).length === 0) ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      Chưa có Pokémon nào được xếp hạng Tier.
                    </div>
                  ) : (
                    tiers.map((tier) => {
                      const list = pokemonByTier.get(tier) ?? [];
                      const isOpen = openTiers?.has(tier) ?? list.length > 0;
                      const tierColor = tier === 'S' ? '#ef4444' : tier === 'A' ? '#f97316' : tier === 'B' ? '#eab308' : tier === 'C' ? '#3b82f6' : '#64748b';

                      return (
                        <div
                          key={tier}
                          className={cn(
                            "border overflow-hidden transition duration-200",
                            cardRadiusClass,
                            isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenTiers((current) => {
                              const next = current ? new Set<string>(current) : new Set<string>();
                              if (next.has(tier)) {
                                next.delete(tier);
                              } else {
                                next.add(tier);
                              }
                              return next;
                            })}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 border-b px-5 py-3.5 text-left transition",
                              isDark
                                ? "border-white/5 bg-white/[0.04] hover:bg-white/[0.08]"
                                : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-black text-lg" style={{ color: tierColor }}>Tier {tier}</span>
                              <span className={cn(
                                "rounded-md px-2 py-0.5 text-xs font-bold shadow-inner",
                                isDark ? "bg-white/10 text-white" : "bg-slate-200 text-slate-700"
                              )}>
                                {list.length}
                              </span>
                            </div>
                            <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', isOpen ? 'rotate-180' : '')} />
                          </button>

                          {isOpen && (
                            <div className="p-4">
                              {list.length > 0 ? (
                                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                                  {list.map((item) => {
                                    const displayName = getPokemonDisplayName(item);
                                    return (
                                      <div
                                        key={item._id}
                                        className={cn(
                                          "relative flex flex-col items-center text-center border p-3 transition-all duration-200 hover:scale-[1.03] group",
                                          cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-2xl',
                                          isDark 
                                            ? "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/25" 
                                            : "border-slate-100 bg-white shadow-sm hover:border-slate-200 hover:shadow-md"
                                        )}
                                      >
                                        <div className={cn("h-20 w-full mb-2.5 flex items-center justify-center rounded-xl overflow-hidden transition-colors duration-200", isDark ? "bg-white/5 group-hover:bg-white/10" : "bg-slate-50 group-hover:bg-slate-100/70")}>
                                          <PokemonThumb imageUrl={item.imageUrl} name={displayName} className="h-20 w-20 object-contain p-1.5 transition duration-200 group-hover:scale-108" fallbackClassName="h-20 w-20 text-[13px] rounded-xl font-bold" />
                                        </div>
                                        <div className="min-w-0 w-full mt-1 px-1">
                                          <div className={cn("truncate text-xs sm:text-sm font-extrabold tracking-tight", isDark ? "text-white" : "text-slate-900")}>{displayName}</div>
                                          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                            Tier {tier}
                                          </div>
                                        </div>
                                        <div className="absolute bottom-2.5 right-2.5 text-slate-300 dark:text-slate-700/70">
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="py-8 text-center text-xs text-slate-400">Trống</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Team */}
              {activeTab === 'team' && (
                <div className="space-y-4">
                  {activeTeams.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      Chưa có đội hình đề xuất nào từ đấu giải.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTeams.map((team) => {
                        const slots = Array.from({ length: 6 }, (_, index) => team.slots[index]);
                        const resolvedSlots = slots.map((slot) => ({
                          item: slot?.gameItemId ? itemMap.get(slot.gameItemId) : undefined,
                          pokemon: slot?.pokemonId ? activePokemon.find(p => p._id === slot.pokemonId) : undefined,
                        }));
                        const filledSlots = resolvedSlots.filter((slot) => slot.pokemon).length;
                        const itemSlots = resolvedSlots.filter((slot) => slot.item).length;

                        return (
                          <div
                            key={team._id}
                            className={cn(
                              "border p-5 transition duration-200",
                              cardRadiusClass,
                              isDark ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]" : "border-slate-200 bg-white shadow-sm hover:shadow-md"
                            )}
                          >
                            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-left">
                              <div className="min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                                    #{team.order + 1}
                                  </span>
                                  <span className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                                    {filledSlots}/6 Pokémon
                                  </span>
                                  {itemSlots > 0 && (
                                    <span className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                                      {itemSlots} item
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm md:text-base font-extrabold leading-snug text-slate-900 dark:text-slate-100">
                                  {team.name}
                                </h4>
                              </div>
                              {team.description && (
                                <p className="max-w-xl text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed md:text-right">{team.description}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                              {resolvedSlots.map((slot, sIdx) => (
                                <TeamMemberPill key={sIdx} index={sIdx} item={slot.item} pokemon={slot.pokemon} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Pokémon */}
              {activeTab === 'pokemon' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Pokémon by name..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "w-full pl-9 pr-4 py-2 border text-sm transition focus:outline-none focus:ring-2 focus:ring-opacity-50",
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                            : "border-slate-200 bg-white text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20",
                          cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-md' : 'rounded-xl'
                        )}
                      />
                    </div>
                  <div className="relative w-full sm:w-56">
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className={cn(
                        "flex w-full items-center justify-between px-3.5 py-2 border text-sm transition focus:outline-none focus:ring-2 focus:ring-opacity-50 select-none",
                        isDark
                          ? "border-white/10 bg-[#160b0e] text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                          : "border-slate-200 bg-white text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20",
                        cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-md' : 'rounded-xl'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {selectedType === 'All' ? (
                          <>All types</>
                        ) : (
                          <>
                            {dbTypes?.find(t => t.name.startsWith(selectedType))?.imageUrl && (
                              <img 
                                src={dbTypes.find(t => t.name.startsWith(selectedType))!.imageUrl} 
                                alt={selectedType}
                                className="h-4.5 w-4.5 object-contain shrink-0"
                              />
                            )}
                            {selectedType}
                          </>
                        )}
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isTypeDropdownOpen && "rotate-180")} />
                    </button>

                    {isTypeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsTypeDropdownOpen(false)} />
                        <div
                          className={cn(
                            "absolute right-0 top-full mt-1.5 z-50 w-full max-h-60 overflow-y-auto border p-1.5 shadow-xl transition-all duration-200",
                            isDark ? "border-white/10 bg-[#160b0e] text-white" : "border-slate-200 bg-white text-slate-900",
                            cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-md' : 'rounded-xl'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedType('All');
                              setIsTypeDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className={cn(
                              "flex w-full items-center px-3 py-2 text-sm transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/5",
                              selectedType === 'All' && "bg-slate-100 dark:bg-white/10 font-bold"
                            )}
                          >
                            All types
                          </button>
                          {(dbTypes ?? []).map((t) => {
                            const cleanName = t.name.split(' ')[0];
                            const isSelected = selectedType === cleanName;
                            return (
                              <button
                                key={t._id}
                                type="button"
                                onClick={() => {
                                  setSelectedType(cleanName);
                                  setIsTypeDropdownOpen(false);
                                  setCurrentPage(1);
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-left",
                                  isSelected && "bg-slate-100 dark:bg-white/10 font-bold"
                                )}
                              >
                                {t.imageUrl && (
                                  <img src={t.imageUrl} alt={cleanName} className="h-4.5 w-4.5 object-contain shrink-0" />
                                )}
                                <span>{cleanName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  </div>

                  {paginatedPokemon.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      Không tìm thấy Pokémon nào khớp điều kiện lọc.
                    </div>
                  ) : (
                    <>
                      <div className={cn(
                        'grid gap-4',
                        styleName === 'compact'
                          ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                          : styleName === 'list'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      )}>
                        {paginatedPokemon.map((item) => {
                          const bestItem = item.bestItemId ? itemMap.get(item.bestItemId) : null;
                          const isList = styleName === 'list';
                          const isCompact = styleName === 'compact';

                          return (
                            <article
                              key={item._id}
                              className={cn(
                                'border transition duration-200 overflow-hidden group',
                                cardRadiusClass,
                                isDark
                                  ? 'border-white/10 bg-white/[0.06] hover:border-white/20'
                                  : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-md',
                                isList ? 'flex flex-row items-center gap-4 p-3' : 'flex flex-col h-full ' + (isCompact ? 'p-3' : 'p-4')
                              )}
                            >
                              <div
                                className={cn(
                                  'transition duration-200 flex items-center justify-center shrink-0',
                                  thumbRadiusClass,
                                  isDark ? 'bg-white/10' : 'bg-slate-100',
                                  isList ? 'h-20 w-20' : isCompact ? 'h-24 w-full' : 'h-36 w-full'
                                )}
                              >
                                <PokemonThumb
                                  imageUrl={item.imageUrl}
                                  name={item.name}
                                  className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-105"
                                  fallbackClassName="h-full w-full rounded-none text-3xl"
                                />
                              </div>
                              <div className={cn('flex flex-col flex-1 min-w-0', !isList && 'mt-4')}>
                                <div className="flex-grow">
                                  <div
                                    className={cn(
                                      'flex items-center gap-2 text-xs',
                                      isDark ? 'text-white/50' : 'text-slate-500'
                                    )}
                                  >
                                    <span>#{item.dexNumber}</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {item.primaryType && (() => {
                                        const details = getTypeDetails(item.primaryType);
                                        const color = details?.color || '#64748b';
                                        return (
                                          <span 
                                            className="inline-flex items-center gap-1 rounded-full pl-1 pr-2.5 py-0.5 text-[10px] font-extrabold border"
                                            style={{ 
                                              backgroundColor: `${color}15`, 
                                              borderColor: `${color}30`,
                                              color: color
                                            }}
                                          >
                                            <TypeIconMini typeName={item.primaryType} dbTypes={dbTypes} />
                                            {item.primaryType}
                                          </span>
                                        );
                                      })()}
                                      {item.secondaryType && (() => {
                                        const details = getTypeDetails(item.secondaryType);
                                        const color = details?.color || '#64748b';
                                        return (
                                          <span 
                                            className="inline-flex items-center gap-1 rounded-full pl-1 pr-2.5 py-0.5 text-[10px] font-extrabold border"
                                            style={{ 
                                              backgroundColor: `${color}15`, 
                                              borderColor: `${color}30`,
                                              color: color
                                            }}
                                          >
                                            <TypeIconMini typeName={item.secondaryType} dbTypes={dbTypes} />
                                            {item.secondaryType}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <h3 className={cn('font-bold transition duration-200', isList ? 'text-base mt-0.5' : isCompact ? 'text-sm mt-1' : 'text-lg mt-1', isDark ? 'text-white' : 'text-slate-900')}>{getPokemonDisplayName(item)}</h3>
                                </div>
                                {(() => {
                                  const cleanBestItemName = bestItem ? getGameItemDisplayName(bestItem) : '';
                                  const hasAdvice = cleanBestItemName && !cleanBestItemName.toLowerCase().includes('contact for item advice');
                                  if (!hasAdvice) return null;
                                  return (
                                    <div
                                      className={cn(
                                        'flex items-center gap-2.5 rounded-2xl px-3 py-1.5 text-xs transition duration-200 shrink-0 mt-3',
                                        isDark ? 'bg-black/20 text-white/70' : 'bg-slate-100 text-slate-700'
                                      )}
                                    >
                                      {bestItem?.imageUrl ? (
                                        <img src={bestItem.imageUrl} alt={cleanBestItemName} className="h-10 w-10 object-contain shrink-0" />
                                      ) : (
                                        <Sparkles className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                                      )}
                                      <span className="line-clamp-2 whitespace-normal break-words text-left flex-1 font-semibold text-[11px] leading-snug">{cleanBestItemName}</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={cn(
                              "p-2 border transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed",
                              isDark ? "border-white/10 text-white bg-white/5 hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-slate-50",
                              cornerRadius === 'none' ? 'rounded-none' : 'rounded-lg'
                            )}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          
                          <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                              const isActive = p === currentPage;
                              return (
                                <button
                                  key={p}
                                  onClick={() => setCurrentPage(p)}
                                  className={cn(
                                    "h-9 w-9 text-xs font-bold border transition duration-200 shrink-0",
                                    isActive
                                      ? "text-white"
                                      : isDark
                                        ? "border-white/10 text-slate-300 hover:bg-white/5"
                                        : "border-slate-200 text-slate-700 hover:bg-slate-50",
                                    cornerRadius === 'none' ? 'rounded-none' : 'rounded-lg'
                                  )}
                                  style={isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                >
                                  {p}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={cn(
                              "p-2 border transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed",
                              isDark ? "border-white/10 text-white bg-white/5 hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-slate-50",
                              cornerRadius === 'none' ? 'rounded-none' : 'rounded-lg'
                            )}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Tab 4: Game Item */}
              {activeTab === 'game-item' && (
                <div className="space-y-6">
                  {activeItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      Không tìm thấy vật phẩm game nào.
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {activeItems.map((item) => {
                        const displayName = getGameItemDisplayName(item);
                        return (
                          <div
                            key={item._id}
                            onClick={() => setSelectedItemForModal(item)}
                            className={cn(
                              'border p-4 flex flex-col items-center justify-center text-center transition duration-200 group cursor-pointer hover:scale-[1.03] select-none min-h-[140px]',
                              cardRadiusClass,
                              isDark
                                ? 'border-white/10 bg-white/[0.06] hover:border-white/20'
                                : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
                            )}
                          >
                            <div className="h-16 w-16 mb-3 flex items-center justify-center rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/60 p-1.5 border border-slate-100/50 dark:border-slate-800/50 shrink-0">
                              <GameItemPreviewThumb
                                imageUrl={item.imageUrl}
                                name={displayName}
                                className="h-full w-full object-contain transition duration-200 group-hover:scale-110"
                                fallbackClassName="h-full w-full text-[10px] font-bold"
                              />
                            </div>
                            <h4 className="font-bold text-[11px] leading-tight text-slate-900 dark:text-slate-100 group-hover:text-cyan-500 transition-colors duration-200 line-clamp-2">{displayName}</h4>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </BrowserFrame>
      </PreviewWrapper>

      <QuickOrderDialog
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        isDark={isDark}
        brandColor={primaryColor}
        cornerRadius={cornerRadius}
      />
      <GameItemDetailDialog
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        isDark={isDark}
        brandColor={primaryColor}
        cornerRadius={cornerRadius}
      />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div>
      <h3 className="text-2xl font-bold">{title}</h3>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
      {text}
    </div>
  );
}

function QuickOrderDialog({
  isOpen,
  onClose,
  isDark,
  brandColor,
  cornerRadius,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  brandColor: string;
  cornerRadius: string;
}) {
  const createOrder = useMutation(api.pokemonChampions.createOrder);
  const [customerName, setCustomerName] = useState('');
  const [contactHandle, setContactHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const availableChannels = useMemo(() => [
    { value: 'discord', label: 'Discord' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ], []);

  const [contactType, setContactType] = useState('discord');

  const cardRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-3xl';
  const inputRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-md' : 'rounded-xl';

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !contactHandle.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        customerName: customerName.trim(),
        contactHandle: contactHandle.trim(),
        contactType: contactType as any,
        note: 'Quick order from home page',
      });
      setIsSuccess(true);
      setCustomerName('');
      setContactHandle('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong while sending order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-md border p-6 text-left shadow-2xl transition-all duration-200 relative overflow-hidden',
          cardRadiusClass,
          isDark
            ? 'border-white/10 bg-[#160b0e] text-white'
            : 'border-slate-200 bg-white text-slate-900'
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          className={cn(
            'absolute right-4 top-4 rounded-full p-1.5 transition',
            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div
              className="rounded-full p-3 animate-bounce"
              style={{ backgroundColor: isDark ? `${brandColor}20` : `${brandColor}10`, color: brandColor }}
            >
              <BadgeCheck className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Order Sent Successfully!</h3>
              <p className={cn('text-sm mt-2 max-w-xs mx-auto', isDark ? 'text-white/60' : 'text-slate-500')}>
                Thank you for your order. Our admin will contact you via the contact method you provided as soon as possible to consult and finalize your transaction.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition hover:scale-102"
              style={{ backgroundColor: brandColor }}
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5 pr-8">
              <h3 className="text-xl font-bold tracking-tight">Place Order</h3>
              <p className={cn('text-xs mt-1', isDark ? 'text-white/60' : 'text-slate-500')}>
                Enter your contact details and we will reach out to confirm your order.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={cn('text-xs font-bold uppercase tracking-wider', isDark ? 'text-white/60' : 'text-slate-500')}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name..."
                  required
                  className={cn(
                    'h-11 w-full border px-3 text-sm transition outline-none',
                    inputRadiusClass,
                    isDark
                      ? 'border-white/10 bg-black/30 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-black/40'
                      : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white'
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className={cn('text-xs font-bold uppercase tracking-wider', isDark ? 'text-white/60' : 'text-slate-500')}>
                  Contact Info
                </label>
                <div className="grid grid-cols-[130px_1fr] gap-2">
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className={cn(
                      'h-11 rounded-xl border px-3 text-sm outline-none transition',
                      isDark
                        ? 'border-white/10 bg-black/30 text-white focus:border-white/20'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-300'
                    )}
                  >
                    {availableChannels.map((ch) => (
                      <option key={ch.value} value={ch.value}>{ch.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={contactHandle}
                    onChange={(e) => setContactHandle(e.target.value)}
                    placeholder={
                      contactType === 'discord'
                        ? 'Discord username...'
                        : contactType === 'whatsapp'
                          ? 'WhatsApp phone number...'
                          : contactType === 'instagram'
                            ? 'Instagram profile or username...'
                            : 'Your contact handle...'
                    }
                    required
                    className={cn(
                      'h-11 w-full border px-3 text-sm transition outline-none',
                      inputRadiusClass,
                      isDark
                        ? 'border-white/10 bg-black/30 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-black/40'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white'
                    )}
                  />
                </div>
              </div>

              <div
                className={cn(
                  'p-3 text-xs leading-relaxed',
                  inputRadiusClass,
                  isDark ? 'bg-white/5 text-white/70' : 'bg-slate-50 text-slate-600'
                )}
              >
                <span className="font-bold block mb-0.5" style={{ color: brandColor }}>Instructions:</span>
                After submitting, our admin will contact you through the channel you provided as soon as possible to confirm availability and delivery details.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center text-sm font-bold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{
                  backgroundColor: brandColor,
                  borderRadius: cornerRadius === 'none' ? '0' : cornerRadius === 'sm' ? '8px' : '12px'
                }}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : 'Send Order Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function GameItemDetailDialog({
  item,
  onClose,
  isDark,
  brandColor,
  cornerRadius,
}: {
  item: GameItem | null;
  onClose: () => void;
  isDark: boolean;
  brandColor: string;
  cornerRadius: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const cardRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-3xl';

  if (!item || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-md border p-6 text-left shadow-2xl transition-all duration-200 relative overflow-hidden flex flex-col items-center text-center',
          cardRadiusClass,
          isDark
            ? 'border-white/10 bg-[#160b0e] text-white'
            : 'border-slate-200 bg-white text-slate-900'
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute right-4 top-4 rounded-full p-1.5 transition',
            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="h-28 w-28 mb-4 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-100 dark:border-slate-800">
          <GameItemPreviewThumb
            imageUrl={item.imageUrl}
            name={item.name}
            className="h-full w-full object-contain"
            fallbackClassName="h-full w-full text-base font-bold"
          />
        </div>

        <h3 className="text-xl font-black tracking-tight mb-2" style={{ color: brandColor }}>{item.name}</h3>

        {item.description ? (
          <div className={cn(
            'w-full p-4 text-sm leading-relaxed text-left rounded-xl border max-h-[200px] overflow-y-auto',
            isDark ? 'bg-white/5 border-white/5 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-600'
          )}>
            {item.description}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No description available.</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 text-sm font-bold text-white rounded-xl transition hover:scale-102"
          style={{ backgroundColor: brandColor }}
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
}
