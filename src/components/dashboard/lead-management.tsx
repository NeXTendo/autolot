"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { getSellerLeads, SellerLead } from "@/lib/supabase/rpc"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar,
  ExternalLink,
  Car,
  Loader2,
  Inbox
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function formatLeadDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(new Date(dateStr))
}

interface LeadManagementProps {
  sellerId: string
}

export function LeadManagement({ sellerId }: LeadManagementProps) {
  const [leads, setLeads] = useState<SellerLead[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    const data = await getSellerLeads(supabase, sellerId)
    setLeads(data)
    setLoading(false)
  }, [supabase, sellerId])

  useEffect(() => {
    // Real-time subscription to messages
    const channel = supabase
      .channel('lead-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, () => fetchLeads())
      .subscribe()

    // Initial fetch using async IIFE to avoid cascading render lint
    void (async () => {
      await fetchLeads()
    })()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeads, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-platinum mb-4" size={32} />
        <p className="text-platinum-dim animate-pulse uppercase tracking-[0.2em] text-[10px] font-black">Syncing Comms...</p>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-white/5 bg-white/5 rounded-none">
        <div className="p-5 rounded-none bg-white/5 inline-block mb-6">
          <Inbox size={40} className="text-platinum/20" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Active Inquiries</h3>
        <p className="text-platinum-dim mb-8 max-w-xs mx-auto text-sm italic">
          &ldquo;Patience is the companion of wisdom in the marketplace.&rdquo;
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-up">
      {leads.map((lead) => (
        <Card key={lead.id} className="border-white/5 bg-card/40 backdrop-blur-xl hover:border-platinum/20 transition-all duration-500 rounded-none overflow-hidden group">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
              {/* Buyer Info */}
              <div className="p-6 md:w-1/3 lg:w-1/4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-platinum/10 flex items-center justify-center font-black text-platinum rounded-none">
                    {lead.buyer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{lead.buyer.name}</h4>
                    <span className="text-[10px] text-platinum/40 font-black uppercase tracking-widest">Interested Buyer</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 text-[10px] text-platinum-dim">
                    <Mail size={12} className="text-platinum/20" />
                    <span className="truncate">{lead.buyer.email}</span>
                  </div>
                  {lead.buyer.phone && (
                    <div className="flex items-center gap-3 text-[10px] text-platinum-dim">
                      <Phone size={12} className="text-platinum/20" />
                      <span>{lead.buyer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-platinum-dim">
                    <Calendar size={12} className="text-platinum/20" />
                    <span>{formatLeadDate(lead.created_at)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Badge variant="outline" className="rounded-none border-platinum/20 bg-platinum/5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    {lead.status}
                  </Badge>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6 flex-1 bg-white/2">
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare size={16} className="text-platinum/40 mt-1 shrink-0" />
                  <p className="text-sm leading-relaxed text-platinum/90 italic">
                    &ldquo;{lead.message}&rdquo;
                  </p>
                </div>
                {lead.dealer_notes && (
                  <div className="mt-4 p-3 bg-black/40 border border-white/5 text-[11px] text-platinum/60 leading-relaxed rounded-none">
                    <span className="font-black uppercase tracking-widest text-[8px] text-platinum/30 block mb-1">Internal Note:</span>
                    {lead.dealer_notes}
                  </div>
                )}
              </div>

              {/* Vehicle Context */}
              <div className="p-6 md:w-64 lg:w-72 bg-white/5 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 bg-black overflow-hidden shrink-0">
                    {lead.vehicle.image ? (
                      <Image 
                        src={lead.vehicle.image} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={lead.vehicle.model} 
                      />
                    ) : (
                      <Car size={16} className="absolute inset-0 m-auto text-white/5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-[11px] truncate">{lead.vehicle.year} {lead.vehicle.make}</h5>
                    <p className="text-[10px] text-platinum-dim truncate">{lead.vehicle.model}</p>
                    <p className="text-[10px] font-bold text-platinum mt-1">${Number(lead.vehicle.price).toLocaleString()}</p>
                  </div>
                </div>
                <Link 
                  href={`/vehicle/${lead.vehicle.id}`} 
                  className="flex items-center justify-center gap-2 w-full py-2 bg-platinum/5 hover:bg-white hover:text-black transition-all text-[9px] font-black uppercase tracking-widest"
                >
                  View Asset <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
