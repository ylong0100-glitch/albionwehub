import { NextRequest, NextResponse } from 'next/server'

const REGION_URLS: Record<string, string> = {
  west: 'https://west.albion-online-data.com/api/v2/stats',
  east: 'https://east.albion-online-data.com/api/v2/stats',
  europe: 'https://europe.albion-online-data.com/api/v2/stats',
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const region = searchParams.get('region') || 'west'
  const baseUrl = REGION_URLS[region]
  if (!baseUrl) {
    return NextResponse.json(
      { error: `Invalid region: ${region}` },
      { status: 400 },
    )
  }

  const upstreamUrl = new URL(`${baseUrl}/gold.json`)

  const count = searchParams.get('count')
  if (count) upstreamUrl.searchParams.set('count', count)

  const date = searchParams.get('date')
  if (date) upstreamUrl.searchParams.set('date', date)

  const endDate = searchParams.get('end_date')
  if (endDate) upstreamUrl.searchParams.set('end_date', endDate)

  try {
    const response = await fetch(upstreamUrl.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 }, // cache 10 min
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('[gold] Upstream fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gold prices from upstream' },
      { status: 502 },
    )
  }
}
