'use client'
import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Dialog, CircularProgress, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import axios from 'axios'
import classNames from 'classnames'

interface Project {
  name: string
  location: string
  priceRange: string
}

interface ShowOnMapProps {
  project: Project
  open: boolean
  setOpen: (open: boolean) => void
}

const RealEstateMap: React.FC<ShowOnMapProps> = ({ project, setOpen, open }) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (!open) return

    const fetchCoordinates = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get('/api/geocode', {
          params: { location: `${project.location}, India` },
        })

        if (data.latitude && data.longitude) {
          setCoordinates({ latitude: data.latitude, longitude: data.longitude })
        } else {
          console.error('Coordinates not found for the provided location.')
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCoordinates()
  }, [open, project.location])

  useEffect(() => {
    if (!coordinates || !mapRef.current || !open) return

    const { latitude, longitude } = coordinates

    const map = L.map(mapRef.current).setView([latitude, longitude], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    const customIcon = L.icon({
      iconUrl: '/pngegg.png',
      iconSize: [40, 65],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
    marker.bindPopup(`
      <strong>${project.name}</strong>
      <p>${project.location}</p>
      <p>${project.priceRange}</p>
    `)

    return () => {
      map.remove()
    }
  }, [coordinates, open, project])

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <div className="h-[500px] w-full relative">
        <IconButton className="!absolute !right-1 !top-1 !bg-white !bg-opacity-35 !z-[99999]" onClick={handleClose}>
          <Close />
        </IconButton>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </div>
        )}
        <div ref={mapRef} className={classNames('h-full w-full', loading ? 'hidden' : 'block')} />
      </div>
    </Dialog>
  )
}

export default RealEstateMap
