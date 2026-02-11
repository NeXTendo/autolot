"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CurrencySelector } from "@/components/currency-selector"
import { SettingsModal } from "@/components/settings-modal"
import type { UserRole } from "@/lib/types/roles"

import { 
  Menu, 
  Home, 
  Car, 
  User as UserIcon, 
  LogOut,
  Plus,
  Building2,
  Heart,
  ShieldCheck,
  FileCheck,
  Users
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
  userRole?: UserRole | null
  signOut: () => Promise<void>
}

export function MobileNav({ user, userRole, signOut }: MobileNavProps) {
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
              AUTO<span className="font-light text-white/40">LOT</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col p-6 space-y-2 overflow-y-auto">
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
                
                {/* Dealer Links */}
                {userRole === 'dealer' && (
                  <>
                    <MobileNavLink 
                      href="/dealer/dashboard" 
                      icon={Building2} 
                      label="Dashboard" 
                      onClick={() => setOpen(false)} 
                    />
                    <MobileNavLink 
                      href="/dealer/settings" 
                      icon={Plus} 
                      label="Business Profile" 
                      onClick={() => setOpen(false)} 
                    />
                    <MobileNavLink 
                      href="/dealer/staff" 
                      icon={Users} 
                      label="Team Management" 
                      onClick={() => setOpen(false)} 
                    />
                  </>
                )}

                {/* Buyer Links */}
                {(userRole === 'buyer' || userRole === 'registered' || userRole === 'verified') && (
                  <>
                    <MobileNavLink 
                      href="/buyer/dashboard" 
                      icon={Heart} 
                      label="My Garage" 
                      onClick={() => setOpen(false)} 
                    />
                    <MobileNavLink 
                      href="/buyer/alerts" 
                      icon={Car} 
                      label="Search Alerts" 
                      onClick={() => setOpen(false)} 
                    />
                  </>
                )}

                {/* Admin Links */}
                {(userRole === 'admin' || userRole === 'moderator') && (
                  <MobileNavLink 
                    href="/admin/dealers" 
                    icon={ShieldCheck} 
                    label="Admin Panel" 
                    onClick={() => setOpen(false)} 
                  />
                )}

                {/* Inspector Links */}
                {userRole === 'inspector' && (
                  <MobileNavLink 
                    href="/inspector/dashboard" 
                    icon={FileCheck} 
                    label="Inspector Dashboard" 
                    onClick={() => setOpen(false)} 
                  />
                )}

                {/* General Links */}

                <MobileNavLink 
                  href="/listings/new" 
                  icon={Plus} 
                  label="List Vehicle" 
                  onClick={() => setOpen(false)} 
                />
                {userRole !== 'dealer' && (
                  <MobileNavLink 
                    href="/profile" 
                    icon={UserIcon} 
                    label="My Profile" 
                    onClick={() => setOpen(false)} 
                  />
                )}
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
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-all group",
        isActive ? "bg-white text-[#0a0a0a]" : "hover:bg-white/5 text-white/60"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
        isActive ? "bg-[#0a0a0a]/10 text-[#0a0a0a]" : "bg-white/5 group-hover:bg-white/10"
      )}>
        <Icon size={18} className={cn(
          "transition-colors",
          isActive ? "text-[#0a0a0a]" : "text-white/40 group-hover:text-white"
        )} />
      </div>
      <span className={cn(
        "text-sm font-black uppercase tracking-widest transition-colors",
        isActive ? "text-[#0a0a0a]" : "group-hover:text-white"
      )}>
        {label}
      </span>
    </Link>
  )
}

interface NavBarProps {
  user: { id: string; email?: string } | null
  userRole?: UserRole | null
  signOut: () => Promise<void>
}

export function NavBar({ user, userRole, signOut }: NavBarProps) {
  const pathname = usePathname()

  const navLinkClass = (href: string) => cn(
    "text-xs uppercase tracking-widest font-black px-4 py-2 rounded-full transition-all",
    pathname === href 
      ? "bg-white text-[#0a0a0a] shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
      : "text-white/40 hover:text-white hover:bg-white/5"
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="text-2xl font-black tracking-tighter group-hover:scale-105 transition-transform">
            AUTO<span className="font-light text-white/40">LOT</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link href="/listings" className={navLinkClass("/listings")}>
            Inventory
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-px h-4 bg-white/10 mx-2" />
              
              {/* Dealer Links */}
              {userRole === 'dealer' && (
                <>
                  <Link href="/dealer/dashboard" className={navLinkClass("/dealer/dashboard")}>
                    Dashboard
                  </Link>
                  <Link href="/dealer/settings" className={navLinkClass("/dealer/settings")}>
                    Business
                  </Link>
                  <Link href="/dealer/staff" className={navLinkClass("/dealer/staff")}>
                    Team
                  </Link>
                </>
              )}

              {/* Buyer Links */}
              {(userRole === 'buyer' || userRole === 'registered' || userRole === 'verified') && (
                <>
                  <Link href="/buyer/dashboard" className={navLinkClass("/buyer/dashboard")}>
                    Garage
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {(userRole === 'admin' || userRole === 'moderator') && (
                <Link href="/admin/dealers" className={navLinkClass("/admin/dealers")}>
                  Admin
                </Link>
              )}

              {/* Inspector Links */}
              {userRole === 'inspector' && (
                <Link href="/inspector/dashboard" className={navLinkClass("/inspector/dashboard")}>
                  Verify
                </Link>
              )}


              {userRole !== 'dealer' && (
                <Link href="/profile" className={navLinkClass("/profile")}>
                  Me
                </Link>
              )}
              
              <div className="w-px h-4 bg-white/10 mx-2" />
              
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

        <MobileNav user={user} userRole={userRole} signOut={signOut} />
      </div>
    </nav>
  )
}
