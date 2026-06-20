'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from 'convex/react';
import { BadgeCheck, Gamepad2, Loader2, Sparkles, Trophy, Swords, Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/app/admin/components/ui';

type PokemonChampionsRuntimeSectionProps = {
  brandColor?: string;
  secondary?: string;
  mode?: string;
  config?: {
    ctaText?: string;
    maxItems?: number;
    routeUrl?: string;
    style?: string;
    subtitle?: string;
    cornerRadius?: string;
  };
  title?: string;
  isDark?: boolean;
};

function getPokemonDisplayName(p: any) {
  if (!p || !p.name) return '';
  const fullName = p.name;
  
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
  
  const baseName = cleanName;
  return p.formName ? `${baseName} (${p.formName})` : baseName;
}

function getGameItemDisplayName(item: any) {
  if (!item || !item.name) return '';
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

function getCanonicalTypeName(typeName?: string) {
  return Object.keys(TYPE_DETAILS).find(
    (item) => item.toLowerCase() === typeName?.trim().toLowerCase()
  );
}

function getTypeNameFromDoc(typeDoc: { name?: string; slug?: string }) {
  const slugName = getCanonicalTypeName(typeDoc.slug);
  if (slugName) return slugName;

  const firstToken = typeDoc.name?.trim().split(/\s+/)[0];
  return getCanonicalTypeName(firstToken) ?? firstToken ?? '';
}

function isSameType(first?: string, second?: string) {
  return Boolean(first && second && first.trim().toLowerCase() === second.trim().toLowerCase());
}

function TypeIconMini({ typeName, dbTypes }: { typeName: string; dbTypes?: any[] }) {
  if (!typeName) return null;
  const details = getTypeDetails(typeName);
  const color = details?.color || '#64748b';
  
  let icon: string | undefined | null = null;
  if (dbTypes && dbTypes.length > 0) {
    const cleanTypeName = typeName.trim().toLowerCase();
    const typeDoc = dbTypes.find((t) => {
      const cleanDocName = getTypeNameFromDoc(t).toLowerCase();
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
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 font-black text-slate-500 shadow-inner dark:from-slate-800 dark:to-slate-950 dark:text-slate-300',
        fallbackClassName ?? className
      )}
    >
      <span className="truncate px-1">{initials}</span>
    </div>
  );
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
  item?: any;
  pokemon?: any;
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
        <PokemonThumb imageUrl={pokemon.imageUrl} name={pokemonName} className="h-20 w-20 object-contain transition duration-200 group-hover/slot:scale-110" fallbackClassName="h-20 w-20 text-[11px] rounded-xl border border-slate-200 dark:border-slate-800" />
        {item && (
          <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition duration-200 group-hover/slot:scale-110">
            <GameItemPreviewThumb imageUrl={item.imageUrl} name={itemName} className="h-6 w-6 object-contain" fallbackClassName="h-6 w-6 text-[8px] rounded-full" />
          </span>
        )}
      </div>
    </div>
  );
}

export function PokemonChampionsRuntimeSection({
  brandColor = '#ef4444',
  secondary,
  config,
  title = 'Pokemon Champions',
  isDark = true,
}: PokemonChampionsRuntimeSectionProps) {
  const ensureDefaults = useMutation(api.pokemonChampions.ensureDefaults);
  const didEnsureDefaults = useRef(false);
  
  const pokemon = useQuery(api.pokemonChampions.listPokemon, { activeOnly: true, limit: 500 });
  const gameItems = useQuery(api.pokemonChampions.listGameItems, { activeOnly: true, limit: 200 });
  const teams = useQuery(api.pokemonChampions.listTeams, { activeOnly: true, limit: 100 });
  const dbTypes = useQuery(api.pokemonChampions.listTypes);
  const settingsDoc = useQuery(api.pokemonChampions.getSettings);

  const itemMap = useMemo(() => new Map((gameItems ?? []).map((item) => [item._id, item])), [gameItems]);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'tier-list' | 'team' | 'pokemon' | 'game-item'>('tier-list');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openTiers, setOpenTiers] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (didEnsureDefaults.current || pokemon === undefined || gameItems === undefined || settingsDoc === undefined) {
      return;
    }
    didEnsureDefaults.current = true;
    if (!pokemon.length || !gameItems.length || !settingsDoc) {
      void ensureDefaults();
    }
  }, [ensureDefaults, gameItems, pokemon, settingsDoc]);

  const items = pokemon ?? [];
  const style = config?.style ?? 'grid';
  const cornerRadius = config?.cornerRadius ?? 'lg';
  const secondaryColor = secondary || '#facc15';

  const cardRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-xl' : 'rounded-3xl';
  const thumbRadiusClass = cornerRadius === 'none' ? 'rounded-none' : cornerRadius === 'sm' ? 'rounded-lg' : 'rounded-2xl';

  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const pokemonByTier = useMemo(() => {
    const map = new Map<string, typeof items>();
    tiers.forEach(t => map.set(t, []));
    
    items.forEach(p => {
      const tierTrait = p.traits?.find(t => t.startsWith('Tier '));
      if (tierTrait) {
        const tier = tierTrait.replace('Tier ', '');
        if (map.has(tier)) {
          map.get(tier)!.push(p);
        }
      }
    });
    return map;
  }, [items]);

  useEffect(() => {
    if (openTiers !== null || pokemon === undefined) return;
    const initialTiers = new Set(tiers.filter(t => (pokemonByTier.get(t) ?? []).length > 0));
    setOpenTiers(initialTiers);
  }, [openTiers, pokemon, pokemonByTier]);



  const filteredPokemon = useMemo(() => {
    return items.filter(p => {
      const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'All' || 
        isSameType(p.primaryType, selectedType) || 
        isSameType(p.secondaryType, selectedType);
      return matchName && matchType;
    });
  }, [items, searchQuery, selectedType]);

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

  return (
    <section
      className={cn(
        'overflow-hidden py-14 transition-colors duration-200',
        isDark ? 'bg-[#0f0709] text-white' : 'bg-[#fafafa] text-slate-900'
      )}
      style={{
        background: isDark
          ? `radial-gradient(circle at top left, ${brandColor}1a 0, transparent 34%), radial-gradient(circle at bottom right, ${secondaryColor}15 0, transparent 28%), #0f0709`
          : `radial-gradient(circle at top left, ${brandColor}0a 0, transparent 40%), radial-gradient(circle at bottom right, ${secondaryColor}08 0, transparent 35%), #fafafa`
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div
              className={cn(
                'mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                isDark ? 'border-white/10 bg-white/10' : 'border-slate-200 bg-white shadow-sm'
              )}
              style={{ color: brandColor }}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              Pokemon Champions
            </div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
          </div>
        </div>

        <div
          className="mb-8 flex flex-col items-center justify-between gap-4 border-l-4 p-5 md:flex-row"
          style={{
            borderLeftColor: brandColor,
            borderColor: isDark ? `${brandColor}30` : `${brandColor}20`,
            backgroundColor: isDark ? `${brandColor}15` : `${brandColor}08`,
            boxShadow: isDark ? `0 0 15px ${brandColor}10` : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex items-start gap-3 text-left">
            <div
              className="mt-1 rounded-full p-1.5 shrink-0"
              style={{ backgroundColor: isDark ? `${brandColor}20` : `${brandColor}10`, color: brandColor }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: brandColor }}>ANNOUNCEMENT</h4>
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
              backgroundColor: brandColor,
              boxShadow: `0 4px 12px ${brandColor}30`
            }}
          >
            Quick Order
          </button>
        </div>

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
                  style={isActive ? { borderColor: brandColor, color: brandColor } : {}}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {pokemon === undefined || gameItems === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="min-h-[400px]">
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

            {activeTab === 'team' && (
              <div className="space-y-4">
                {teams === undefined ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Chưa có đội hình đề xuất nào từ đấu giải.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teams.map((team) => {
                      const slots = Array.from({ length: 6 }, (_, index) => team.slots[index]);
                      const resolvedSlots = slots.map((slot) => ({
                        item: slot?.gameItemId ? itemMap.get(slot.gameItemId) : undefined,
                        pokemon: slot?.pokemonId ? items.find(p => p._id === slot.pokemonId) : undefined,
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
                                <span className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase" style={{ color: brandColor, backgroundColor: `${brandColor}15` }}>
                                  #{team.order + 1}
                                </span>
                                <span className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase" style={{ color: brandColor, backgroundColor: `${brandColor}15` }}>
                                  {filledSlots}/6 Pokémon
                                </span>
                                {itemSlots > 0 && (
                                  <span className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase" style={{ color: brandColor, backgroundColor: `${brandColor}15` }}>
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
                            <TypeIconMini typeName={selectedType} dbTypes={dbTypes} />
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
                            const cleanName = getTypeNameFromDoc(t);
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

                {paginatedPokemon.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Không tìm thấy Pokémon nào khớp điều kiện lọc.
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      'grid gap-4',
                      style === 'compact'
                        ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                        : style === 'list'
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    )}>
                      {paginatedPokemon.map((item) => {
                        const bestItem = item.bestItemId ? itemMap.get(item.bestItemId) : null;
                        const isList = style === 'list';
                        const isCompact = style === 'compact';

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
                                alt={item.name}
                                className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-105"
                                fallbackClassName="h-full w-full p-3 text-xs transition duration-200 group-hover:scale-105"
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
                                      <Sparkles className="h-4 w-4 shrink-0" style={{ color: brandColor }} />
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
                        
                        <div className="flex gap-1 overflow-x-auto max-w-[240px] sm:max-w-none">
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
                                style={isActive ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
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

            {activeTab === 'game-item' && (
              <div className="space-y-6">
                {gameItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Không tìm thấy vật phẩm game nào.
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {gameItems.map((item) => {
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
        )}
      </div>

      <QuickOrderDialog
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        isDark={isDark}
        brandColor={brandColor}
        cornerRadius={cornerRadius}
      />
      <GameItemDetailDialog
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        isDark={isDark}
        brandColor={brandColor}
        cornerRadius={cornerRadius}
      />
    </section>
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
  const [errorMsg, setErrorMsg] = useState('');
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
    setErrorMsg('');
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
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong while sending order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMsg('');
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

              {errorMsg && (
                <p className="text-xs text-red-500 font-semibold animate-pulse">{errorMsg}</p>
              )}

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
  item: any;
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
