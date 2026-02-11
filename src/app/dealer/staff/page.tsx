"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  Shield, 
  Mail, 
  Phone,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
    name: string
    email: string
    phone: string | null
  }
}

export default function DealerStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [addingStaff, setAddingStaff] = useState(false)
  const [removingStaff, setRemovingStaff] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const [newStaff, setNewStaff] = useState({
    email: '',
    role: 'sales_agent',
    can_post_listings: true,
    can_manage_leads: true,
    can_edit_dealer_settings: false,
    can_access_billing: false
  })

  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

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
      router.push('/dashboard')
      return
    }

    const { data, error } = await supabase.rpc('get_dealer_staff', {
      p_dealer_id: user.id
    })

    if (error) {
      console.error('Error fetching staff:', error)
    } else {
      setStaff(data as unknown as StaffMember[])
    }
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const handleAddStaff = async () => {
    if (!newStaff.email) return

    setAddingStaff(true)
    try {
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

      if (error) throw error

      toast({
        variant: "success",
        title: "Agent Deployed",
        description: `Successfully added ${newStaff.email} to your network.`,
      })
      
      setShowAddDialog(false)
      setNewStaff({
        email: '',
        role: 'sales_agent',
        can_post_listings: true,
        can_manage_leads: true,
        can_edit_dealer_settings: false,
        can_access_billing: false
      })
      loadStaff()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: err instanceof Error ? err.message : "Ensure the user is registered first.",
      })
    } finally {
      setAddingStaff(false)
    }
  }

  const handleRemoveStaff = async (staffUserId: string) => {
    setRemovingStaff(staffUserId)
    try {
      const { error } = await supabase.rpc('remove_dealer_staff', {
        p_staff_id: staffUserId
      })

      if (error) throw error

      toast({
        variant: "success",
        title: "Agent Decommissioned",
        description: "Access privileges have been revoked.",
      })
      
      loadStaff()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      })
    } finally {
      setRemovingStaff(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum" size={48} />
      </div>
    )
  }

  const activeStaff = staff.filter(s => s.staff.is_active)

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 text-white">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pb-8 border-b border-white/5">
          <div className="animate-fade-down">
             <Link href="/dealer/dashboard" className="inline-flex items-center gap-2 text-platinum/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4 group">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                Return to Command Center
             </Link>
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
               Personnel <span className="text-platinum">Logistics</span>
             </h1>
             <p className="text-platinum/40 font-medium">
               Authorized agents monitoring your dealer network infrastructure.
             </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="platinum" className="h-14 px-8 rounded-none font-black uppercase tracking-widest animate-fade-down">
                <UserPlus size={18} className="mr-2" />
                Recruit New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 text-white overflow-hidden p-0 rounded-none">
               <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-platinum/0 via-platinum/50 to-platinum/0" />
               <div className="p-8">
                  <DialogHeader className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-platinum/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-platinum" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-platinum/40">Credential Deployment</span>
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                      New <span className="text-platinum">Agent</span> Authorization
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Identifier (Email)</Label>
                       <Input
                         type="email"
                         placeholder="agent@autolot.circle"
                         value={newStaff.email}
                         onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                         className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all font-bold h-12"
                       />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Privilege Matrix</Label>
                       
                       <div className="grid gap-3">
                          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 group hover:border-platinum/20 transition-all">
                             <div>
                                <div className="text-xs font-black uppercase tracking-widest text-white">Initialize Listings</div>
                                <div className="text-[9px] font-medium text-white/40 uppercase tracking-tighter">Authority to create and modify assets</div>
                             </div>
                             <Switch
                               checked={newStaff.can_post_listings}
                               onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_post_listings: checked })}
                               className="data-[state=checked]:bg-platinum"
                             />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 group hover:border-platinum/20 transition-all">
                             <div>
                                <div className="text-xs font-black uppercase tracking-widest text-white">Lead Acquisition</div>
                                <div className="text-[9px] font-medium text-white/40 uppercase tracking-tighter">Access to buyer communications channel</div>
                             </div>
                             <Switch
                               checked={newStaff.can_manage_leads}
                               onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_manage_leads: checked })}
                               className="data-[state=checked]:bg-platinum"
                             />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 group hover:border-platinum/20 transition-all opacity-50">
                             <div>
                                <div className="text-xs font-black uppercase tracking-widest text-white">System Config</div>
                                <div className="text-[9px] font-medium text-white/40 uppercase tracking-tighter">Restricted dealer profile overrides</div>
                             </div>
                             <Switch
                               checked={newStaff.can_edit_dealer_settings}
                               onCheckedChange={(checked) => setNewStaff({ ...newStaff, can_edit_dealer_settings: checked })}
                               className="data-[state=checked]:bg-platinum"
                             />
                          </div>
                       </div>
                    </div>

                    <Button
                      onClick={handleAddStaff}
                      disabled={!newStaff.email || addingStaff}
                      className="w-full h-14 bg-platinum text-black hover:bg-white transition-all font-black uppercase tracking-widest rounded-none mt-6"
                    >
                      {addingStaff ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        "Activate Authorization"
                      )}
                    </Button>
                  </div>
               </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Deployed Agents', value: staff.length, icon: Shield, color: 'platinum' },
            { label: 'Active Sessions', value: activeStaff.length, icon: CheckCircle2, color: 'blue-400' },
            { label: 'Lead Managers', value: staff.filter(s => s.staff.can_manage_leads).length, icon: Zap, color: 'platinum' }
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/10 animate-fade-up" style={{ ['--animation-delay' as string]: `${i * 100}ms`, animationDelay: 'var(--animation-delay)' }}>
              <stat.icon className={cn("mb-4 h-5 w-5", stat.color === 'platinum' ? 'text-platinum' : 'text-blue-400')} />
              <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Staff List Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest">Authorized Agents</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {staff.length > 0 ? (
            <div className="grid gap-6">
              {staff.map((member, index) => (
                <div 
                  key={member.staff.id} 
                  className="group relative bg-[#0d0d0d] border border-white/5 hover:border-platinum/30 transition-all duration-500 animate-fade-up overflow-hidden"
                  style={{ ['--animation-delay' as string]: `${index * 50}ms`, animationDelay: 'var(--animation-delay)' }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-platinum opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 bg-platinum/5 border border-white/10 flex items-center justify-center font-black text-platinum text-xl group-hover:bg-platinum/10 transition-colors">
                        {member.profile.name?.[0].toUpperCase() || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-lg font-bold text-white uppercase tracking-tight">{member.profile.name}</h3>
                           <span className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
                             {member.staff.role.replace('_', ' ')}
                           </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                           <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-platinum/40 group-hover:text-platinum/60 transition-colors">
                              <Mail size={12} /> {member.profile.email}
                           </span>
                           {member.profile.phone && (
                             <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-platinum/40">
                                <Phone size={12} /> {member.profile.phone}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                       <div className="flex gap-2">
                          {[
                            { active: member.staff.can_post_listings, label: 'Asset Control' },
                            { active: member.staff.can_manage_leads, label: 'Lead Operations' },
                            { active: member.staff.can_edit_dealer_settings, label: 'System Access' }
                          ].map((perm, pi) => (
                            <div key={pi} className={cn(
                              "px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all",
                              perm.active 
                                ? "bg-platinum/10 text-platinum border border-platinum/20" 
                                : "bg-white/5 text-white/20 border border-white/5"
                            )}>
                              {perm.label}
                            </div>
                          ))}
                       </div>

                       <Button
                         onClick={() => handleRemoveStaff(member.staff.staff_id)}
                         disabled={removingStaff === member.staff.staff_id}
                         variant="ghost"
                         className="h-12 px-6 rounded-none text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-[9px] border border-white/5 hover:border-red-500/20"
                       >
                         {removingStaff === member.staff.staff_id ? (
                           <Loader2 className="animate-spin mr-2" size={14} />
                         ) : (
                           <XCircle className="mr-2" size={14} />
                         )}
                         Revoke Privilege
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border border-white/5 bg-white/2 animate-fade-up">
               <ShieldAlert className="w-12 h-12 mx-auto mb-6 text-platinum/20" />
               <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">No Active Agents</h3>
               <p className="text-platinum/40 text-[10px] font-black uppercase tracking-[0.2em]">Recruit agents to expand your dealer network infrastructure</p>
               <Button
                 onClick={() => setShowAddDialog(true)}
                 variant="platinum"
                 className="h-12 px-8 rounded-none mt-8 font-black uppercase tracking-widest"
               >
                 Authorize First Agent
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
