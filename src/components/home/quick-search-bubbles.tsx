"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ShieldCheck, Sparkles } from "lucide-react"
import { getTrendingMakes } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"

const QUICK_FILTERS = [
  {
    label: "Clean Title",
    href: "/listings?title_status=Clean",
    icon: ShieldCheck,
  },
  {
    label: "Excellent",
    href: "/listings?search_condition=Excellent",
    icon: Sparkles,
  },
  {
    label: "Most Expensive",
    href: "/listings?sort_by=price&sort_order=desc",
    icon: TrendingUp,
  },
  {
    label: "Cheapest",
    href: "/listings?sort_by=price&sort_order=asc",
    icon: DollarSign,
  },
]

export function QuickSearchBubbles() {
  const [trendingMakes, setTrendingMakes] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchTrending() {
      const makes = await getTrendingMakes(supabase, 5)
      // Fallback to defaults if no views yet
      if (makes.length === 0) {
        setTrendingMakes(["Mercedes", "BMW", "Toyota", "Porsche", "Ferrari"])
      } else {
        setTrendingMakes(makes)
      }
    }
    fetchTrending()
  }, [supabase])

  return (
    <div className="flex flex-col gap-6 items-center animate-fade-up animation-delay-300">
      <div className="flex flex-wrap justify-center gap-3">
        {QUICK_FILTERS.map((filter) => (
          <Link key={filter.label} href={filter.href}>
            <Badge 
              variant="outline" 
              className="px-4 py-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-platinum/60 hover:text-white transition-all cursor-pointer rounded-none flex items-center gap-2"
            >
              <filter.icon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">{filter.label}</span>
            </Badge>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-platinum/30">Trending</span>
        <div className="flex flex-wrap justify-center gap-2">
          {trendingMakes.map((make) => (
            <Link key={make} href={`/listings?search_make=${make}`}>
              <span className="text-[10px] font-bold text-platinum/40 hover:text-white transition-colors cursor-pointer">
                #{make}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
