import { NextResponse } from 'next/server'

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

interface NotificationPayload {
  title: string
  message: string
  url?: string
  // Target: all users, specific segments, or specific playerIds
  target?: 'all' | 'subscribed_users' | string[]
}

export async function POST(request: Request) {
  try {
    const body: NotificationPayload = await request.json()
    const { title, message, url, target = 'all' } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
    }

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return NextResponse.json({ error: 'OneSignal credentials not configured' }, { status: 500 })
    }

    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
    }

    // Set URL if provided
    if (url) payload.url = url

    // Target audience
    if (Array.isArray(target)) {
      payload.include_player_ids = target  // Specific device IDs
    } else {
      payload.included_segments = [target === 'all' ? 'All' : 'Subscribed Users']
    }

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[OneSignal] Send error:', data)
      return NextResponse.json({ error: data }, { status: res.status })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[OneSignal] API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
