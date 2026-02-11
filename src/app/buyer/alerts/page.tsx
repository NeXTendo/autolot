"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { VehicleCard } from '@/components/vehicle-card'

interface BuyerPreferences {
  alert_makes: string[]
  alert_models: string[]
  alert_min_price: number | null
  alert_max_price: number | null
  alert_min_year: number | null
  alert_max_year: number | null
  email_alerts_enabled: boolean
  alert_frequency: string
}

interface AlertMatch {
  id: string
  year: number
  make: string
  model: string
  trim: string
  price: number
  mileage: number
  images: string[]
}

export default function BuyerAlertsPage() {
  const [preferences, setPreferences] = useState<BuyerPreferences | null>(null)
  const [matches, setMatches] = useState<AlertMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadPreferences = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Load existing preferences
    const { data: prefs } = await supabase
      .from('buyer_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefs) {
      setPreferences(prefs)
    } else {
      // Initialize empty preferences
      setPreferences({
        alert_makes: [],
        alert_models: [],
        alert_min_price: null,
        alert_max_price: null,
        alert_min_year: null,
        alert_max_year: null,
        email_alerts_enabled: true,
        alert_frequency: 'daily'
      })
    }

    // Load matching vehicles
    const { data: alertData } = await supabase.rpc('get_buyer_alerts')
    if (alertData) {
      setMatches(alertData)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  async function savePreferences() {
    setSaving(true)
    setLoading(true)

    const { error } = await supabase.rpc('set_buyer_preferences', {
      p_preferences: preferences
    })

    if (!error) {
      // Reload matches
      const { data: alertData } = await supabase.rpc('get_buyer_alerts')
      if (alertData) {
        setMatches(alertData)
      }
    }

    setSaving(false)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            Search Alerts
          </h1>
          <p className="text-white/60">Get notified when vehicles matching your criteria are listed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alert Configuration */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Bell size={20} />
                Alert Preferences
              </h2>

              <div className="space-y-6">
                {/* Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                      Min Price
                    </Label>
                    <Input
                      type="number"
                      placeholder="$0"
                      value={preferences?.alert_min_price || ''}
                      onChange={(e) => setPreferences({ ...preferences!, alert_min_price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                      Max Price
                    </Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={preferences?.alert_max_price || ''}
                      onChange={(e) => setPreferences({ ...preferences!, alert_max_price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                      Min Year
                    </Label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={preferences?.alert_min_year || ''}
                      onChange={(e) => setPreferences({ ...preferences!, alert_min_year: e.target.value ? parseInt(e.target.value) : null })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                      Max Year
                    </Label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={preferences?.alert_max_year || ''}
                      onChange={(e) => setPreferences({ ...preferences!, alert_max_year: e.target.value ? parseInt(e.target.value) : null })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                    Alert Frequency
                  </Label>
                  <Select
                    value={preferences?.alert_frequency || 'daily'}
                    onValueChange={(value) => setPreferences({ ...preferences!, alert_frequency: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Button */}
                <Button 
                  onClick={savePreferences} 
                  disabled={saving}
                  className="w-full bg-platinum text-black hover:bg-platinum/90 font-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Matching Vehicles */}
            {matches.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6">
                  Matching Vehicles ({matches.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">
                How It Works
              </h3>
              <ul className="space-y-3 text-xs text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-platinum mt-0.5">1.</span>
                  <span>Set your preferences for make, model, price, and year</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-platinum mt-0.5">2.</span>
                  <span>Choose how often you want to receive alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-platinum mt-0.5">3.</span>
                  <span>Get notified when matching vehicles are listed</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">
                Current Matches
              </h3>
              <div className="text-4xl font-black text-white mb-2">{matches.length}</div>
              <p className="text-xs text-white/60">
                Vehicles listed in the last 7 days matching your criteria
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
