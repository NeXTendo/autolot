import Link from 'next/link'
import { Users, ShieldCheck, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="glass-panel p-8 md:p-12 animate-fade-up">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Admin Command Center</h1>
        <p className="text-platinum-dim mb-12 text-lg">Platform oversight and user management.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <Link href="/admin/users" className="group">
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all h-full">
              <div className="flex items-center justify-between mb-6">
                <Users className="w-10 h-10 text-platinum" />
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <span className="sr-only">Go</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
              <h4 className="font-bold text-xl mb-2 text-white">User Management</h4>
              <p className="text-platinum-dim">Manage user accounts, roles, and permissions across the platform.</p>
            </div>
          </Link>

          {/* Dealer Verification */}
          <Link href="/admin/dealers" className="group">
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all h-full">
              <div className="flex items-center justify-between mb-6">
                <ShieldCheck className="w-10 h-10 text-green-400" />
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <span className="sr-only">Go</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
              <h4 className="font-bold text-xl mb-2 text-white">Dealer Verification</h4>
              <p className="text-platinum-dim">Review dealer applications and manage verified status.</p>
            </div>
          </Link>

          {/* Analytics (Placeholder) */}
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 opacity-50 cursor-not-allowed h-full">
            <div className="flex items-center justify-between mb-6">
              <BarChart3 className="w-10 h-10 text-platinum-dim" />
            </div>
            <h4 className="font-bold text-xl mb-2 text-white">Platform Analytics</h4>
            <p className="text-platinum-dim">Coming soon: Global metrics and reporting dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
