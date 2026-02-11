"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, SlidersHorizontal, X, LayoutGrid, ListFilter, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchVehicles, type Vehicle, type SearchFilters as FilterType } from "@/lib/supabase/rpc"
import { VehicleCard } from "@/components/vehicle-card"
import { createClient } from "@/lib/supabase/client"
import { SearchFilters } from "@/components/listings/search-filters"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { getSearchSuggestions, type SearchSuggestions as SuggestionsType } from "@/lib/supabase/rpc"
import { SearchSuggestions } from "@/components/listings/search-suggestions"

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterType>({})
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SuggestionsType>({ makes: [], models: [], listings: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions({ makes: [], models: [], listings: [] })
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      const results = await getSearchSuggestions(supabase, searchQuery)
      setSuggestions(results)
      setShowSuggestions(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, supabase])

  // Sync URL parameters to filters
  useEffect(() => {
    const params: FilterType = {}
    
    searchParams.forEach((value, key) => {
      if (key === 'is_premium') {
        params.is_premium = value === 'true'
      } else if (key === 'min_price' || key === 'max_price' || key === 'min_year' || key === 'max_year' || key === 'min_mileage' || key === 'max_mileage') {
        params[key as keyof FilterType] = parseInt(value) as any
      } else {
        (params as any)[key] = value
      }
    })

    if (params.query) {
      setSearchQuery(params.query)
    } else if (params.search_make) {
      setSearchQuery(params.search_make)
    }

    setFilters(params)
  }, [searchParams])

  const fetchVehicles = useCallback(async (currentFilters: FilterType) => {
    setLoading(true)
    try {
      const result = await searchVehicles(supabase, {
        ...currentFilters,
        page_limit: 50,
        page_offset: 0,
      })
      setVehicles(result.vehicles || [])
      setIsFilterSheetOpen(false)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Only fetch if filters are not empty or if it's the initial load (which empty filters is fine)
    fetchVehicles(filters)
  }, [fetchVehicles, filters])

  const handleSearch = () => {
    setFilters(prev => ({ 
      ...prev, 
      query: searchQuery, 
      search_make: undefined, 
      search_model: undefined 
    }))
    setShowSuggestions(false)
  }

  const removeFilter = (key: keyof FilterType) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    if (key === 'search_make' || key === 'query') setSearchQuery("")
  }

  const activeFiltersCount = Object.keys(filters).length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)] z-0" />
      
      <div className="container relative z-10 py-12 md:py-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-up">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-platinum/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Global Inventory</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase">
              Global <span className="text-platinum">Marketplace</span>
            </h1>
            <p className="text-platinum/40 max-w-xl font-medium leading-relaxed">
              Discover verified listings from top sellers worldwide. Your next automotive masterpiece is just a search away.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-black tabular-nums">{vehicles.length}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-platinum/20">Active Listings</div>
            </div>
            <div className="h-12 w-px bg-white/5 mx-4" />
            <Button variant="platinum" className="h-14 px-8 rounded-none font-black uppercase tracking-widest group">
              Post Your Listing
              <LayoutGrid size={16} className="ml-3 group-hover:rotate-90 transition-transform duration-500" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-80 space-y-8 animate-fade-up [animation-delay:200ms]">
            <SearchFilters 
              filters={filters} 
              onFilterChange={setFilters} 
              onApply={() => fetchVehicles(filters)} 
            />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8 animate-fade-up [animation-delay:400ms]">
            {/* Search & Mobile Filter Trigger */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div ref={searchContainerRef} className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-platinum/20 group-focus-within:text-platinum transition-colors" />
                <Input
                  placeholder="Enter Make, Model or Designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="pl-12 h-14 bg-white/5 border-white/5 focus:border-platinum/50 rounded-none font-mono text-sm transition-all focus:ring-0"
                />
                <Button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-platinum text-black hover:bg-white rounded-none font-black uppercase tracking-widest text-[10px] italic z-10"
                >
                  Search
                </Button>
                <SearchSuggestions 
                  suggestions={suggestions} 
                  isVisible={showSuggestions} 
                  onSelect={(value) => {
                    setSearchQuery(value)
                    setShowSuggestions(false)
                    setFilters(prev => ({ 
                      ...prev, 
                      query: value, 
                      search_make: undefined, 
                      search_model: undefined 
                    }))
                  }} 
                />
              </div>
              
              <div className="flex gap-2">
                {/* Mobile Filter Sheet */}
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-14 px-6 border-white/5 bg-white/5 rounded-none group">
                      <ListFilter className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-none bg-platinum text-black text-[10px] flex items-center justify-center font-black">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-black border-white/5 w-full sm:max-w-md p-0 overflow-y-auto">
                    <SheetHeader className="p-6 border-b border-white/5">
                      <SheetTitle className="text-white font-black uppercase tracking-widest italic flex items-center gap-3">
                        <SlidersHorizontal size={18} />
                        Marketplace Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="p-6">
                      <SearchFilters 
                        filters={filters} 
                        onFilterChange={setFilters} 
                        onApply={() => fetchVehicles(filters)} 
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 py-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-platinum/20 mr-2">Active Modifiers:</div>
                {Object.entries(filters).map(([key, value]) => {
                  if (value === undefined || value === null || value === "") return null
                  return (
                    <Badge 
                      key={key} 
                      variant="outline" 
                      className="bg-white/5 border-white/10 text-platinum rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group cursor-default hover:border-platinum/50 transition-colors"
                    >
                      {key.replace('search_', '').replace('min_', '> ').replace('max_', '< ')}: {value}
                      <button 
                        onClick={() => removeFilter(key as keyof FilterType)}
                        className="hover:text-white transition-colors"
                        title="Remove Filter"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  )
                })}
                <Button 
                  variant="ghost" 
                  onClick={() => setFilters({})}
                  className="text-[10px] font-black uppercase tracking-widest text-platinum/20 hover:text-white h-auto py-1 px-2"
                >
                  <RotateCcw size={12} className="mr-1.5" />
                  Clear All
                </Button>
              </div>
            )}

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-video glass-panel bg-white/5 animate-pulse" />
                ))
              ) : vehicles.length === 0 ? (
                <div className="col-span-full py-24 text-center glass-panel border-dashed border-white/5">
                  <SlidersHorizontal className="mx-auto h-12 w-12 text-white/5 mb-6" />
                  <div className="text-xl font-black uppercase tracking-widest italic text-white/20">No Listings Found</div>
                  <div className="text-xs text-platinum/20 uppercase tracking-[0.2em] mt-2">Adjust your filters to see more results from our global sellers</div>
                  <Button 
                    variant="link" 
                    onClick={() => setFilters({})} 
                    className="mt-6 text-platinum hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                vehicles.map((car) => (
                  <div key={car.id} className="animate-fade-up">
                    <VehicleCard vehicle={car} />
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination / Footer Info */}
            {!loading && vehicles.length > 0 && (
              <div className="flex flex-col items-center gap-6 py-12 border-t border-white/5">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-platinum/20">End of Current Array</div>
                <Button variant="outline" className="h-14 px-12 border-white/10 glass-panel rounded-none font-black uppercase tracking-widest italic hover:bg-white hover:text-black transition-all duration-500">
                  Load More Inventory
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

