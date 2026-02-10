"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { SellerAnalytics } from "@/lib/supabase/rpc"
import { Card, CardContent } from "@/components/ui/card"
import { useCurrency } from "@/lib/currency/currency-context"
import { 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  Loader2
} from "lucide-react"

interface AnalyticsStatProps {
  label: string
  value: string | number
  trend: number
  icon: React.ElementType
  isCurrency?: boolean
}

function AnalyticsStat({ label, value, trend, icon: Icon, isCurrency }: AnalyticsStatProps) {
  const isPositive = trend >= 0
  const { formatPrice } = useCurrency()
  
  const displayValue = isCurrency && typeof value === 'number' 
    ? formatPrice(value) 
    : value

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-lg hover:border-platinum/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-platinum/10 border border-white/10 text-platinum shadow-inner">
            <Icon size={20} />
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] font-black px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {Math.abs(trend)}%
          </div>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.2em] text-platinum/50 font-black mb-1.5">{label}</h4>
          <div className="text-3xl font-bold text-white tracking-tight">{displayValue || "0"}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsSummary() {
  const [stats, setStats] = useState<SellerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = useCallback(async (isMounted = { current: true }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isMounted.current) return

    const { data, error } = await supabase.rpc('get_seller_analytics_v2', {
      p_seller_id: user.id
    })

    if (!isMounted.current) return

    if (!error && data) {
      setStats(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const isMounted = { current: true }
    
    // Using void and async IIFE to avoid cascading render lint
    void (async () => {
      if (isMounted.current) {
        await fetchStats(isMounted)
      }
    })()

    // Real-time subscription to leads, vehicles, and impressions to refresh stats
    const channel = supabase
      .channel('dashboard-stats-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchStats(isMounted))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => fetchStats(isMounted))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_impressions' }, () => fetchStats(isMounted))
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchStats, supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-primary/10 bg-card/40 animate-pulse">
            <CardContent className="p-6 h-32 flex items-center justify-center">
              <Loader2 className="animate-spin text-platinum/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up">
      <AnalyticsStat 
        label="Total Views" 
        value={stats?.total_views?.toLocaleString() || "0"} 
        trend={12.5} 
        icon={Eye} 
      />
      <AnalyticsStat 
        label="New Leads" 
        value={stats?.new_leads || "0"} 
        trend={8.2} 
        icon={MessageSquare} 
      />
      <AnalyticsStat 
        label="Inventory Value" 
        value={stats?.inventory_value || 0} 
        trend={-2.4} 
        icon={DollarSign} 
        isCurrency={true}
      />
      <AnalyticsStat 
        label="Conversion Rate" 
        value={`${stats?.conversion_rate || 0}%`} 
        trend={4.1} 
        icon={BarChart3} 
      />
    </div>
  )
}
