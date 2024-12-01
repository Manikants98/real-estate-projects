'use client'

import RealEstateMap from '@/app/components/RealEstateMap'
import { useEffect, useState } from 'react'
import { Skeleton, TextField, Button } from '@mui/material'
import { Room } from '@mui/icons-material'
import Image from 'next/image'

interface Project {
  name: string
  location: string
  priceRange: string
  imageUrl: string
  bhkDetails: string
}

export default function CityPage({ params }: any) {
  const [cityName, setCityName] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [project, setProject] = useState<Project>({} as Project)
  const [open, setOpen] = useState(false)

  const fetchLocation = async () => {
    const { cityName } = await params
    setCityName(cityName)

    fetch(`/api/scrape?cityName=${cityName}`)
      .then((response) => response.json())
      .then((data: Project[]) => {
        setProjects(data)
        setFilteredProjects(data)
      })
      .catch((error) => {
        console.error('Failed to fetch projects:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchLocation()
  }, [params])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase()
    setSearchTerm(value)
    const filtered = projects.filter(
      (project) => project.name.toLowerCase().includes(value) || project.location.toLowerCase().includes(value)
    )
    setFilteredProjects(filtered)
  }

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <div className="p-4">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="100%" height={50} />
      </div>
    </div>
  )

  return (
    <div className="container flex flex-col gap-4 mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Real Estate Projects in {cityName || 'Loading...'}</h1>

      {loading ? (
        <>
          <Skeleton variant="rectangular" width="100%" height={40} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            <TextField
              placeholder="Search Project"
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <img
                    src={project.imageUrl || 'https://via.placeholder.com/300x200'}
                    alt={project.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.location}</p>
                    <p className="text-lg font-semibold">{project.priceRange}</p>
                    <p className="text-sm text-gray-500">{project.bhkDetails}</p>
                    <Button
                      disableElevation
                      variant="contained"
                      startIcon={<Room />}
                      color="primary"
                      onClick={() => {
                        setProject(project)
                        setOpen(true)
                      }}
                    >
                      Show on Map
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-500">No projects found.</p>
            )}
          </div>
        </>
      )}
      <RealEstateMap project={project} open={open} setOpen={setOpen} />
    </div>
  )
}
