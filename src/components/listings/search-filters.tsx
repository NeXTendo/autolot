"use client"

import { useState } from "react"
import { SearchFilters as FilterType } from "@/lib/supabase/rpc"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"

interface SearchFiltersProps {
  filters: FilterType
  onFilterChange: (filters: FilterType) => void
  onApply: () => void
}

export function SearchFilters({ filters, onFilterChange, onApply }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = <K extends keyof FilterType>(key: K, value: FilterType[K] | "all") => {
    onFilterChange({ ...filters, [key]: value === "all" ? undefined : value })
  }

  const resetFilters = () => {
    onFilterChange({})
  }

  return (
    <div className="glass-panel overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-platinum" />
          <h3 className="font-black uppercase tracking-[0.2em] text-xs">Filter Selection</h3>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="h-px bg-white/5 w-full" />

          {/* Sorting */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40">Sort Inventory</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={filters.sort_by || "created_at"} onValueChange={(v) => updateFilter("sort_by", v as FilterType['sort_by'])}>
                <SelectTrigger className="bg-black/20 border-white/5 h-10 font-mono text-[10px] focus:border-platinum/50 transition-all uppercase tracking-widest">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="created_at">Date Listed</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="year">Model Year</SelectItem>
                  <SelectItem value="mileage">Mileage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.sort_order || "desc"} onValueChange={(v) => updateFilter("sort_order", v as FilterType['sort_order'])}>
                <SelectTrigger className="bg-black/20 border-white/5 h-10 font-mono text-[10px] focus:border-platinum/50 transition-all uppercase tracking-widest">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          {/* Categorical Filters */}
          <div className="space-y-5">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40">Price Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price || ""}
                  onChange={(e) => updateFilter("min_price", e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price || ""}
                  onChange={(e) => updateFilter("max_price", e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40">Model Year</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.min_year || ""}
                  onChange={(e) => updateFilter("min_year", e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.max_year || ""}
                  onChange={(e) => updateFilter("max_year", e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40">Body Style</Label>
              <Select value={filters.body_type || "all"} onValueChange={(v) => updateFilter("body_type", v)}>
                <SelectTrigger className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all">
                  <SelectValue placeholder="All Styles" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">All Styles</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="Coupe">Coupe</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Convertible">Convertible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40">Fuel Type</Label>
              <Select value={filters.fuel_type || "all"} onValueChange={(v) => updateFilter("fuel_type", v)}>
                <SelectTrigger className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all">
                  <SelectValue placeholder="All Fuel Types" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">All Fuel Types</SelectItem>
                  <SelectItem value="Gasoline">Gasoline</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40">Transmission</Label>
              <Select value={filters.transmission || "all"} onValueChange={(v) => updateFilter("transmission", v)}>
                <SelectTrigger className="bg-black/20 border-white/5 h-10 font-mono text-xs focus:border-platinum/50 transition-all">
                  <SelectValue placeholder="Any Transmission" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Any Transmission</SelectItem>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full pt-4" />

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={onApply} 
              variant="platinum" 
              className="w-full h-11 font-black uppercase tracking-widest text-[10px]"
            >
              Apply Filters
            </Button>
            <Button 
              onClick={resetFilters} 
              variant="outline" 
              className="w-full h-11 font-black uppercase tracking-widest text-[10px] border-white/5 text-platinum/40 hover:text-white"
            >
              Reset All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
