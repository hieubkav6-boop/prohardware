import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  
  let url = '';
  if (target === 'types') {
    url = 'https://www.pokemon-zone.com/champions/types/';
  } else if (target === 'pokemon') {
    url = 'https://www.pokemon-zone.com/champions/pokemon/?view=all';
  } else if (target === 'items') {
    url = 'https://www.pokemon-zone.com/champions/items/';
  } else if (target === 'tiers') {
    url = 'https://www.pokemon-zone.com/champions/tier-list/';
  } else if (target === 'teams') {
    url = 'https://www.pokemon-zone.com/champions/teams/';
  } else {
    return NextResponse.json({ error: 'Target không hợp lệ.' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 } // Cache 1 giờ
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Không thể tải trang từ Pokémon Zone: ${res.statusText}` }, { status: res.status });
    }

    const html = await res.text();
    return NextResponse.json({ html });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lỗi hệ thống khi tải trang' }, { status: 500 });
  }
}
