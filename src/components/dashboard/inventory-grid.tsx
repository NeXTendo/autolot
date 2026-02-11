"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Vehicle } from "@/lib/supabase/rpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { 
  Edit3, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Plus,
  Image as ImageIcon,
  MoreVertical,
  ExternalLink,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function InventoryGrid() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchVehicles = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('vehicles')
      .select('*, seller:profiles(name, is_verified)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setVehicles(data as any[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // Real-time synchronization
    const channel = supabase
      .channel('inventory-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => fetchVehicles())
      .subscribe()

    // Initial load
    void (async () => {
      await fetchVehicles()
    })()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchVehicles, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-platinum mb-4" size={32} />
        <p className="text-platinum-dim animate-pulse uppercase tracking-[0.2em] text-[10px] font-black">Scanning Inventory...</p>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-white/5 bg-white/5 rounded-none">
        <div className="p-5 rounded-none bg-white/5 inline-block mb-6">
          <Plus size={40} className="text-platinum/20" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Active Assets</h3>
        <p className="text-platinum-dim mb-8 max-w-xs mx-auto text-sm italic">
          &ldquo;Start your legacy by listing your first masterpiece.&rdquo;
        </p>
        <Link 
          href="/listings/new" 
          className="px-8 py-3 bg-platinum text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all rounded-none"
        >
          Begin Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-up">
      {vehicles.map((car) => (
        <Card key={car.id} className="group border-white/5 bg-card/40 backdrop-blur-xl hover:border-platinum/30 transition-all duration-500 rounded-none overflow-hidden flex flex-col h-full">
          <div className="relative aspect-video overflow-hidden">
            {car.images?.[0] ? (
              <Image 
                src={car.images[0]} 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={car.model} 
              />
            ) : (
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                <ImageIcon size={32} className="text-white/10" />
              </div>
            )}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-none border backdrop-blur-md ${
                car.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-platinum/10 text-platinum border-platinum/20'
              }`}>
                {car.status}
              </span>
              {car.is_premium && (
                <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-none border border-platinum/40 bg-platinum text-black">
                  Premium
                </span>
              )}
            </div>
            {/* Quick Stats Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-lg font-bold text-white leading-none">{(car as any).views_count || 0}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-platinum/60">Views</div>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-lg font-bold text-white leading-none">0</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-platinum/60">Leads</div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate pr-2">{car.year} {car.make}</h4>
                <p className="text-sm font-black text-platinum tracking-tighter truncate">{car.model}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-black text-white"><PriceDisplay price={Number(car.price)} /></div>
                <div className="text-[8px] text-platinum/30 font-black uppercase tracking-widest">Fixed Asset</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-2 bg-white/5 border border-white/5 space-y-1">
                <div className="text-[7px] font-black uppercase tracking-widest text-platinum/30">Mileage</div>
                <div className="text-[10px] font-bold text-platinum/80">{Number(car.mileage).toLocaleString()} KM</div>
              </div>
              <div className="p-2 bg-white/5 border border-white/5 space-y-1">
                <div className="text-[7px] font-black uppercase tracking-widest text-platinum/30">Condition</div>
                <div className="text-[10px] font-bold text-platinum/80">{car.condition}</div>
              </div>
            </div>

            <div className="mt-auto flex gap-2">
              <Button asChild variant="outline" className="flex-1 h-9 rounded-none border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all text-[9px] font-black uppercase tracking-widest">
                <Link href={`/listings/edit/${car.id}`}>
                  <Edit3 size={12} className="mr-2" /> Edit Asset
                </Link>
              </Button>
              <Button variant="outline" className="h-9 w-9 p-0 rounded-none border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center">
                <Trash2 size={12} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
