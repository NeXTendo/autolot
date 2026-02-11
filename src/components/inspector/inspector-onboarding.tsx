"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShieldCheck, Save, BadgeCheck } from "lucide-react"
import { useRouter } from 'next/navigation'

interface InspectorProfile {
  id: string
  certification_number: string | null
  certification_authority: string | null
  specializations: string[] | null
  years_experience: number | null
}

export function InspectorOnboarding({ inspectorId }: { inspectorId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    certification_number: '',
    certification_authority: '',
    specializations: '',
    years_experience: '',
  })

  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const checkProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('inspector_profiles')
      .select('*')
      .eq('id', inspectorId)
      .single()

    if (error) {
      console.error('Error fetching inspector profile:', error)
      return
    }

    const profile = data as InspectorProfile
    
    // Check if profile is empty/new
    const isNew = !profile.certification_number && !profile.certification_authority
    
    if (isNew) {
      setOpen(true)
    }
  }, [inspectorId, supabase])

  useEffect(() => {
    checkProfile()
  }, [checkProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const specializationsArray = formData.specializations
        ? formData.specializations.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const { error } = await supabase
        .from('inspector_profiles')
        .update({
          certification_number: formData.certification_number,
          certification_authority: formData.certification_authority,
          specializations: specializationsArray,
          years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectorId)

      if (error) throw error

      toast({
        variant: "success",
        title: "Profile Initialized",
        description: "Your inspector credentials have been saved.",
      })
      
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-platinum/0 via-platinum/50 to-platinum/0" />
        
        <DialogHeader className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-platinum/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-platinum" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-platinum/40">Inspector Authentication</span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
            Verify <span className="text-platinum">Credentials</span>
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            Complete your professional profile to begin auditing vehicles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cert-num" className="text-[10px] font-black uppercase tracking-widest text-white/40">Cert. Number</Label>
                <Input
                  id="cert-num"
                  value={formData.certification_number}
                  onChange={(e) => setFormData({ ...formData, certification_number: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all font-bold"
                  placeholder="ASE-123456"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cert-auth" className="text-[10px] font-black uppercase tracking-widest text-white/40">Authority</Label>
                <Input
                  id="cert-auth"
                  value={formData.certification_authority}
                  onChange={(e) => setFormData({ ...formData, certification_authority: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all font-bold"
                  placeholder="ASE Certified"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="experience" className="text-[10px] font-black uppercase tracking-widest text-white/40">Years Experience</Label>
              <Input
                id="experience"
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all font-bold"
                placeholder="5"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specs" className="text-[10px] font-black uppercase tracking-widest text-white/40">Specializations</Label>
              <Textarea
                id="specs"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all min-h-[80px]"
                placeholder="Ex: Luxury Engines, Hybrid Systems, Body Frame Audit (comma separated)"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-platinum text-black hover:bg-white transition-all font-black uppercase tracking-widest rounded-none mt-4"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <BadgeCheck size={18} />
                Activate Inspector Status
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
