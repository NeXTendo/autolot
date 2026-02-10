"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Trophy, 
  Settings, 
  Bell, 
  LogOut,
  Loader2,
  CheckCircle2,
  Lock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { signOut } from "@/app/register/actions"

interface ProfileFormProps {
  initialProfile: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    reputation_score: number
    is_verified: boolean
    location?: string
  }
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const [formData, setFormData] = useState({
    name: initialProfile.name || "",
    phone: initialProfile.phone || "",
    location: initialProfile.location || "Lusaka, Zambia",
    showEmail: true,
    showPhone: false,
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          // In a real app, location would be a separate field or in JSONB settings
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => ({ 
        ...prev, 
        name: formData.name, 
        phone: formData.phone 
      }))

      toast({
        variant: "success",
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Could not update profile.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar / Profile Card */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-platinum/10 border-2 border-platinum/20 flex items-center justify-center font-bold text-platinum text-4xl mx-auto shadow-2xl">
                {profile.name?.[0] || profile.email?.[0]?.toUpperCase()}
              </div>
              {profile.is_verified && (
                <div className="absolute bottom-0 right-0 bg-platinum text-black p-1.5 rounded-full border-2 border-background shadow-lg">
                  <ShieldCheck size={16} />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold mb-1 break-words">{profile.name || "Authorized Member"}</h2>
            <p className="text-xs text-platinum-dim uppercase tracking-widest font-bold mb-6">Signature Collector</p>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
              <div className="text-center">
                <div className="text-lg font-bold text-platinum">{profile.reputation_score}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Reputation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-platinum">0</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Listings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="glass-panel p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-sm font-medium" asChild>
            <form action={signOut}>
              <button type="submit" className="w-full h-full flex items-center gap-3 text-red-400">
                <LogOut size={18} />
                Revoke Access
              </button>
            </form>
          </Button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="lg:col-span-3">
        <Tabs defaultValue="personal" className="w-full space-y-6">
          <TabsList className="bg-platinum/5 border border-white/10 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger value="personal" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-platinum data-[state=active]:text-black">
              <User size={16} /> <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-platinum data-[state=active]:text-black">
              <Settings size={16} /> <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-platinum data-[state=active]:text-black">
              <Lock size={16} /> <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="animate-fade-up">
            <Card className="border-primary/10 bg-card/30 backdrop-blur-md">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <User size={20} className="text-platinum" />
                    Identity & Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Display Name</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-12 bg-platinum/5 border-white/10"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Primary Email</Label>
                      <div className="relative">
                        <Input 
                          value={profile.email || ""} 
                          disabled
                          className="h-12 bg-platinum/5 border-white/10 opacity-60 pr-10"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 ml-1 italic">Email cannot be changed directly.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                      <div className="relative">
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-12 bg-platinum/5 border-white/10 pr-10"
                          placeholder="+260 XXX XXX XXX"
                        />
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Trade Hub (Location)</Label>
                      <div className="relative">
                        <Input 
                          value={formData.location} 
                          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="h-12 bg-platinum/5 border-white/10 pr-10"
                        />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/40">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-platinum" />
                    Collector Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-platinum/5 border border-platinum/10">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Reputation</div>
                      <div className="text-lg font-bold flex items-center gap-2 text-platinum">
                        {profile.reputation_score} pts
                        <ShieldCheck size={14} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-platinum/5 border border-platinum/10 opacity-50">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Verification</div>
                      <div className="text-lg font-bold">In Progress</div>
                    </div>
                    <div className="p-4 rounded-xl bg-platinum/5 border border-platinum/10">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Tradings</div>
                      <div className="text-lg font-bold">0 Completed</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    variant="platinum"
                    className="h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-xs"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                    Apply Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-up">
            <Card className="border-primary/10 bg-card/30 backdrop-blur-md">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-platinum" />
                    Interface Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-platinum/5">
                      <div className="space-y-1">
                        <Label className="font-bold">Display Public Email</Label>
                        <p className="text-xs text-muted-foreground">Allow other collectors to see your primary email on listings.</p>
                      </div>
                      <Switch 
                        checked={formData.showEmail} 
                        onCheckedChange={v => setFormData(prev => ({ ...prev, showEmail: v }))} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-platinum/5">
                      <div className="space-y-1">
                        <Label className="font-bold">Public Phone Number</Label>
                        <p className="text-xs text-muted-foreground">Enable direct calls and WhatsApp inquiries from listing pages.</p>
                      </div>
                      <Switch 
                        checked={formData.showPhone} 
                        onCheckedChange={v => setFormData(prev => ({ ...prev, showPhone: v }))} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-platinum/5">
                      <div className="space-y-1">
                        <Label className="font-bold">Price Alerts</Label>
                        <p className="text-xs text-muted-foreground">Receive notifications when vehicles in your watchlist drop in price.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="animate-fade-up">
            <Card className="border-primary/10 bg-card/30 backdrop-blur-md">
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-platinum/20" />
                  <h3 className="text-xl font-bold mb-2">Access Management</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
                    Security settings and credential rotations are managed via our encrypted vault.
                  </p>
                  <Button variant="outline" className="gap-2">
                    Rotate Encryption Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
