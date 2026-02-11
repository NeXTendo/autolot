"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, Loader2, Edit2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  listing_count: number
  dealer_profile?: {
    business_name: string
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [updating, setUpdating] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    
    // Check admin access first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const { data, error } = await supabase.rpc('get_all_users', {
        p_role: roleFilter === 'all' ? null : roleFilter,
        p_search: search || null,
        p_limit: 50
      })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "Error fetching users",
        description: "Please check your permissions and try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, router, search, roleFilter, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [loadUsers])

  const updateUserRole = async (newRole: string) => {
    if (!editingUser) return
    setUpdating(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', editingUser.id)

      if (error) throw error

      toast({
        title: "User updated",
        description: `Successfully updated role to ${newRole}`
      })
      
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Update failed",
        description: "Could not update user role.",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
              User Management
            </h1>
            <p className="text-white/60">Manage platform users, roles, and permissions</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-white/5 border-white/10 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dealer">Dealer</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white font-bold">User</TableHead>
                <TableHead className="text-white font-bold">Role</TableHead>
                <TableHead className="text-white font-bold">Joined</TableHead>
                <TableHead className="text-white font-bold">Listings</TableHead>
                <TableHead className="text-right text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-platinum" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-white/40">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{user.name || 'Unnamed User'}</span>
                        <span className="text-xs text-white/50">{user.email}</span>
                        {user.dealer_profile?.business_name && (
                          <span className="text-xs text-platinum mt-1">{user.dealer_profile.business_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          user.role === 'dealer' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          user.role === 'inspector' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-white/10 text-white border border-white/20'}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {user.listing_count || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:bg-white/10 text-white/60 hover:text-white"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                            <DialogDescription className="text-white/60">
                              Change role for {editingUser?.email}. This will affect their permissions immediately.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label>Select New Role</Label>
                              <Select 
                                defaultValue={editingUser?.role}
                                onValueChange={updateUserRole}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="dealer">Dealer</SelectItem>
                                  <SelectItem value="dealer_staff">Dealer Staff</SelectItem>
                                  <SelectItem value="inspector">Inspector</SelectItem>
                                  <SelectItem value="verified">Verified Seller</SelectItem>
                                  <SelectItem value="buyer">Buyer</SelectItem>
                                  <SelectItem value="registered">Registered (Default)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {editingUser?.role === 'admin' && (
                              <div className="rounded-md bg-yellow-500/10 p-4 border border-yellow-500/20 flex gap-3 items-start">
                                <ShieldAlert className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div className="text-sm text-yellow-200/80">
                                  Warning: Removing admin privileges will prevent this user from accessing the admin panel.
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
