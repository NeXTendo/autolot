"use client"

import Link from "next/link"
import { SearchSuggestions as SuggestionsType } from "@/lib/supabase/rpc"

interface SearchSuggestionsProps {
  suggestions: SuggestionsType
  onSelect: (value: string) => void
  isVisible: boolean
}

export function SearchSuggestions({ suggestions, onSelect, isVisible }: SearchSuggestionsProps) {
  if (!isVisible) return null

  const hasResults = suggestions.makes.length > 0 || 
                     suggestions.models.length > 0 || 
                     suggestions.listings.length > 0

  if (!hasResults) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel border-white/5 bg-black/90 backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="p-4 space-y-6">
        {/* Makes */}
        {suggestions.makes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/30">Manufacturers</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.makes.map((make) => (
                <button
                  key={make}
                  onClick={() => onSelect(make)}
                  className="px-3 py-1.5 rounded-none bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-bold text-platinum/60 hover:text-white"
                >
                  {make}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Models */}
        {suggestions.models.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/30">Models</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.models.map((model) => (
                <button
                  key={model}
                  onClick={() => onSelect(model)}
                  className="px-3 py-1.5 rounded-none bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-bold text-platinum/60 hover:text-white"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top Matches */}
        {suggestions.listings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/30">Top Matches</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.listings.map((match) => (
                <button
                  key={match}
                  onClick={() => onSelect(match)}
                  className="px-3 py-1.5 rounded-none bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-bold text-platinum/60 hover:text-white"
                >
                  {match}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
