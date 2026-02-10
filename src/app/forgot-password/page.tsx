"use client"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to send reset link. Please try again.",
        })
        setLoading(false)
        return
      }

      setSubmitted(true)
      toast({
        variant: "success",
        title: "Link Sent",
        description: "If an account exists, a secure login link has been sent.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect. Please check your internet connection.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container py-12 md:py-24 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md animate-fade-up border-none shadow-2xl overflow-hidden glass-panel">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto w-16 h-16 bg-platinum/10 rounded-full flex items-center justify-center mb-6">
              <MailCheck className="text-platinum w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-black mb-2 uppercase tracking-tighter">Check Your Mail</CardTitle>
            <CardDescription className="text-platinum/50 px-4">
              We&apos;ve sent a secure authorization link to <span className="text-white font-bold">{email}</span>. Click the link to reset your access.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10 pt-4 flex flex-col items-center gap-6">
            <div className="h-px w-full bg-platinum/5" />
            <Link href="/login" className="flex items-center gap-2 text-sm text-platinum/60 hover:text-white transition-colors group uppercase font-black tracking-widest">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md animate-fade-up border-none shadow-2xl overflow-hidden glass-panel">
        <CardHeader className="pt-10">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Reset Access</CardTitle>
          <CardDescription className="text-platinum/50">
            Enter your credentials and we&apos;ll send a secure terminal link.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-platinum/40 mb-2 block">
                Auth Identifier (Email)
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter authorized email..."
                className="bg-black/20 border-white/5 h-12 focus:border-platinum/50 transition-all font-mono text-sm"
                disabled={loading}
                required
              />
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
                  Requesting...
                </>
              ) : (
                'Transmit Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <Link href="/login" className="flex items-center justify-center gap-2 text-xs text-platinum/40 hover:text-white transition-colors group uppercase font-black tracking-widest">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Secure Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
