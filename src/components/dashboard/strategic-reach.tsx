"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { SellerAnalytics } from "@/lib/supabase/rpc"
import { TrendingUp, Loader2 } from "lucide-react"

interface LeadProfile {
  id: string
  name: string
}

interface MessageWithProfile {
  profiles: LeadProfile | null
}

interface StrategicReachProps {
  sellerId: string
}

export function StrategicReach({ sellerId }: StrategicReachProps) {
  const [data, setData] = useState<{ reach: number; leads: LeadProfile[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async (isMounted = { current: true }) => {
    if (!isMounted.current) return

    // Fetch stats (Reach)
    const { data: stats } = await supabase.rpc('get_seller_analytics_v2', {
      p_seller_id: sellerId
    })

    if (!isMounted.current) return

    // Fetch active leads (recent messages senders)
    const { data: leads } = await supabase
      .from('messages')
      .select('profiles!messages_sender_id_fkey(name, id)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(5) as { data: MessageWithProfile[] | null }

    if (!isMounted.current) return

    if (stats) {
      const analytics = stats as unknown as SellerAnalytics
      setData({
        reach: analytics.monthly_reach,
        leads: (leads?.map(l => l.profiles).filter((p): p is LeadProfile => !!p)) || []
      })
    }
    setLoading(false)
  }, [supabase, sellerId])

  useEffect(() => {
    const isMounted = { current: true }
    
    // Using void and async IIFE to avoid cascading render lint
    void (async () => {
      if (isMounted.current) {
        await fetchData(isMounted)
      }
    })()

    const channel = supabase
      .channel('reach-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_impressions' }, () => fetchData(isMounted))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchData(isMounted))
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchData, supabase])

  if (loading) {
    return (
      <div className="glass-panel p-8 bg-white h-[240px] flex items-center justify-center">
        <Loader2 className="animate-spin text-black/10" />
      </div>
    )
  }

  return (
    <div className="glass-panel p-8 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-none relative overflow-hidden group animate-fade-up">
      <div className="absolute -right-6 -bottom-6 opacity-[0.08] group-hover:scale-125 transition-transform duration-1000 text-black">
        <TrendingUp size={200} strokeWidth={3} />
      </div>
      
      <div className="relative z-10">
        <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-4 text-black/40">Monthly Strategic Reach</h4>
        <div className="text-6xl font-black mb-3 tracking-tighter text-black tabular-nums">
          +{data?.reach?.toLocaleString() || "0"}
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-black/60">
          Organic Impressions Across Your Collection
        </p>
        
        <div className="mt-10 pt-6 border-t border-black/5 flex items-center justify-between">
          <div className="flex -space-x-3">
            {data?.leads && data.leads.length > 0 ? data.leads.map((lead) => (
              <div 
                key={lead.id} 
                className="w-10 h-10 rounded-full border-4 border-white bg-black shadow-lg flex items-center justify-center text-[10px] font-black text-white uppercase"
                title={lead.name}
              >
                {lead.name?.charAt(0)}
              </div>
            )) : (
              <div className="text-[10px] font-black text-black/20 uppercase tracking-widest italic">Awaiting New Leads</div>
            )}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Active Performance</div>
        </div>
      </div>
    </div>
  )
}
