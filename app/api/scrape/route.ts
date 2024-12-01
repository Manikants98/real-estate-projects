import axios from 'axios'
import * as cheerio from 'cheerio'
import { NextRequest, NextResponse } from 'next/server'

interface Project {
  name: string
  location: string
  priceRange: string
  imageUrl: string
  bhkDetails: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityName = searchParams.get('cityName')
  if (!cityName) {
    return NextResponse.json({ error: 'City name is required' }, { status: 400 })
  }
  const url = `https://www.magicbricks.com/new-projects-${encodeURIComponent(cityName)}`
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const projects: Project[] = []
    $('.projdis__prjcard').each((_, el) => {
      const name = $(el).find('.mghome__prjblk__prjname').text().trim()
      const location = $(el).find('.mghome__prjblk__locname').text().trim()
      const priceRange = $(el).find('.mghome__prjblk__price').text().trim()
      const imageUrl =
        $(el).find('.mghome__prjblk__imgsec__img').attr('data-src')?.trim() ||
        $(el).find('.mghome__prjblk__imgsec__img').attr('src')?.trim() ||
        'https://via.placeholder.com/150'
      const bhkDetails = $(el).find('.mghome__prjblk__bhk').text().trim()
      if (name) {
        projects.push({ name, location, priceRange, imageUrl, bhkDetails })
      }
    })
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
