import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body trống hoặc JSON không hợp lệ.' }, { status: 400 });
    }

    const { type, data } = body as { type: string; data: any };

    if (!type || !data) {
      const response = NextResponse.json({ error: 'Thiếu type hoặc data.' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const client = getConvexClient();
    let result: any = null;

    if (type === 'items') {
      result = await client.mutation(api.pokemonChampions.syncScrapedGameItems, { items: data });
    } else if (type === 'pokemon') {
      result = await client.mutation(api.pokemonChampions.syncScrapedPokemon, { pokemons: data });
    } else if (type === 'tier-list') {
      result = await client.mutation(api.pokemonChampions.syncScrapedTiers, { tiers: data });
    } else if (type === 'teams') {
      result = await client.mutation(api.pokemonChampions.syncScrapedTeams, { teams: data });
    } else if (type === 'types') {
      result = await client.mutation(api.pokemonChampions.syncScrapedTypes, { types: data });
    } else if (type === 'all') {
      const payload = data as { pokemons?: any[]; items?: any[]; tiers?: any[]; teams?: any[]; types?: any[] };
      const resPoke = payload.pokemons?.length ? await client.mutation(api.pokemonChampions.syncScrapedPokemon, { pokemons: payload.pokemons }) : { created: 0, updated: 0 };
      const resItems = payload.items?.length ? await client.mutation(api.pokemonChampions.syncScrapedGameItems, { items: payload.items }) : { created: 0, updated: 0 };
      const resTiers = payload.tiers?.length ? await client.mutation(api.pokemonChampions.syncScrapedTiers, { tiers: payload.tiers }) : { updated: 0 };
      const resTeams = payload.teams?.length ? await client.mutation(api.pokemonChampions.syncScrapedTeams, { teams: payload.teams }) : { createdTeams: 0, updatedBestItems: 0 };
      const resTypes = payload.types?.length ? await client.mutation(api.pokemonChampions.syncScrapedTypes, { types: payload.types }) : { created: 0, updated: 0 };
      result = { resPoke, resItems, resTiers, resTeams, resTypes };
    } else {
      const response = NextResponse.json({ error: `Không hỗ trợ đồng bộ loại: ${type}` }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const response = NextResponse.json({ success: true, result });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Lỗi hệ thống khi đồng bộ';
    const response = NextResponse.json({ error: errMessage }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}
