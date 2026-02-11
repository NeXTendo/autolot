"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Bell, Eye, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'
import { VehicleCard } from '@/components/vehicle-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { type Vehicle } from '@/lib/supabase/rpc'

interface SavedListingWithVehicle {
  saved_at: string
  notes: string | null
  vehicle: Vehicle
}

export default function BuyerDashboardPage() {
  const [savedListings, setSavedListings] = useState<SavedListingWithVehicle[]>([])
  const [alerts, setAlerts] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadDashboardData = useCallback(async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Load saved listings
    const { data: saved } = await supabase.rpc('get_saved_listings')
    if (saved) {
      setSavedListings(saved)
    }

    // Load buyer alerts
    const { data: alertData } = await supabase.rpc('get_buyer_alerts')
    if (alertData) {
      setAlerts(alertData)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    const init = async () => {
      await loadDashboardData()
    }
    init()
  }, [loadDashboardData])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            My Garage
          </h1>
          <p className="text-white/60">Track your saved vehicles and get alerts on new listings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-linear-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <Heart className="text-red-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{savedListings.length}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Saved Vehicles</div>
          </div>

          <div className="p-6 rounded-2xl bg-linear-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <Bell className="text-blue-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{alerts.length}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">New Matches</div>
          </div>

          <div className="p-6 rounded-2xl bg-linear-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-platinum" size={24} />
            </div>
            <Button asChild className="w-full bg-platinum text-black hover:bg-platinum/90 font-black">
              <Link href="/buyer/alerts">Manage Alerts</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Heart size={20} className="text-red-400" />
                  Saved Vehicles
                </h2>
              </div>

              {savedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedListings.map((saved) => (
                    <div key={saved.vehicle.id} className="relative">
                      <VehicleCard vehicle={saved.vehicle} />
                      {saved.notes && (
                        <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
                            Your Notes
                          </div>
                          <p className="text-sm text-white/70">{saved.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">
                    No Saved Vehicles
                  </h3>
                  <p className="text-white/40 text-sm mb-6">
                    Start saving vehicles you&apos;re interested in
                  </p>
                  <Button asChild variant="outline" className="border-platinum/20 text-platinum">
                    <Link href="/listings">Browse Listings</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* New Matches */}
            {alerts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Bell size={20} className="text-blue-400" />
                    New Matches
                  </h2>
                  <span className="text-xs text-white/40 uppercase tracking-widest font-black">
                    Last 7 Days
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {alerts.slice(0, 4).map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>

                {alerts.length > 4 && (
                  <Button asChild variant="ghost" className="w-full mt-4 text-platinum">
                    <Link href="/buyer/alerts">View All {alerts.length} Matches</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/listings">
                    <Eye size={16} />
                    Browse All Listings
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/buyer/alerts">
                    <Bell size={16} />
                    Manage Alerts
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin">
                    <MessageSquare size={16} />
                    My Messages
                  </Link>
                </Button>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="p-6 rounded-2xl bg-linear-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="text-platinum mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">
                    Pro Tip
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Set up search alerts to get notified instantly when vehicles matching your criteria are listed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
