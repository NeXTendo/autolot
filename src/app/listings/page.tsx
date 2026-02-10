"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchVehicles, type Vehicle } from "@/lib/supabase/rpc"
import { VehicleCard } from "@/components/vehicle-card"
import { createClient } from "@/lib/supabase/client"

export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let ignore = false

    async function fetchVehicles() {
      const result = await searchVehicles(supabase, {
        page_limit: 50,
        page_offset: 0,
      })
      if (!ignore) {
        setVehicles(result.vehicles || [])
        setLoading(false)
      }
    }

    fetchVehicles()
    return () => {
      ignore = true
    }
  }, [supabase])

  const handleSearch = async () => {
    setLoading(true)
    const result = await searchVehicles(supabase, {
      search_make: searchTerm,
      page_limit: 50,
      page_offset: 0,
    })
    setVehicles(result.vehicles || [])
    setLoading(false)
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Vehicle Inventory
        </h1>
        <p className="text-muted-foreground">
          Browse our premium selection of vehicles
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No vehicles found
          </div>
        ) : (
          vehicles.map((car) => (
            <VehicleCard key={car.id} vehicle={car} />
          ))
        )}
      </div>
    </div>
  )
}
