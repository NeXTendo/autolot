"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { SellerAnalytics } from "@/lib/supabase/rpc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  BarChart, 
  Zap, 
  Timer,
  CheckCircle2,
  Loader2
} from "lucide-react"

interface BenchmarkItemProps {
  label: string
  userValue: string | number
  marketValue: string | number
  percentage: number
  icon: React.ElementType
  inverted?: boolean
}

function BenchmarkItem({ label, userValue, marketValue, percentage, icon: Icon, inverted = false }: BenchmarkItemProps) {
  const isBetter = inverted ? percentage < 0 : percentage > 0
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-black tracking-widest uppercase">
        <div className="flex items-center gap-2 text-white/90">
          <Icon size={14} className="text-white" /> {label}
        </div>
        <div className={isBetter ? 'text-green-400' : 'text-red-400'}>
          {percentage > 0 ? '+' : ''}{percentage}% vs Market
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, Math.max(10, 100 + percentage))}%` }}
            ></div>
          </div>
        </div>
        <div className="text-sm font-black w-14 text-right text-white">{userValue}</div>
      </div>
      
      <div className="flex justify-between text-[9px] uppercase font-black tracking-tighter text-white/40">
        <span>Current Performance</span>
        <span>Market Avg: {marketValue}</span>
      </div>
    </div>
  )
}

export function SellerBenchmark() {
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

    return () => {
      isMounted.current = false
    }
  }, [fetchStats])

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/40 backdrop-blur-2xl p-8 flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin text-platinum/40" />
      </Card>
    )
  }

  const calcDiff = (user: number, market: number) => {
    if (market === 0) return 0
    return Math.round(((user - market) / market) * 100)
  }

  const responseDiff = calcDiff(stats?.user_metrics?.response_time || 0, stats?.market_benchmarks?.avg_response_time || 1)
  const velocityDiff = calcDiff(stats?.user_metrics?.sales_velocity || 0, stats?.market_benchmarks?.avg_sales_velocity || 1)
  const conversionDiff = calcDiff(stats?.conversion_rate || 0, 4.2)

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-3xl shadow-3xl">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
          <BarChart size={18} /> Market Benchmarking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-10 pt-8">
        <BenchmarkItem 
          label="Sales Velocity" 
          userValue={`${stats?.user_metrics?.sales_velocity || 0}d`} 
          marketValue={`${stats?.market_benchmarks?.avg_sales_velocity || 0}d`} 
          percentage={-velocityDiff} 
          icon={Zap}
          inverted={true}
        />
        <BenchmarkItem 
          label="Response Time" 
          userValue={`${stats?.user_metrics?.response_time || 0}m`} 
          marketValue={`${stats?.market_benchmarks?.avg_response_time || 0}m`} 
          percentage={-responseDiff} 
          icon={Timer}
          inverted={true}
        />
        <BenchmarkItem 
          label="Lead Conversion" 
          userValue={`${stats?.conversion_rate}%`} 
          marketValue="4.2%" 
          percentage={conversionDiff} 
          icon={CheckCircle2}
        />
        
        <div className="pt-6 border-t border-white/5">
          <div className="p-5 rounded-2xl bg-white text-black shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-black rounded-lg text-white">
                <Users size={16} />
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em]">Collector Tier</div>
            </div>
            <p className="text-[11px] font-bold leading-relaxed text-black/80">
              {conversionDiff > 0 
                ? "You're outperforming 95% of collectors in lead conversion. Fast response times are your strategic advantage." 
                : "Active engagement could boost your sales velocity. Aim for sub-30 minute responses."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
