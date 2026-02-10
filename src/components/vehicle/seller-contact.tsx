"use client"

import { Phone, Mail, MessageCircle, MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Star } from "lucide-react"
import Link from "next/link"
import { SellerReviewsDialog } from "./seller-reviews-dialog"

interface SellerContactProps {
  seller: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  vehicle: {
    make: string
    model: string
    id: string
  }
  isOwner?: boolean
}

export function SellerContact({ seller, vehicle, isOwner }: SellerContactProps) {
  const whatsappNumber = seller.phone?.replace(/\D/g, '')
  const whatsappMsg = encodeURIComponent(`Hi ${seller.name}, I'm interested in the ${vehicle.make} ${vehicle.model} (ID: ${vehicle.id}) on Platinum Auto.`)
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`
  
  const emailSubject = encodeURIComponent(`Inquiry: ${vehicle.make} ${vehicle.model}`)
  const emailBody = encodeURIComponent(`Hi ${seller.name},\n\nI saw your ${vehicle.make} ${vehicle.model} on Platinum Auto and I'm interested in learning more.\n\nVehicle Link: ${typeof window !== 'undefined' ? window.location.href : ''}`)
  const emailUrl = `mailto:${seller.email}?subject=${emailSubject}&body=${emailBody}`

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex gap-4 items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-platinum/10 border border-platinum/20 flex items-center justify-center font-bold text-platinum">
            <User className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-0.5">
              {isOwner ? "Your Listing" : "Listed By"}
            </div>
            <div className="text-lg font-bold truncate tracking-tight text-white mb-1" title={seller.name || 'Authorized Dealer'}>
              @{seller.name?.toLowerCase().replace(/\s+/g, '_') || 'dealer'}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Link 
                href={`/seller/${seller.id}`}
                className="text-[10px] text-platinum hover:text-platinum/80 flex items-center gap-1 transition-colors uppercase tracking-widest font-bold"
              >
                Seller Profile <ExternalLink className="w-2.5 h-2.5" />
              </Link>
              <div className="w-px h-3 bg-platinum/20"></div>
              <SellerReviewsDialog 
                sellerId={seller.id} 
                sellerName={seller.name} 
                trigger={
                  <button className="text-[10px] text-platinum hover:text-platinum/80 flex items-center gap-1 transition-colors uppercase tracking-widest font-bold cursor-pointer">
                    View Reviews <Star size={10} className="fill-platinum" />
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {!isOwner && (
          <div className="grid grid-cols-1 gap-3 mb-6">
            {seller.phone && (
              <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
                <a href={`tel:${seller.phone}`}>
                  <Phone className="w-4 h-4 text-platinum" />
                  <span>Call {seller.phone}</span>
                </a>
              </Button>
            )}
            
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <a href={emailUrl}>
                <Mail className="w-4 h-4 text-platinum" />
                <span>Email Seller</span>
              </a>
            </Button>

            {seller.phone && (
              <Button variant="platinum" className="w-full justify-start gap-3 h-12" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </Button>
            )}
          </div>
        )}

        <div className="flex items-start gap-3 pt-6 border-t border-border/40">
          <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-muted-foreground uppercase">Location</div>
            <div className="text-sm font-medium">Lusaka, Zambia</div>
            <p className="text-[10px] text-muted-foreground mt-1">Exact location provided upon viewing request</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
