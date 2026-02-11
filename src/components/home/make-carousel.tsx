"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { getActiveMakes, type MakeInfo } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"

export function MakeCarousel() {
  const [makes, setMakes] = React.useState<MakeInfo[]>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    async function loadMakes() {
      try {
        const data = await getActiveMakes(supabase)
        setMakes(data)
      } catch (error) {
        console.error("Failed to load makes:", error)
      } finally {
        setLoading(false)
      }
    }
    loadMakes()
  }, [supabase])

  if (loading || makes.length === 0) return null

  return (
    <section className="py-24 border-t border-white/5">
      <div className="container px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8 mb-16 animate-fade-up">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-platinum/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Inventory</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase">
              Browse by <span className="text-platinum">Make</span>
            </h2>
            <p className="text-platinum/40 max-w-xl font-medium leading-relaxed">
              Find your next vehicle from our world-class inventory of prestigious manufacturers.
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-12 pb-8 hide-scrollbar snap-x items-center">
          {makes.map((item) => (
            <Link 
              key={item.make} 
              href={`/listings?search_make=${item.make}`}
              className="flex flex-col items-center gap-6 group snap-center min-w-[120px]"
            >
            <div className="relative w-24 h-24 transition-all duration-500 scale-90 group-hover:scale-110">
                <Image
                  src={`/logos/${item.make.toLowerCase()}.png`}
                  alt={item.make}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to a text placeholder if logo is missing
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-platinum/40 group-hover:text-white transition-colors">
                  {item.make}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
