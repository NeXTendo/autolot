"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, Loader2 } from "lucide-react"

export function StrategicReach() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch stats (Reach)
    const { data: stats } = await supabase.rpc('get_seller_analytics_v2', {
      p_seller_id: user.id
    })

    // Fetch active leads (recent messages senders)
    const { data: leads } = await supabase
      .from('messages')
      .select('profiles!messages_sender_id_fkey(name, id)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (stats) {
      setData({
        reach: stats.monthly_reach,
        leads: leads?.map((l: any) => l.profiles) || []
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('reach-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_impressions' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-black/60">
          Organic Impressions Across Your Collection
        </p>
        
        <div className="mt-10 pt-6 border-t border-black/5 flex items-center justify-between">
          <div className="flex -space-x-3">
            {data?.leads?.length > 0 ? data.leads.map((lead: any, i: number) => (
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
