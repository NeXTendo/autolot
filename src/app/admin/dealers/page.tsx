"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Building2, UserCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface DealerDetails {
  business_name?: string | null
  business_email?: string | null
  business_phone?: string | null
  business_address?: string | null
  is_verified?: boolean | null
  created_at?: string
}

interface DealerProfileResponse {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  dealer_profiles: DealerDetails | DealerDetails[] | null
}

interface DealerProfile {
  id: string
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  is_verified: boolean
  created_at: string
  is_incomplete?: boolean
}

export default function AdminDealerVerificationPage() {
  const [dealers, setDealers] = useState<DealerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const loadDealers = useCallback(async () => {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      router.push('/')
      return
    }

    // Load dealers from profiles joined with dealer_profiles
    // Use the hint syntax to specify which foreign key relationship to use
    // (dealer_profiles has two FKs to profiles: id and verified_by)
    console.log('[Dealer Verification] Starting to load dealers...')
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        dealer_profiles!dealer_profiles_id_fkey (*)
      `)
      .eq('role', 'dealer')
      .order('created_at', { ascending: false })

    console.log('[Dealer Verification] Query result:', { data, error })

    if (error) {
      console.error('[Dealer Verification] Error loading dealers:', error)
    }

    if (data) {
      console.log('[Dealer Verification] Raw data count:', data.length)
      // Map to DealerProfile interface
      const mappedDealers: DealerProfile[] = data.map((profile: DealerProfileResponse) => {
        const rawDp = profile.dealer_profiles
        const dp = Array.isArray(rawDp) ? rawDp[0] : rawDp
        console.log('[Dealer Verification] Mapping dealer:', { 
          profileId: profile.id, 
          rawDp, 
          dp,
          hasProfile: !!dp 
        })
        return {
          id: profile.id,
          business_name: dp?.business_name || profile.name || 'Unknown Dealer',
          business_email: dp?.business_email || profile.email || '',
          business_phone: dp?.business_phone || profile.phone || '',
          business_address: dp?.business_address || 'No address provided',
          is_verified: dp?.is_verified || false,
          created_at: dp?.created_at || profile.created_at,
          // Add flag to indicate if profile is incomplete
          is_incomplete: !dp
        }
      })
      console.log('[Dealer Verification] Mapped dealers:', mappedDealers)
      setDealers(mappedDealers)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    // Initial load
    loadDealers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



  async function verifyDealer(dealerId: string) {
    setVerifying(dealerId)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('dealer_profiles')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user?.id
      })
      .eq('id', dealerId)

    // Reload dealers
    await loadDealers()
    setVerifying(null)
  }

  async function unverifyDealer(dealerId: string) {
    setVerifying(dealerId)
    setLoading(true)

    await supabase
      .from('dealer_profiles')
      .update({
        is_verified: false,
        verified_at: null,
        verified_by: null
      })
      .eq('id', dealerId)

    // Reload dealers
    await loadDealers()
    setVerifying(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum" size={48} />
      </div>
    )
  }

  const pendingDealers = dealers.filter(d => !d.is_verified)
  const verifiedDealers = dealers.filter(d => d.is_verified)

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            Dealer Verification
          </h1>
          <p className="text-white/60">Review and verify dealer applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-linear-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="text-yellow-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{pendingDealers.length}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Pending Review</div>
          </div>

          <div className="p-6 rounded-2xl bg-linear-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className="text-green-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{verifiedDealers.length}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Verified</div>
          </div>

          <div className="p-6 rounded-2xl bg-linear-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="text-platinum" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{dealers.length}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Total Dealers</div>
          </div>
        </div>

        {/* Pending Dealers */}
        {pendingDealers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-yellow-400" />
              Pending Verification ({pendingDealers.length})
            </h2>

            <div className="space-y-4">
              {pendingDealers.map((dealer) => (
                <div key={dealer.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{dealer.business_name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/60">
                        {dealer.business_email && (
                          <div>
                            <span className="text-white/40">Email:</span> {dealer.business_email}
                          </div>
                        )}
                        {dealer.business_phone && (
                          <div>
                            <span className="text-white/40">Phone:</span> {dealer.business_phone}
                          </div>
                        )}
                        {dealer.business_address && (
                          <div className="md:col-span-2">
                            <span className="text-white/40">Address:</span> {dealer.business_address}
                          </div>
                        )}
                        <div>
                          <span className="text-white/40">Applied:</span>{' '}
                          {new Date(dealer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => verifyDealer(dealer.id)}
                        disabled={verifying === dealer.id}
                        className="bg-green-500 hover:bg-green-600 text-white font-black"
                      >
                        {verifying === dealer.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Dealers */}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-400" />
            Verified Dealers ({verifiedDealers.length})
          </h2>

          {verifiedDealers.length > 0 ? (
            <div className="space-y-4">
              {verifiedDealers.map((dealer) => (
                <div key={dealer.id} className="p-6 rounded-2xl bg-white/5 border border-green-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{dealer.business_name}</h3>
                        <ShieldCheck className="text-green-400" size={20} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/60">
                        {dealer.business_email && (
                          <div>
                            <span className="text-white/40">Email:</span> {dealer.business_email}
                          </div>
                        )}
                        {dealer.business_phone && (
                          <div>
                            <span className="text-white/40">Phone:</span> {dealer.business_phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => unverifyDealer(dealer.id)}
                      disabled={verifying === dealer.id}
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      {verifying === dealer.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-white/40 text-sm">No verified dealers yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
