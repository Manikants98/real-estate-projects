import * as cheerio from 'cheerio'
import { NextRequest, NextResponse } from 'next/server'

interface Project {
  name: string
  location: string
  priceRange: string
  imageUrl: string
  bhkDetails: string
}

// Function to generate random User-Agent
const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  ]
  return userAgents[Math.floor(Math.random() * userAgents.length)]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityName = searchParams.get('cityName')

  if (!cityName) {
    return NextResponse.json({ error: 'City name is required' }, { status: 400 })
  }

  const url = `https://www.magicbricks.com/new-projects-${encodeURIComponent(cityName)}`
  console.log(`Fetching data from: ${url}`) // Log the URL being fetched

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: 'https://www.magicbricks.com/', // Add referrer if required
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch the data. Status: ${response.status}`)
    }

    const data = await response.text()
    const $ = cheerio.load(data)
    const projects: Project[] = []

    $('.projdis__prjcard').each((_, el) => {
      const name = $(el).find('.mghome__prjblk__prjname').text().trim()
      const location = $(el).find('.mghome__prjblk__locname').text().trim()
      const priceRange = $(el).find('.mghome__prjblk__price').text().trim()
      const imageUrl =
        $(el).find('.mghome__prjblk__imgsec__img').attr('data-src')?.trim() ||
        $(el).find('.mghome__prjblk__imgsec__img').attr('src')?.trim() ||
        ''
      const bhkDetails = $(el).find('.mghome__prjblk__bhk').text().trim()

      if (name) {
        projects.push({ name, location, priceRange, imageUrl, bhkDetails })
      }
    })

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Error:', error.message)
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}
