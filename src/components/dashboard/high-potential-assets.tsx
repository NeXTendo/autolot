"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { getHighPotentialAssets, HighPotentialAsset } from "@/lib/supabase/rpc"
import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  ArrowUpRight,
  Loader2,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface HighPotentialAssetsProps {
  sellerId: string
}

export function HighPotentialAssets({ sellerId }: HighPotentialAssetsProps) {
  const [assets, setAssets] = useState<HighPotentialAsset[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAssets = useCallback(async () => {
    const data = await getHighPotentialAssets(supabase, sellerId)
    setAssets(data)
    setLoading(false)
  }, [supabase, sellerId])

  useEffect(() => {
    // Refresh when views or messages change
    const channel = supabase
      .channel('potential-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_impressions' }, () => fetchAssets())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchAssets())
      .subscribe()

    // Initial load
    void (async () => {
      await fetchAssets()
    })()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAssets, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-platinum/20 mb-3" size={24} />
      </div>
    )
  }

  if (assets.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles size={14} className="text-platinum" /> 
            High Potential <span className="text-platinum/40">Opportunities</span>
          </h4>
          <p className="text-[10px] text-platinum/30 font-black uppercase tracking-widest mt-1">Assets with high engagement but low conversion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="group border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-500 rounded-none overflow-hidden relative">
            <CardContent className="p-4 flex gap-4">
              <div className="relative w-24 h-16 bg-black shrink-0">
                {asset.image ? (
                  <Image 
                    src={asset.image} 
                    fill 
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    alt={asset.model} 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/5">
                    <Eye size={20} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-[11px] truncate">{asset.year} {asset.make}</h5>
                    <p className="text-[10px] text-platinum-dim truncate font-black tracking-widest uppercase">{asset.model}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-400">
                    <TrendingUp size={10} /> {asset.interest_score}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[9px] text-platinum/40 font-black uppercase tracking-widest">
                    <Eye size={10} /> {asset.total_views}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-platinum/40 font-black uppercase tracking-widest">
                    <MessageSquare size={10} /> {asset.lead_count}
                  </div>
                  <Link 
                    href={`/vehicle/${asset.id}`}
                    className="ml-auto text-platinum hover:text-white transition-colors p-1"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
