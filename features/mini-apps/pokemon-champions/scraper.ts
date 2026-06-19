/**
 * Client-side HTML Parser for pokemon-zone.com data structure.
 * This runs in the browser and parses copy-pasted HTML source to avoid Cloudflare blocks.
 */

export interface ScrapedItem {
  name: string;
  slug: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  priceLabel: string;
}

export interface ScrapedPokemon {
  name: string;
  dexNumber: number;
  imageUrl: string;
  primaryType: string;
  secondaryType?: string;
  notes: string;
}

export interface ScrapedTier {
  imageUrl?: string;
  name?: string;
  pokemonSlug: string;
  primaryType?: string;
  secondaryType?: string;
  tier: string;
}

export interface ScrapedTeamMember {
  pokemonSlug: string;
  itemSlug?: string;
}

export interface ScrapedTeam {
  name: string;
  members: ScrapedTeamMember[];
}

export interface ScrapedType {
  name: string;
  slug: string;
  imageUrl: string;
}

// List of standard Pokémon types to match against text
const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const POKEMON_TYPE_SET = new Set(POKEMON_TYPES.map((type) => type.toLowerCase()));

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeScrapedSource(value: string) {
  return value
    .replace(/\\u002[Ff]/g, '/')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\\\/g, '\n')
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/gi, '/')
    .replace(/&amp;/g, '&');
}

function cleanScrapedLine(value: string) {
  return value
    .replace(/\\+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtmlTags(value: string) {
  return cleanScrapedLine(value.replace(/<[^>]+>/g, ' '));
}

function uniquePokemonTypes(types: Array<string | undefined>) {
  const found: string[] = [];

  for (const type of types) {
    if (!type || found.includes(type)) continue;
    found.push(type);
    if (found.length === 2) break;
  }

  return found;
}

function getPokemonTypeFromSlug(value: string) {
  const slug = normalizeSlug(value);
  return POKEMON_TYPES.find((type) => type.toLowerCase() === slug);
}

function extractPokemonTypesFromText(value: string) {
  const normalized = stripHtmlTags(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[/_|,;]+/g, ' ');
  const pattern = new RegExp(`\\b(${POKEMON_TYPES.join('|')})\\b`, 'gi');
  const types: string[] = [];

  for (const match of normalized.matchAll(pattern)) {
    const type = getPokemonTypeFromSlug(match[1]);
    if (type && !types.includes(type)) {
      types.push(type);
    }
  }

  return types;
}

function resolveTierLabel(value: string) {
  const text = cleanScrapedLine(value);
  if (!text || text.length > 80) return '';

  const match = /^(?:Tier\s*)?([SABCDEF])(?:\s*(?:[-–—:]\s*)?(?:Meta|Meta-Dominant|Strong|Proven|Viable|Popular|Competitive|\(\d+\)))?$/i.exec(text)
    || /^([SABCDEF])\s+(?:Meta|Meta-Dominant|Strong|Proven|Viable)\b/i.exec(text);

  return match ? match[1].toUpperCase() : '';
}

function extractPokemonSlugFromHref(href: string) {
  const match = /\/champions\/pokemon\/([^/"'?#)\s\\]+)\/?/i.exec(href);
  return match ? normalizeSlug(match[1]) : '';
}

function pushTierResult(
  tiers: ScrapedTier[],
  seen: Set<string>,
  rawSlug: string,
  tier: string,
  details: Omit<Partial<ScrapedTier>, 'pokemonSlug' | 'tier'> = {}
) {
  const pokemonSlug = normalizeSlug(rawSlug);
  const normalizedTier = tier.toUpperCase();
  const invalidSlugs = new Set(['a', 'article', 'button', 'div', 'li', 'section', 'span']);
  if (!pokemonSlug || pokemonSlug === 'pokemon' || invalidSlugs.has(pokemonSlug) || !/^[SABCDEF]$/.test(normalizedTier)) return;

  const key = `${pokemonSlug}:${normalizedTier}`;
  if (seen.has(key)) return;
  seen.add(key);
  tiers.push({ ...details, pokemonSlug, tier: normalizedTier });
}

function extractLastImageAlt(value: string) {
  const matches = Array.from(value.matchAll(/!\[([^\]]+)]/g));
  const last = matches.at(-1)?.[1];
  return last ? cleanScrapedLine(last) : '';
}

function isPokemonTypeLine(value: string) {
  const text = cleanScrapedLine(value);
  if (!text) return false;
  return POKEMON_TYPES.some((firstType) =>
    POKEMON_TYPES.some((secondType) => text === firstType || text === `${firstType}${secondType}`)
  );
}

function isPokemonStatLine(value: string) {
  return /^WR\s+\d+(?:\.\d+)?%/i.test(cleanScrapedLine(value));
}

function findLastPokemonNameCandidate(value: string) {
  const lines = normalizeScrapedSource(value)
    .split(/\r?\n/)
    .map(cleanScrapedLine)
    .filter(Boolean)
    .reverse();

  for (const line of lines) {
    const visibleLine = stripHtmlTags(line);
    if (!visibleLine || visibleLine !== line) continue;
    const cleaned = line
      .replace(/^\[[^\]]*]\([^)]*\)/, '')
      .replace(/^!\[([^\]]+)]\([^)]*\).*$/, '$1')
      .replace(/^[↑↓]\d+\s*/, '')
      .trim();

    if (!cleaned) continue;
    if (cleaned.includes('/champions/')) continue;
    if (resolveTierLabel(cleaned)) continue;
    if (isPokemonStatLine(cleaned) || isPokemonTypeLine(cleaned)) continue;
    if (/^(Meta|Meta-Dominant|Strong|Proven|Viable|Methodology|Regulation|Source|Competitive|Popular|Finishers|All)\b/i.test(cleaned)) continue;
    if (/^\d/.test(cleaned)) continue;

    return cleaned;
  }

  return '';
}

function pushTierCandidates(
  tiers: ScrapedTier[],
  seen: Set<string>,
  tier: string,
  hrefSlug: string,
  details: Omit<Partial<ScrapedTier>, 'pokemonSlug' | 'tier'> = {}
) {
  pushTierResult(tiers, seen, hrefSlug, tier, details);
}

function extractPokemonNameFromAnchor(link: HTMLAnchorElement) {
  const imgAlt = link.querySelector('img')?.getAttribute('alt')?.trim();
  if (imgAlt) return imgAlt;
  return findLastPokemonNameCandidate(link.textContent || '');
}

function extractPokemonNameFromHtmlBlock(block: string) {
  const imageAlt = /<img\b[^>]*\balt=["']([^"']+)["'][^>]*>/i.exec(block)?.[1];
  if (imageAlt) return cleanScrapedLine(imageAlt);

  const nameBlock = /class=["'][^"']*\bchamps-pokemon-card__name\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(block)?.[1];
  return nameBlock ? stripHtmlTags(nameBlock) : '';
}

function cleanPokemonName(value: string, slug: string) {
  const text = stripHtmlTags(value)
    .replace(/\b(?:WR\s*)?\d+(?:\.\d+)?\s*%?\s*(?:uses?)?\b/gi, ' ')
    .replace(/\buses?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  const tokens = text.split(/\s+/).filter((token) => !POKEMON_TYPE_SET.has(token.toLowerCase()));
  const cleaned = tokens.join(' ').replace(/\s+/g, ' ').trim();
  if (cleaned) return cleaned;

  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getPokemonCardContainer(link: HTMLAnchorElement) {
  return link.closest('a.champs-pokemon-card, [class*="pokemon-card"], [class*="PokemonCard"], [class*="card"]') ?? link.parentElement ?? link;
}

function extractPokemonNameFromCard(link: HTMLAnchorElement, container: Element, slug: string) {
  const imgAlt = link.querySelector('img')?.getAttribute('alt')?.trim()
    || container.querySelector('img')?.getAttribute('alt')?.trim();
  if (imgAlt) return cleanScrapedLine(imgAlt);

  const nameElement = container.querySelector('[class*="pokemon-card__name"], [class*="PokemonCardName"], [class*="name"]');
  const nameText = nameElement?.textContent?.trim();
  if (nameText) return cleanPokemonName(nameText, slug);

  return cleanPokemonName(link.textContent || container.textContent || '', slug);
}

function extractPokemonImageFromHtmlBlock(block: string) {
  return /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i.exec(block)?.[1] ?? '';
}

function extractPokemonTypesFromHtmlBlock(block: string) {
  const typeMatches = Array.from(block.matchAll(/type-badge--([a-z]+)/gi))
    .map((match) => {
      return getPokemonTypeFromSlug(match[1]);
    })
    .filter((type): type is string => Boolean(type));

  return {
    primaryType: typeMatches[0],
    secondaryType: typeMatches[1],
  };
}

function extractPokemonTypesFromCard(container: Element) {
  const htmlTypes = extractPokemonTypesFromHtmlBlock(container.outerHTML);
  const foundTypes = uniquePokemonTypes([htmlTypes.primaryType, htmlTypes.secondaryType]);

  if (foundTypes.length > 0) {
    return foundTypes;
  }

  const imgs = Array.from(container.querySelectorAll('img'));
  for (const img of imgs) {
    const src = (img.getAttribute('src') || '').toLowerCase();
    const alt = (img.getAttribute('alt') || '').toLowerCase();
    const title = (img.getAttribute('title') || '').toLowerCase();
    const className = (img.className || '').toLowerCase();

    for (const type of POKEMON_TYPES) {
      const lowerType = type.toLowerCase();
      if (
        src.includes(`/types/${lowerType}.`) ||
        src.includes(`/type/${lowerType}.`) ||
        src.endsWith(`/${lowerType}.png`) ||
        src.endsWith(`/${lowerType}.webp`) ||
        alt === lowerType ||
        title === lowerType ||
        className.includes(`type-${lowerType}`)
      ) {
        foundTypes.push(type);
        break;
      }
    }
  }

  if (foundTypes.length > 0) {
    return uniquePokemonTypes(foundTypes);
  }

  return extractPokemonTypesFromText(container.textContent || '');
}

function parsePokemonZoneTierCards(source: string, tiers: ScrapedTier[], seen: Set<string>) {
  const tokenPattern = /<div\b[^>]*class=["'][^"']*\btier-row__label\b[^"']*["'][^>]*>\s*([SABCDEF])\s*<\/div>|<a\b(?=[^>]*class=["'][^"']*\bchamps-pokemon-card\b)[^>]*>/gi;
  let currentTier = '';

  for (const match of source.matchAll(tokenPattern)) {
    if (match[1]) {
      currentTier = match[1].toUpperCase();
      continue;
    }

    if (!currentTier) continue;

    const anchorTag = match[0];
    const hrefSlug = extractPokemonSlugFromHref(anchorTag);
    if (!hrefSlug) continue;

    const startIndex = match.index ?? 0;
    const endIndex = source.indexOf('</a>', startIndex);
    const anchorBlock = endIndex > startIndex ? source.slice(startIndex, endIndex) : anchorTag;
    const types = extractPokemonTypesFromHtmlBlock(anchorBlock);
    pushTierCandidates(tiers, seen, currentTier, hrefSlug, {
      imageUrl: extractPokemonImageFromHtmlBlock(anchorBlock) || undefined,
      name: extractPokemonNameFromHtmlBlock(anchorBlock) || undefined,
      primaryType: types.primaryType,
      secondaryType: types.secondaryType,
    });
  }
}

function parseDomTiers(doc: Document, tiers: ScrapedTier[], seen: Set<string>) {
  const elements = Array.from(doc.body?.querySelectorAll('h1, h2, h3, h4, h5, h6, section, article, div, li, p, span, a') ?? []);
  let currentTier = '';

  for (const element of elements) {
    const directText = Array.from(element.childNodes)
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent || '')
      .join(' ');
    const fallbackText = (element.children.length === 0 || (element.textContent || '').length < 80) ? (element.textContent || '') : '';
    const tier = resolveTierLabel(directText || fallbackText);
    if (tier) {
      currentTier = tier;
    }

    if (!(element instanceof HTMLAnchorElement) || !currentTier) continue;

    const hrefSlug = extractPokemonSlugFromHref(element.getAttribute('href') || '');
    if (!hrefSlug) continue;
    pushTierCandidates(tiers, seen, currentTier, hrefSlug, { name: extractPokemonNameFromAnchor(element) || undefined });
  }
}

function parseTextTiers(source: string, tiers: ScrapedTier[], seen: Set<string>) {
  const text = normalizeScrapedSource(source);
  const lines = text.split(/\r?\n/).map(cleanScrapedLine).filter(Boolean);
  const recentLines: string[] = [];
  let currentTier = '';

  for (const line of lines) {
    const visibleLine = stripHtmlTags(line);
    const tier = resolveTierLabel(visibleLine || line);
    if (tier) {
      currentTier = tier;
      recentLines.length = 0;
      continue;
    }

    if (!currentTier) continue;

    const pokemonUrlPattern = /(?:https?:\/\/www\.pokemon-zone\.com)?\/champions\/pokemon\/([^/"'?#)\s\\]+)\/?/gi;
    for (const match of line.matchAll(pokemonUrlPattern)) {
      const context = [...recentLines.slice(-12), stripHtmlTags(line.slice(0, match.index ?? 0))].join('\n');
      const name = extractLastImageAlt(context) || findLastPokemonNameCandidate(context);
      pushTierCandidates(tiers, seen, currentTier, match[1], { name: name || undefined });
    }

    if (isPokemonStatLine(visibleLine || line)) {
      const name = findLastPokemonNameCandidate(recentLines.join('\n'));
      if (name) {
        pushTierResult(tiers, seen, name, currentTier, { name });
      }
    }

    recentLines.push(visibleLine || line);
    if (recentLines.length > 24) {
      recentLines.shift();
    }
  }
}

/**
 * Parses items page (https://www.pokemon-zone.com/champions/items/)
 */
export function parseScrapedItems(html: string): ScrapedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items: ScrapedItem[] = [];
  const visited = new Set<string>();

  // Find all links to items
  const links = Array.from(doc.querySelectorAll('a'));
  for (const link of links) {
    const href = link.getAttribute('href') || '';
    if (!href.includes('/champions/items/')) continue;

    const match = /\/champions\/items\/([^/]+)/.exec(href);
    if (!match) continue;
    
    const slug = normalizeSlug(match[1]);
    if (!slug || slug === 'items' || visited.has(slug)) continue;
    visited.add(slug);

    // Get name
    let name = link.textContent?.trim() || '';
    const img = link.querySelector('img') || link.parentElement?.querySelector('img');
    if (!name && img) {
      name = img.getAttribute('alt')?.trim() || '';
    }
    if (!name) {
      name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Get Image URL
    let imageUrl = '';
    if (img) {
      imageUrl = img.getAttribute('src') || img.getAttribute('data-src') || '';
    }

    // Rarity detection based on classes or surrounding text
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    const textContext = (link.parentElement?.textContent || '').toLowerCase();
    if (textContext.includes('legendary') || link.className.toLowerCase().includes('legendary')) {
      rarity = 'legendary';
    } else if (textContext.includes('epic') || link.className.toLowerCase().includes('epic')) {
      rarity = 'epic';
    } else if (textContext.includes('rare') || link.className.toLowerCase().includes('rare')) {
      rarity = 'rare';
    }

    items.push({
      name,
      slug,
      imageUrl,
      rarity,
      description: `Imported from Pokémon Zone: ${name}`,
      priceLabel: 'Contact',
    });
  }

  return items;
}

/**
 * Parses pokemon page (https://www.pokemon-zone.com/champions/pokemon/)
 */
export function parseScrapedPokemon(html: string): ScrapedPokemon[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pokemons: ScrapedPokemon[] = [];
  const visited = new Set<string>();

  const links = Array.from(doc.querySelectorAll('a'));
  for (const link of links) {
    const href = link.getAttribute('href') || '';
    if (!href.includes('/champions/pokemon/')) continue;

    const match = /\/champions\/pokemon\/([^/]+)/.exec(href);
    if (!match) continue;

    const slug = normalizeSlug(match[1]);
    if (!slug || slug === 'pokemon' || visited.has(slug)) continue;
    visited.add(slug);

    const container = getPokemonCardContainer(link);
    const name = extractPokemonNameFromCard(link, container, slug);
    const img = link.querySelector('img') || container.querySelector('img');
    if (!name) {
      continue;
    }

    // Get Image URL
    let imageUrl = '';
    if (img) {
      imageUrl = img.getAttribute('src') || img.getAttribute('data-src') || '';
    }

    // Extract Dex Number from image url if possible (e.g., ui_PokeIcon_02_0460_00_0.webp -> 460)
    let dexNumber = 0;
    const dexMatch = /_(\d{4})_/.exec(imageUrl);
    if (dexMatch) {
      dexNumber = parseInt(dexMatch[1], 10);
    } else {
      // Fallback: look for text like "#460" or digits in parent
      const parentText = container.textContent || '';
      const textMatch = /#\s*(\d+)/.exec(parentText);
      if (textMatch) {
        dexNumber = parseInt(textMatch[1], 10);
      }
    }

    const foundTypes = extractPokemonTypesFromCard(container);

    // Ensure we don't duplicate types and get primary/secondary
    const primaryType = foundTypes[0] || 'Normal';
    const secondaryType = foundTypes[1] || undefined;

    pokemons.push({
      name,
      dexNumber: dexNumber || 1, // Fallback to 1 if not found
      imageUrl,
      primaryType,
      secondaryType,
      notes: `Imported from Pokémon Zone: https://www.pokemon-zone.com${href}`,
    });
  }

  return pokemons;
}

/**
 * Parses tier list page (https://www.pokemon-zone.com/champions/tier-list/)
 */
export function parseScrapedTiers(html: string): ScrapedTier[] {
  const parser = new DOMParser();
  const normalizedSource = normalizeScrapedSource(html);
  const doc = parser.parseFromString(normalizedSource, 'text/html');
  const tiers: ScrapedTier[] = [];
  const seen = new Set<string>();

  parsePokemonZoneTierCards(normalizedSource, tiers, seen);
  parseDomTiers(doc, tiers, seen);
  parseTextTiers(normalizedSource, tiers, seen);

  return tiers;
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function cleanMarkdownText(value: string) {
  return stripHtmlTags(value)
    .replace(/\\([[\]])/g, '$1')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/^NEW\s+/i, '')
    .trim();
}

function getTeamKey(members: ScrapedTeamMember[]) {
  return members.map((member) => `${member.pokemonSlug}:${member.itemSlug ?? ''}`).join('|');
}

function getTeamName(members: ScrapedTeamMember[]) {
  return members.map((member) => titleFromSlug(member.pokemonSlug)).join(' / ');
}

function pushTeamResult(teams: ScrapedTeam[], seen: Set<string>, members: ScrapedTeamMember[]) {
  const filteredMembers = members
    .filter((member) => member.pokemonSlug && member.pokemonSlug !== 'pokemon')
    .slice(0, 6);
  if (filteredMembers.length < 2) return;

  const key = getTeamKey(filteredMembers);
  if (seen.has(key)) return;
  seen.add(key);

  teams.push({
    name: getTeamName(filteredMembers),
    members: filteredMembers,
  });
}

function getItemSlugFromCombinedText(rawText: string, rawPokemonName: string) {
  let text = cleanMarkdownText(rawText);
  const pokemonName = cleanMarkdownText(rawPokemonName);
  if (!text || !pokemonName) return undefined;

  for (let index = 0; index < 3; index++) {
    if (!text.toLowerCase().startsWith(pokemonName.toLowerCase())) break;
    text = text.slice(pokemonName.length).trim();
  }

  const itemSlug = normalizeSlug(text);
  return itemSlug && itemSlug !== normalizeSlug(pokemonName) ? itemSlug : undefined;
}

function getItemSlugFromMarkdownTail(value: string, pokemonName: string) {
  const itemSegments = value.split(/!\[[^\]]*]\([^)]*ui_ItemIcon[^)]*\)/i);
  if (itemSegments.length > 1) {
    const itemName = cleanMarkdownText(itemSegments.at(-1) ?? '');
    if (itemName) return normalizeSlug(itemName);
  }
  return getItemSlugFromCombinedText(value, pokemonName);
}

function parseMarkdownTeamMembers(line: string): ScrapedTeamMember[] {
  const members: ScrapedTeamMember[] = [];
  const seenPokemon = new Set<string>();
  const linkPattern = /\[!\[([\s\S]*?)]\((https?:\/\/[^)]*ui_PokeIcon[^)]*)\)([\s\S]*?)]\((?:https?:\/\/www\.pokemon-zone\.com)?\/champions\/pokemon\/([^/"'?#)\s\\]+)\/?\)/gi;

  for (const match of line.matchAll(linkPattern)) {
    const pokemonSlug = normalizeSlug(match[4]);
    if (!pokemonSlug || seenPokemon.has(pokemonSlug)) continue;
    seenPokemon.add(pokemonSlug);

    const pokemonName = cleanMarkdownText(match[1]) || titleFromSlug(pokemonSlug);
    members.push({
      pokemonSlug,
      itemSlug: getItemSlugFromMarkdownTail(match[3], pokemonName),
    });
  }

  return members;
}

function parseMarkdownTeams(source: string, teams: ScrapedTeam[], seen: Set<string>) {
  for (const line of source.split(/\r?\n/)) {
    const members = parseMarkdownTeamMembers(line);
    pushTeamResult(teams, seen, members);
  }
}

function getItemSlugFromPokemonAnchor(link: HTMLAnchorElement, pokemonName: string) {
  const itemLink = Array.from(link.querySelectorAll('a')).find((item) =>
    (item.getAttribute('href') || '').includes('/champions/items/')
  );
  const itemHref = itemLink?.getAttribute('href') || '';
  const itemHrefMatch = /\/champions\/items\/([^/"'?#)\s\\]+)\/?/i.exec(itemHref);
  if (itemHrefMatch) return normalizeSlug(itemHrefMatch[1]);

  const itemImage = Array.from(link.querySelectorAll('img')).find((img) => {
    const src = img.getAttribute('src') || '';
    const className = img.className || '';
    return src.includes('ui_ItemIcon') || src.includes('/item/') || src.includes('/items/') || className.includes('item');
  });
  const itemImageText = itemImage?.getAttribute('alt') || itemImage?.getAttribute('title') || '';
  if (itemImageText) return normalizeSlug(itemImageText);

  return getItemSlugFromCombinedText(link.textContent || '', pokemonName);
}

function getTeamMembersFromLinks(links: HTMLAnchorElement[]) {
  const members: ScrapedTeamMember[] = [];
  const seenPokemon = new Set<string>();

  for (const link of links) {
    const pokemonSlug = extractPokemonSlugFromHref(link.getAttribute('href') || '');
    if (!pokemonSlug || seenPokemon.has(pokemonSlug)) continue;
    seenPokemon.add(pokemonSlug);

    const pokemonName = extractPokemonNameFromAnchor(link) || titleFromSlug(pokemonSlug);
    members.push({
      pokemonSlug,
      itemSlug: getItemSlugFromPokemonAnchor(link, pokemonName),
    });
  }

  return members;
}

function parseDomTeams(doc: Document, teams: ScrapedTeam[], seen: Set<string>) {
  const containers = Array.from(doc.querySelectorAll('article, section, li, tr, div'));

  for (const container of containers) {
    const links = Array.from(container.querySelectorAll('a')).filter((link): link is HTMLAnchorElement =>
      link instanceof HTMLAnchorElement && Boolean(extractPokemonSlugFromHref(link.getAttribute('href') || ''))
    );
    if (links.length < 2 || links.length > 6) continue;

    pushTeamResult(teams, seen, getTeamMembersFromLinks(links));
  }
}

/**
 * Parses teams page (https://www.pokemon-zone.com/champions/teams/)
 * Scrapes real team cards and best item mappings from Pokémon Zone.
 */
export function parseScrapedTeams(html: string): ScrapedTeam[] {
  const normalizedSource = normalizeScrapedSource(html);
  const teams: ScrapedTeam[] = [];
  const seen = new Set<string>();

  parseMarkdownTeams(normalizedSource, teams, seen);
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(normalizedSource, 'text/html');
    parseDomTeams(doc, teams, seen);
  }

  return teams;
}

/**
 * Parses types page (https://www.pokemon-zone.com/champions/types/)
 * Scrapes type name, slug, and image icon URL.
 */
export function parseScrapedTypes(html: string): ScrapedType[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const types: ScrapedType[] = [];
  const visited = new Set<string>();

  doc.querySelectorAll('a').forEach(l => {
    const href = l.getAttribute('href') || '';
    if (!href.includes('/champions/types/') && !href.includes('/champions/type/')) return;
    const match = /\/champions\/types?\/([^/]+)/.exec(href);
    if (!match) return;
    const slug = normalizeSlug(match[1]);
    if (!slug || slug === 'types' || slug === 'type' || visited.has(slug)) return;
    visited.add(slug);

    const img = l.querySelector('img') || l.parentElement?.querySelector('img') || l.parentElement?.parentElement?.querySelector('img');
    let imageUrl = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
    
    // Normalize to absolute URL if it is a relative path
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = 'https://www.pokemon-zone.com' + imageUrl;
    }
    
    let name = l.textContent?.trim() || img?.getAttribute('alt') || slug.charAt(0).toUpperCase() + slug.slice(1);
    // Clean name
    name = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    types.push({ name, slug, imageUrl });
  });

  return types;
}
