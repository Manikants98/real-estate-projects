import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

interface GeocodeResponse {
  latitude: number
  longitude: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')
  const apiKey = process.env.POSITIONSTACK_API_KEY

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 })
  }
  try {
    const { data } = await axios.get(`http://api.positionstack.com/v1/forward?access_key=${
      apiKey || 'dba2e969b502358c6488822731ef3c37'
    }
&query=${location}`)
    if (data.data && data.data.length > 0) {
      const { latitude, longitude } = data.data[0]
      const result: GeocodeResponse = { latitude, longitude }
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
