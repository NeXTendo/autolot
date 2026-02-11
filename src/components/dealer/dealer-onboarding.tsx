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
import { Loader2, Store, Upload, X, ShieldCheck } from "lucide-react"
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface DealerProfile {
  id: string
  business_name: string
  business_description: string | null
  business_address: string | null
  business_phone: string | null
  business_email: string | null
  website_url: string | null
  business_logo: string | null
  created_at: string
}

export function DealerOnboarding({ dealerId }: { dealerId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    business_name: '',
    business_description: '',
    business_address: '',
    business_phone: '',
    website_url: '',
  })

  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const checkProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('dealer_profiles')
      .select('*')
      .eq('id', dealerId)
      .single()

    if (error) {
      console.error('Error fetching dealer profile:', error)
      return
    }

    const profile = data as DealerProfile
    
    // Check if profile is empty/new
    // If business_name is the same as it was initially (likely placeholder)
    // or if it's been less than 5 minutes since created and description is empty
    const isNew = !profile.business_description && !profile.business_logo
    
    if (isNew) {
      setFormData({
        business_name: profile.business_name || '',
        business_description: '',
        business_address: '',
        business_phone: '',
        website_url: '',
      })
      setOpen(true)
    }
  }, [dealerId, supabase])

  useEffect(() => {
    checkProfile()
  }, [checkProfile])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let logoUrl = null

      if (logo) {
        const fileExt = logo.name.split('.').pop()
        const fileName = `${dealerId}-logo.${fileExt}`
        const filePath = `${dealerId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('dealer-assets')
          .upload(filePath, logo, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('dealer-assets')
          .getPublicUrl(filePath)
        
        logoUrl = publicUrl
      }

      const { error } = await supabase
        .from('dealer_profiles')
        .update({
          business_name: formData.business_name,
          business_description: formData.business_description,
          business_address: formData.business_address,
          business_phone: formData.business_phone,
          website_url: formData.website_url,
          ...(logoUrl && { business_logo: logoUrl }),
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId)

      if (error) throw error

      toast({
        variant: "success",
        title: "Profile Updated",
        description: "Welcome to the AutoLot Dealer Network!",
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
              <Store className="h-4 w-4 text-platinum" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-platinum/40">Onboarding Phase</span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
            Initialize <span className="text-platinum">Identity</span>
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            Welcome to the inner circle. Configure your business profile to start listing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-none border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-platinum/30">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-2" />
                ) : (
                  <Upload className="h-8 w-8 text-white/20 group-hover:text-platinum/50 transition-colors" />
                )}
              </div>
              <input
                type="file"
                id="onboarding-logo"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <label
                htmlFor="onboarding-logo"
                className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Logo</span>
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="biz-name" className="text-[10px] font-black uppercase tracking-widest text-white/40">Business Name</Label>
              <Input
                id="biz-name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all font-bold"
                placeholder="Elite Motors"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="biz-desc" className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</Label>
              <Textarea
                id="biz-desc"
                value={formData.business_description}
                onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all min-h-[100px]"
                placeholder="Brief overview of your business..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="biz-phone" className="text-[10px] font-black uppercase tracking-widest text-white/40">Phone</Label>
                <Input
                  id="biz-phone"
                  value={formData.business_phone}
                  onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="biz-web" className="text-[10px] font-black uppercase tracking-widest text-white/40">Website</Label>
                <Input
                  id="biz-web"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-none focus:border-platinum/50 transition-all"
                  placeholder="https://..."
                />
              </div>
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
              "Initialize Profile"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
