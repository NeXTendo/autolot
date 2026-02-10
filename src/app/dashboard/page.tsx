import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  ListChecks, 
  PieChart, 
  Users, 
  Trash2, 
  Edit3,
  Image as ImageIcon
} from 'lucide-react'
import { AnalyticsSummary } from '@/components/dashboard/analytics-summary'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { ReviewManagement } from '@/components/dashboard/review-management'
import { SellerBenchmark } from '@/components/dashboard/seller-benchmark'
import { StrategicReach } from '@/components/dashboard/strategic-reach'
import { PriceDisplay } from '@/components/price-display'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myListings } = await supabase
    .from('vehicles')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container py-12 md:py-24 min-h-screen">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div className="animate-fade-down">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Seller Command</h1>
          <p className="text-platinum-dim italic">
            Welcome back, <span className="text-platinum font-bold uppercase tracking-widest text-sm not-italic ml-1">@{profile?.name?.toLowerCase().replace(/\s+/g, '_') || 'collector'}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4 animate-fade-down">
          <Link href="/listings/new" className="btn-platinum py-3.5 px-8 rounded-xl flex items-center gap-2 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            List New Vehicle
          </Link>
          <Link href="/profile" className="btn-outline-platinum py-3.5 px-8 rounded-xl flex items-center gap-2">
            <Users size={18} />
            Manage Personnel
          </Link>
        </div>
      </div>

      {/* Analytics Layer */}
      <div className="mb-12 space-y-8">
        <div className="flex items-center gap-3 mb-2 px-2">
          <PieChart className="text-platinum" size={20} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-platinum">Trading Intelligence</h2>
        </div>
        <AnalyticsSummary />
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        {/* Left/Middle Column (Intelligence & Inventory) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Performance Chart */}
          <SalesChart />

          {/* Listings Management */}
          <div className="glass-panel p-8 border-primary/10">
            <div className="flex justify-between items-center mb-10">
              <h4 className="font-bold text-sm uppercase tracking-widest text-platinum flex items-center gap-2">
                <ListChecks size={18} /> Current Inventory
              </h4>
              <span className="text-[10px] font-bold bg-platinum/10 px-3 py-1 rounded-full text-platinum uppercase tracking-widest">
                {myListings?.length || 0} active assets
              </span>
            </div>
            
            {(myListings?.length || 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings?.map(car => (
                  <div key={car.id} className="group flex items-center gap-5 p-4 rounded-xl bg-tertiary-bg/30 border border-white/5 hover:border-platinum/30 transition-all duration-300">
                    <div className="relative overflow-hidden rounded-lg w-24 h-16 bg-white/5 flex items-center justify-center">
                      {car.images?.[0] ? (
                        <Image 
                          src={car.images[0]} 
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={car.model} 
                        />
                      ) : (
                        <ImageIcon size={20} className="text-white/10" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{car.year} {car.make} {car.model}</div>
                      <div className="text-[10px] text-platinum-dim uppercase font-bold tracking-widest mt-0.5 flex items-center gap-2">
                        <span className="text-platinum"><PriceDisplay price={Number(car.price)} /></span> 
                        <span className="w-1 h-1 rounded-full bg-platinum/30"></span> 
                        {car.status}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link 
                        href={`/listings/edit/${car.id}`} 
                        className="p-2.5 rounded-lg bg-platinum/5 text-platinum-dim hover:text-white hover:bg-platinum/20 transition-all shadow-sm"
                        title="Edit Listing"
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button 
                        className="p-2.5 rounded-lg bg-platinum/5 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                <div className="p-4 rounded-full bg-platinum/5 inline-block mb-4">
                  <Plus size={32} className="text-platinum/20" />
                </div>
                <p className="text-platinum-dim mb-8 max-w-xs mx-auto text-sm italic">&ldquo;A collector&rsquo;s legacy begins with their first submission.&rdquo;</p>
                <Link href="/listings/new" className="px-10 py-4 border border-platinum/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-platinum hover:text-black transition-all">
                  Initialize First Listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Community & Benchmarks) */}
        <div className="space-y-8">
          {/* Benchmarking */}
          <SellerBenchmark />
          
          {/* Strategic Reach - LIVE */}
          <StrategicReach />

          {/* Reviews Management */}
          <ReviewManagement />
        </div>
      </div>
    </div>
  )
}
