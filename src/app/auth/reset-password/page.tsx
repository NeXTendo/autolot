"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mismatch",
        description: "Passwords do not match.",
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message || "Could not update password.",
        })
        setLoading(false)
        return
      }

      toast({
        variant: "success",
        title: "Access Restored",
        description: "Your password has been updated. Please sign in.",
      })
      
      router.push('/login')
    } catch {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect. Please check your internet connection.",
      })
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md animate-fade-up border-none shadow-2xl overflow-hidden glass-panel">
        <CardHeader className="pt-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-platinum w-6 h-6" />
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Enter New Key</CardTitle>
          </div>
          <CardDescription className="text-platinum/50">
            Secure your account with a new authorization password.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40 mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/20 border-white/5 h-12 focus:border-platinum/50 transition-all font-mono"
                    disabled={loading}
                    required
                  />
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40 mb-2 block">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/20 border-white/5 h-12 focus:border-platinum/50 transition-all font-mono"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="platinum"
              className="w-full h-12 font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Finalize Reset'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <Link href="/login" className="text-xs text-platinum/40 hover:text-white transition-colors uppercase font-black tracking-widest">
              Cancel and Return
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
