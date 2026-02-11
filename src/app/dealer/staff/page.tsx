"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, Trash2, Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

interface StaffMember {
  staff: {
    id: string
    staff_id: string
    dealer_id: string
    role: string
    can_post_listings: boolean
    can_manage_leads: boolean
    can_edit_dealer_settings: boolean
    can_access_billing: boolean
    is_active: boolean
    created_at: string
  }
  profile: {
    id: string
    name: string
    email: string
  }
}

export default function DealerStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [newStaff, setNewStaff] = useState({
    email: '',
    role: 'sales',
    can_post_listings: true,
    can_manage_leads: true,
    can_edit_dealer_settings: false,
    can_access_billing: false
  })

  const loadStaff = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is dealer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'dealer') {
      router.push('/')
      return
    }

    // Load staff
    const { data } = await supabase.rpc('get_dealer_staff', {
      p_dealer_id: user.id
    })

    if (data) {
      setStaff(data)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  async function addStaff() {
    setAdding(true)

    const { error } = await supabase.rpc('add_dealer_staff', {
      p_staff_email: newStaff.email,
      p_permissions: {
        role: newStaff.role,
        can_post_listings: newStaff.can_post_listings,
        can_manage_leads: newStaff.can_manage_leads,
        can_edit_dealer_settings: newStaff.can_edit_dealer_settings,
        can_access_billing: newStaff.can_access_billing
      }
    })

    if (!error) {
      setShowAddDialog(false)
      setNewStaff({
        email: '',
        role: 'sales',
        can_post_listings: true,
        can_manage_leads: true,
        can_edit_dealer_settings: false,
        can_access_billing: false
      })
      setLoading(true)
      await loadStaff()
    }

    setAdding(false)
  }

  async function removeStaff(staffId: string) {
    setRemoving(staffId)

    await supabase.rpc('remove_dealer_staff', {
      p_staff_id: staffId
    })

    setLoading(true)
    await loadStaff()
    setRemoving(null)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                Team Management
              </h1>
              <p className="text-white/60">Manage your dealership staff and permissions</p>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-platinum text-black hover:bg-platinum/90 font-black">
                  <Plus size={16} />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-widest text-white">
                    Add Staff Member
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div>
                    <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="staff@example.com"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">
                      Permissions
                    </Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">Post Listings</div>
                          <div className="text-xs text-white/40">Can create and edit vehicle listings</div>
                        </div>
                        <Switch
                          checked={newStaff.can_post_listings}
                          onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_post_listings: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">Manage Leads</div>
                          <div className="text-xs text-white/40">Can view and respond to buyer inquiries</div>
                        </div>
                        <Switch
                          checked={newStaff.can_manage_leads}
                          onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_manage_leads: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">Edit Settings</div>
                          <div className="text-xs text-white/40">Can modify dealer profile and settings</div>
                        </div>
                        <Switch
                          checked={newStaff.can_edit_dealer_settings}
                          onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_edit_dealer_settings: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">Access Billing</div>
                          <div className="text-xs text-white/40">Can view and manage billing information</div>
                        </div>
                        <Switch
                          checked={newStaff.can_access_billing}
                          onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_access_billing: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={addStaff}
                    disabled={!newStaff.email || adding}
                    className="w-full bg-platinum text-black hover:bg-platinum/90 font-black"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Staff Member
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-platinum" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{staff.length}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Total Staff</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="text-green-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {staff.filter(s => s.staff.is_active).length}
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Active</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <Mail className="text-blue-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {staff.filter(s => s.staff.can_manage_leads).length}
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Can Manage Leads</div>
          </div>
        </div>

        {/* Staff List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6">
            Staff Members
          </h2>

          {staff.length > 0 ? (
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.staff.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-platinum/10 flex items-center justify-center text-lg font-black text-platinum">
                        {member.profile.name?.[0] || 'S'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{member.profile.name}</h3>
                        <p className="text-sm text-white/60">{member.profile.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {member.staff.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest">
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest">
                              <XCircle size={12} />
                              Inactive
                            </span>
                          )}
                          <span className="text-xs text-white/40 capitalize">
                            {member.staff.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => removeStaff(member.staff.staff_id)}
                      disabled={removing === member.staff.staff_id}
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      {removing === member.staff.staff_id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Remove
                    </Button>
                  </div>

                  {/* Permissions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className={`p-3 rounded-lg ${member.staff.can_post_listings ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'}`}>
                      <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
                        Post Listings
                      </div>
                      <div className={`text-sm font-bold ${member.staff.can_post_listings ? 'text-green-400' : 'text-white/40'}`}>
                        {member.staff.can_post_listings ? 'Yes' : 'No'}
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${member.staff.can_manage_leads ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'}`}>
                      <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
                        Manage Leads
                      </div>
                      <div className={`text-sm font-bold ${member.staff.can_manage_leads ? 'text-green-400' : 'text-white/40'}`}>
                        {member.staff.can_manage_leads ? 'Yes' : 'No'}
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${member.staff.can_edit_dealer_settings ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'}`}>
                      <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
                        Edit Settings
                      </div>
                      <div className={`text-sm font-bold ${member.staff.can_edit_dealer_settings ? 'text-green-400' : 'text-white/40'}`}>
                        {member.staff.can_edit_dealer_settings ? 'Yes' : 'No'}
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${member.staff.can_access_billing ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'}`}>
                      <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
                        Access Billing
                      </div>
                      <div className={`text-sm font-bold ${member.staff.can_access_billing ? 'text-green-400' : 'text-white/40'}`}>
                        {member.staff.can_access_billing ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">
                No Staff Members
              </h3>
              <p className="text-white/40 text-sm mb-6">
                Add team members to help manage your dealership
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                className="border-platinum/20 text-platinum"
              >
                <Plus size={16} />
                Add Your First Staff Member
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
