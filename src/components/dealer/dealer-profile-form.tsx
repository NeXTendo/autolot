"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, Trash2, Globe, Phone, Mail, MapPin, Building2 } from "lucide-react"
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DealerProfile {
  id: string
  business_name: string
  business_description: string | null
  business_address: string | null
  business_phone: string | null
  business_email: string | null
  website_url: string | null
  business_logo: string | null
}

export function DealerProfileForm({ initialProfile }: { initialProfile: DealerProfile }) {
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialProfile.business_logo)
  const [formData, setFormData] = useState({
    business_name: initialProfile.business_name || '',
    business_description: initialProfile.business_description || '',
    business_address: initialProfile.business_address || '',
    business_phone: initialProfile.business_phone || '',
    business_email: initialProfile.business_email || '',
    website_url: initialProfile.website_url || '',
  })

  const { toast } = useToast()
  const supabase = createClient()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    setLogo(null)
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let logoUrl = initialProfile.business_logo

      if (logo) {
        const fileExt = logo.name.split('.').pop()
        const fileName = `${initialProfile.id}-logo.${fileExt}`
        const filePath = `${initialProfile.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('dealer-assets')
          .upload(filePath, logo, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('dealer-assets')
          .getPublicUrl(filePath)
        
        logoUrl = publicUrl
      } else if (logoPreview === null) {
        logoUrl = null
      }

      const { error } = await supabase
        .from('dealer_profiles')
        .update({
          ...formData,
          business_logo: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', initialProfile.id)

      if (error) throw error

      toast({
        variant: "success",
        title: "Profile Updated",
        description: "Your dealer profile has been successfully updated.",
      })
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
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Branding */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 rounded-none overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-platinum">Brancing & Identity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group w-full aspect-square max-w-[200px]">
                  <div className="w-full h-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden relative">
                    {logoPreview ? (
                      <Image 
                        src={logoPreview} 
                        alt="Business Logo" 
                        fill 
                        className="object-contain p-4"
                        unoptimized
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-white/10" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label htmlFor="logo-upload" className="p-2 bg-platinum text-black cursor-pointer hover:bg-white transition-colors">
                      <Upload size={16} />
                    </label>
                    {logoPreview && (
                      <button 
                        type="button" 
                        onClick={handleRemoveLogo}
                        className="p-2 bg-destructive text-white hover:bg-red-600 transition-colors"
                        title="Remove logo"
                        aria-label="Remove logo"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    id="logo-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoChange}
                    title="Upload business logo"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Business Logo</p>
                  <p className="text-[9px] text-white/20 italic">Recommended: Square PNG/SVG</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Information */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white/5 border-white/10 rounded-none">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-platinum">General Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-[10px] font-black uppercase tracking-widest text-white/40">Legal Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url" className="text-[10px] font-black uppercase tracking-widest text-white/40">Official Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input
                      id="website_url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-none pl-10"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_description" className="text-[10px] font-black uppercase tracking-widest text-white/40">About the Business</Label>
                <Textarea
                  id="business_description"
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-none min-h-[120px] resize-none"
                  placeholder="Tell us about your company and expertise..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-none">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-platinum">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business_email" className="text-[10px] font-black uppercase tracking-widest text-white/40">Public Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input
                      id="business_email"
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-none pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone" className="text-[10px] font-black uppercase tracking-widest text-white/40">Business phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input
                      id="business_phone"
                      value={formData.business_phone}
                      onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-none pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_address" className="text-[10px] font-black uppercase tracking-widest text-white/40">Physical Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/20" />
                  <Textarea
                    id="business_address"
                    value={formData.business_address}
                    onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-none pl-10 h-20 resize-none"
                    placeholder="Street, City, Postcode..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="submit" 
              variant="platinum" 
              className="h-14 px-12 rounded-none font-black uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit Changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
