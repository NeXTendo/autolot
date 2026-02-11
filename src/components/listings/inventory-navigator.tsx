"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { getActiveMakes, type MakeInfo } from "@/lib/supabase/rpc"

interface InventoryNavigatorProps {
  onSelect?: (filters: { make?: string; model?: string; trim?: string }) => void
  className?: string
}

interface CountItem {
  label: string
  count: number
}

export function InventoryNavigator({ onSelect, className }: InventoryNavigatorProps) {
  const [makes, setMakes] = useState<MakeInfo[]>([])
  const [models, setModels] = useState<CountItem[]>([])
  const [trims, setTrims] = useState<CountItem[]>([])

  const [selectedMake, setSelectedMake] = useState<MakeInfo | null>(null)
  const [selectedModel, setSelectedModel] = useState<CountItem | null>(null)
  const [selectedTrim, setSelectedTrim] = useState<CountItem | null>(null)


  const supabase = createClient()
  
  const totalVehicles = makes.reduce((acc, make) => acc + make.vehicle_count, 0)

  // Level 1: Fetch Makes
  useEffect(() => {
    async function fetchMakes() {
      try {
        const data = await getActiveMakes(supabase)
        setMakes(data || [])
      } catch (err) {
        console.error("Failed to fetch makes", err)
      }
    }
    fetchMakes()
  }, [supabase])

  // Level 2: Fetch Models when Make selected
  useEffect(() => {
    async function fetchModels() {
      if (!selectedMake) {
        setModels([])
        setSelectedModel(null)
        setSelectedTrim(null)
        return
      }

      try {
        // Fetch all active vehicles for this make to aggregate models
        const { data, error } = await supabase
          .from('vehicles')
          .select('model')
          .eq('make', selectedMake.make)
          .eq('status', 'active')

        if (error) throw error

        // Aggregate counts
        const counts: Record<string, number> = {}
        const rows = data as { model: string }[] | null
        rows?.forEach((row) => {
          if (row.model) {
            counts[row.model] = (counts[row.model] || 0) + 1
          }
        })

        const sortedModels = Object.entries(counts)
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)

        setModels(sortedModels)
      } catch (err) {
        console.error("Failed to fetch models", err)
      }
    }

    fetchModels()
  }, [selectedMake, supabase])

  // Level 3: Fetch Trims when Model selected
  useEffect(() => {
    async function fetchTrims() {
      if (!selectedMake || !selectedModel) {
        setTrims([])
        setSelectedTrim(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('trim')
          .eq('make', selectedMake.make)
          .eq('model', selectedModel.label)
          .eq('status', 'active')

        if (error) throw error

        // Aggregate counts
        const counts: Record<string, number> = {}
        const rows = data as { trim: string }[] | null
        rows?.forEach((row) => {
          if (row.trim) {
            counts[row.trim] = (counts[row.trim] || 0) + 1
          }
        })

        const sortedTrims = Object.entries(counts)
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)

        setTrims(sortedTrims)
      } catch (err) {
        console.error("Failed to fetch trims", err)
      }
    }

    fetchTrims()
  }, [selectedMake, selectedModel, supabase])



  // Auto-trigger selection on change if desired, or use a button.
  // The user prompt "toyota(40)>hilux(23)>GR(4)" implies a path.
  // We'll trigger on specific selection updates or provide a "Go" interaction.
  // Let's make clicking a leaf node (or any node) trigger the filter for that level immediately?
  // "Selector... should e.g toyota>hilux".
  // Let's trigger callback whenever selection changes?
  
  const selectMake = (make: MakeInfo) => {
    setSelectedMake(make)
    setSelectedModel(null)
    setSelectedTrim(null)
    if (onSelect) onSelect({ make: make.make })
  }

  const selectModel = (model: CountItem) => {
    setSelectedModel(model)
    setSelectedTrim(null)
    if (onSelect) onSelect({ make: selectedMake?.make, model: model.label })
  }

  const selectTrim = (trim: CountItem) => {
    setSelectedTrim(trim)
    if (onSelect) onSelect({ make: selectedMake?.make, model: selectedModel?.label, trim: trim.label })
  }

  const selectAllMakes = () => {
    setSelectedMake(null)
    setSelectedModel(null)
    setSelectedTrim(null)
    if (onSelect) onSelect({ make: undefined, model: undefined, trim: undefined })
  }

  return (
    <div className={cn("flex items-center space-x-1 bg-white/5 backdrop-blur-md p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full scrollbar-hide", className)}>
      
      {/* Make Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "h-10 px-3 min-w-[140px] justify-between font-bold uppercase tracking-wide text-xs hover:bg-white/10",
              selectedMake ? "text-white" : "text-platinum/50"
            )}
          >
            <span className="truncate">{selectedMake ? `${selectedMake.make} (${selectedMake.vehicle_count})` : "Select Make"}</span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/10 text-white z-1000">
          <DropdownMenuItem 
            onClick={selectAllMakes}
            className="group flex items-center justify-between text-xs py-2 px-3 focus:bg-white/10 focus:text-white cursor-pointer gap-4 min-w-[200px]"
          >
            <span className="font-bold  uppercase tracking-wider italic text-white/50 group-hover:text-white">All Makes</span>
            <span className="text-platinum/40 font-mono group-hover:text-platinum whitespace-nowrap">{totalVehicles}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          {makes.map((make) => (
            <DropdownMenuItem 
              key={make.make}
              onClick={() => selectMake(make)}
              className="group flex items-center justify-between text-xs py-2 px-3 focus:bg-white/10 focus:text-white cursor-pointer gap-4 min-w-[200px]"
            >
              <span className="font-bold uppercase tracking-wider truncate">{make.make}</span>
              <span className="text-platinum/40 font-mono group-hover:text-platinum whitespace-nowrap">{make.vehicle_count}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ChevronRight className="h-4 w-4 text-white/10" />

      {/* Model Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!selectedMake}>
          <Button 
            variant="ghost" 
            disabled={!selectedMake}
            className={cn(
              "h-10 px-3 min-w-[140px] justify-between font-bold uppercase tracking-wide text-xs hover:bg-white/10 disabled:opacity-30",
              selectedModel ? "text-white" : "text-platinum/50"
            )}
          >
             <span className="truncate">{selectedModel ? `${selectedModel.label} (${selectedModel.count})` : "All Models"}</span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/10 text-white z-1000">
           <DropdownMenuItem 
              onClick={() => selectModel({ label: 'All Models', count: selectedMake?.vehicle_count || 0 })}
              className="text-white/50 italic text-xs py-2 px-3 focus:bg-white/10"
            >
              All Models
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          {models.map((model) => (
            <DropdownMenuItem 
              key={model.label}
              onClick={() => selectModel(model)}
              className="group flex items-center justify-between text-xs py-2 px-3 focus:bg-white/10 focus:text-white cursor-pointer gap-4 min-w-[200px]"
            >
              <span className="font-bold uppercase tracking-wider truncate">{model.label}</span>
              <span className="text-platinum/40 font-mono group-hover:text-platinum whitespace-nowrap">{model.count}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ChevronRight className="h-4 w-4 text-white/10" />

      {/* Trim Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!selectedModel}>
          <Button 
            variant="ghost" 
            disabled={!selectedModel}
            className={cn(
              "h-10 px-3 min-w-[140px] justify-between font-bold uppercase tracking-wide text-xs hover:bg-white/10 disabled:opacity-30",
              selectedTrim ? "text-white" : "text-platinum/50"
            )}
          >
             <span className="truncate">{selectedTrim ? `${selectedTrim.label} (${selectedTrim.count})` : "All Trims"}</span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/10 text-white z-1000">
            <DropdownMenuItem 
              onClick={() => selectTrim({ label: 'All Trims', count: selectedModel?.count || 0 })}
              className="text-white/50 italic text-xs py-2 px-3 focus:bg-white/10"
            >
              All Trims
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          {trims.map((trim) => (
            <DropdownMenuItem 
              key={trim.label}
              onClick={() => selectTrim(trim)}
              className="group flex items-center justify-between text-xs py-2 px-3 focus:bg-white/10 focus:text-white cursor-pointer gap-4 min-w-[200px]"
            >
              <span className="font-bold uppercase tracking-wider truncate">{trim.label}</span>
              <span className="text-platinum/40 font-mono group-hover:text-platinum whitespace-nowrap">{trim.count}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  )
}
