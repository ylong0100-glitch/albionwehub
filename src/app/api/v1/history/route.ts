import { NextRequest, NextResponse } from 'next/server'

const REGION_URLS: Record<string, string> = {
  west: 'https://west.albion-online-data.com/api/v2/stats',
  east: 'https://east.albion-online-data.com/api/v2/stats',
  europe: 'https://europe.albion-online-data.com/api/v2/stats',
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const items = searchParams.get('items')
  if (!items) {
    return NextResponse.json(
      { error: 'Missing required parameter: items' },
      { status: 400 },
    )
  }

  const region = searchParams.get('region') || 'west'
  const baseUrl = REGION_URLS[region]
  if (!baseUrl) {
    return NextResponse.json(
      { error: `Invalid region: ${region}` },
      { status: 400 },
    )
  }

  const timeScale = searchParams.get('time-scale') || '6'
  const upstreamUrl = new URL(`${baseUrl}/history/${items}.json`)
  upstreamUrl.searchParams.set('time-scale', timeScale)

  const locations = searchParams.get('locations')
  if (locations) upstreamUrl.searchParams.set('locations', locations)

  const date = searchParams.get('date')
  if (date) upstreamUrl.searchParams.set('date', date)

  const endDate = searchParams.get('end_date')
  if (endDate) upstreamUrl.searchParams.set('end_date', endDate)

  const qualities = searchParams.get('qualities')
  if (qualities) upstreamUrl.searchParams.set('qualities', qualities)

  try {
    const response = await fetch(upstreamUrl.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 }, // cache 15 min
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
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('[history] Upstream fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history from upstream' },
      { status: 502 },
    )
  }
}
