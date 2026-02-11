"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  CheckCircle2, 
  Loader2,
  ShieldAlert
} from "lucide-react"

interface SecuritySettingsProps {
  profile: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    reputation_score: number
  }
}

export function DealerSecuritySettings({ profile: initialProfile }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialProfile.name || "",
    phone: initialProfile.phone || "",
    showEmail: true,
    showPhone: false,
  })

  const { toast } = useToast()
  const supabase = createClient()

  const handleSavePersonal = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
        })
        .eq('id', initialProfile.id)

      if (error) throw error

      toast({
        variant: "success",
        title: "Personal Info Updated",
        description: "Your personal credentials have been synchronized.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Could not update personal profile.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Identity */}
        <Card className="bg-white/5 border-white/10 rounded-none h-full">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-platinum flex items-center gap-2">
              <User size={16} /> Personal Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="personal-name" className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</Label>
              <Input
                id="personal-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10 rounded-none font-bold"
                placeholder="Manager Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personal-email" className="text-[10px] font-black uppercase tracking-widest text-white/40">Master Email (Read-only)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  id="personal-email"
                  value={initialProfile.email || ""}
                  disabled
                  className="bg-white/5 border-white/10 rounded-none pl-10 opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personal-phone" className="text-[10px] font-black uppercase tracking-widest text-white/40">Personal Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  id="personal-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-none pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <Button 
              onClick={handleSavePersonal} 
              disabled={loading}
              variant="platinum"
              className="w-full h-12 rounded-none font-black uppercase tracking-widest text-[10px]"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle2 className="mr-2" size={14} />}
              Sync Personal Data
            </Button>

            <div className="pt-6 border-t border-white/5">
              <div className="p-4 bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Master Reputation</span>
                <span className="flex items-center gap-1.5 text-platinum font-bold">
                  {initialProfile.reputation_score} <ShieldAlert size={12} className="text-platinum/50" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access & Security */}
        <Card className="bg-white/5 border-white/10 rounded-none h-full">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-platinum flex items-center gap-2">
              <Lock size={16} /> Access & Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-platinum/20" />
              <h3 className="text-lg font-bold mb-2 uppercase tracking-tighter">Security Credentials</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 max-w-[200px] mx-auto mb-8 leading-relaxed">
                Password rotation and 2FA settings are handled via secure vault sessions.
              </p>
              <Button variant="outline" className="rounded-none border-white/10 hover:bg-white hover:text-black transition-all px-8 text-[10px] font-black uppercase tracking-widest">
                Initiate Password Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Section */}
      <Card className="bg-white/5 border-white/10 rounded-none">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-platinum flex items-center gap-2">
            <Bell size={16} /> System Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5">
              <div className="space-y-1">
                <Label className="font-bold text-sm">Sale Notifications</Label>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Real-time alerts for conversions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5">
              <div className="space-y-1">
                <Label className="font-bold text-sm">Lead Alerts</Label>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Instant notification of new inquiries</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
