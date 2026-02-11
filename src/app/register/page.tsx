"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Store, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccountType = 'registered' | 'dealer' | 'inspector'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('registered')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!fullName || !email || !password || !confirmPassword) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Please fill in all required fields." })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Password Mismatch", description: "Passwords do not match." })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: accountType,
          },
        },
      })

      if (error) {
        toast({ variant: "destructive", title: "Registration Failed", description: error.message })
        setLoading(false)
        return
      }

      if (data.user) {
        toast({
          variant: "success",
          title: "Account Created!",
          description: `Welcome to AutoLot. Redirecting to your dashboard...`,
        })
        
        setTimeout(() => {
          if (accountType === 'dealer') {
            router.push('/dealer/dashboard')
          } else if (accountType === 'inspector') {
            router.push('/inspector/dashboard')
          } else {
            router.push('/dashboard')
          }
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during database synchronization. Please try again or contact support."
      toast({ 
        variant: "destructive", 
        title: "Registration Failed", 
        description: errorMessage
      })
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md animate-fade-up">
        <CardHeader>
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription>Join the exclusive AutoLot circle.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Account Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['registered', 'dealer', 'inspector'] as const).map((id) => {
                  const typeMap = {
                    registered: { label: 'Buyer', icon: User },
                    dealer: { label: 'Dealer', icon: Store },
                    inspector: { label: 'Inspector', icon: ShieldCheck }
                  }
                  const type = typeMap[id]
                  const Icon = type.icon
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAccountType(id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 border text-[10px] font-black uppercase tracking-widest gap-2 transition-all",
                        accountType === id 
                          ? "bg-platinum text-black border-platinum" 
                          : "bg-white/5 border-white/10 text-platinum/40 hover:border-white/20"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button type="submit" variant="platinum" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Register as ${accountType}`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-[hsl(var(--platinum))] hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}