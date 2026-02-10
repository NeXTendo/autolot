"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CurrencySelector } from "@/components/currency-selector"
import { SettingsModal } from "@/components/settings-modal"

import { 
  Menu, 
  Home, 
  Car, 
  LayoutDashboard, 
  User as UserIcon, 
  LogOut,
  Plus
} from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"

interface MobileNavProps {
  user: { id: string; email?: string } | null
  signOut: () => Promise<void>
}

export function MobileNav({ user, signOut }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors">
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] border-white/5 bg-[#0a0a0a] p-0 flex flex-col">
          <SheetHeader className="p-8 border-b border-white/5 text-left">
            <SheetTitle className="text-2xl font-black tracking-tighter">
              PLATINUM<span className="font-light text-white/40">AUTO</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col p-6 space-y-2">
            <MobileNavLink 
              href="/" 
              icon={Home} 
              label="Home" 
              onClick={() => setOpen(false)} 
            />
            <MobileNavLink 
              href="/listings" 
              icon={Car} 
              label="Inventory" 
              onClick={() => setOpen(false)} 
            />
            
            {user && (
              <>
                <div className="h-4" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-4 mb-2">Management</div>
                <MobileNavLink 
                  href="/dashboard" 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  onClick={() => setOpen(false)} 
                />
                <MobileNavLink 
                  href="/listings/new" 
                  icon={Plus} 
                  label="List Vehicle" 
                  onClick={() => setOpen(false)} 
                />
                <MobileNavLink 
                  href="/profile" 
                  icon={UserIcon} 
                  label="My Profile" 
                  onClick={() => setOpen(false)} 
                />
              </>
            )}

            {!user && (
              <>
                <div className="h-4" />
                <Link 
                  href="/login" 
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full"
                >
                  <Button variant="platinum" className="w-full justify-center h-12 uppercase font-black tracking-widest text-[11px]">
                    Client Access
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="mt-auto p-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <CurrencySelector />
              <SettingsModal />
            </div>

            {user && (
              <form action={signOut} className="w-full">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-4 h-12 text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all p-4"
                  type="submit"
                >
                  <LogOut size={18} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Terminate Session</span>
                </Button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MobileNavLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <Icon size={18} className="text-white/40 group-hover:text-white transition-colors" />
      </div>
      <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  )
}

interface NavBarProps {
  user: { id: string; email?: string } | null
  signOut: () => Promise<void>
}

export function NavBar({ user, signOut }: NavBarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tighter">
            PLATINUM<span className="font-light text-muted-foreground">AUTO</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:text-[hsl(var(--platinum))] transition-colors">
            Home
          </Link>
          <Link href="/listings" className="text-sm font-medium hover:text-[hsl(var(--platinum))] transition-colors">
            Inventory
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-[hsl(var(--platinum))] transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm font-medium hover:text-[hsl(var(--platinum))] transition-colors">
                Profile
              </Link>
              
              {/* Currency Selector */}
              <CurrencySelector />
              
              {/* Settings Modal */}
              <SettingsModal />
              
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Currency Selector for guests */}
              <CurrencySelector />
              
              {/* Settings Modal for guests */}
              <SettingsModal />
              
              <Link href="/login">
                <Button variant="platinum" size="sm">
                  Client Access
                </Button>
              </Link>
            </div>
          )}
        </div>

        <MobileNav user={user} signOut={signOut} />
      </div>
    </nav>
  )
}
