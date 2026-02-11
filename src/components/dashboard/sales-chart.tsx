"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Loader2 } from "lucide-react"

interface ChartData {
  name: string
  views: number
}

interface SalesChartProps {
  sellerId: string
}

export function SalesChart({ sellerId }: SalesChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchChartData = useCallback(async (isMounted = { current: true }) => {
    const { data: chartData, error } = await supabase.rpc('get_seller_chart_data', {
      p_seller_id: sellerId
    })

    if (isMounted.current && !error && chartData) {
      setData(chartData as ChartData[])
    }
    if (isMounted.current) {
      setLoading(false)
    }
  }, [supabase, sellerId])

  useEffect(() => {
    const isMounted = { current: true }
    void (async () => {
      await fetchChartData(isMounted)
    })()

    const channel = supabase
      .channel('chart-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_impressions' }, () => fetchChartData(isMounted))
      .subscribe()

    return () => {
      isMounted.current = false
      supabase.removeChannel(channel)
    }
  }, [fetchChartData, supabase])

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/40 backdrop-blur-2xl h-[420px] flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum/40" size={32} />
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
      <CardHeader className="pb-0 border-b border-white/5 bg-white/5 p-6">
        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-platinum flex items-center justify-between w-full">
          <span>Engagement Velocity (Real-Time)</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-[10px] text-green-400 font-black tracking-tighter">LIVE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.length > 0 ? data : [{name: 'Empty', views: 0}]}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.15)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: '900' }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: '900' }}
              />
              <Tooltip 
                cursor={{ stroke: '#FFFFFF', strokeWidth: 2 }}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '900',
                  color: '#000000',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#000000' }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#FFFFFF" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorViews)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
