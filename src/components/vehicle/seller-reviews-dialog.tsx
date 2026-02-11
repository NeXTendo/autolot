"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageCircle, BarChart3, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SellerReviewsDialogProps {
  sellerId: string
  sellerName: string
  trigger?: React.ReactNode
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer: {
    name: string
  } | null
}

export function SellerReviewsDialog({ sellerId, sellerName, trigger }: SellerReviewsDialogProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(name)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data as unknown as Review[])
    }
    setLoading(false)
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }))

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full gap-2 h-12 border-platinum/20 text-platinum hover:bg-platinum/10">
            <Star size={16} /> View Seller Reviews
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
             @{sellerName?.toLowerCase().replace(/\s+/g, '_')}&rsquo;s Reputation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="reviews" className="w-full" onValueChange={(val) => val === 'reviews' && fetchReviews()}>
          <div className="px-6 border-b border-white/5">
            <TabsList className="bg-transparent h-14 w-full justify-start gap-8 p-0">
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-platinum rounded-none h-full px-0 font-black text-[10px] uppercase tracking-widest text-white/40"
              >
                Recent Feedback
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-platinum rounded-none h-full px-0 font-black text-[10px] uppercase tracking-widest text-white/40"
              >
                Reputation Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 max-h-[400px] overflow-y-auto">
            <TabsContent value="reviews" className="mt-0 space-y-6">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-platinum" />
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <User size={14} className="text-white/40" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-white">
                            {review.reviewer?.name || "Anonymous"}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={10} 
                                className={i < review.rating ? "fill-white text-white" : "fill-white/10 text-white/10"} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[12px] text-white/80 leading-relaxed font-medium pl-10 italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <MessageCircle size={32} className="mx-auto text-white/10 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/20">No reviews yet for this seller</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-0 space-y-8">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <div className="text-5xl font-black text-white tabular-nums">{avgRating}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Average Rating</div>
                </div>
                <div className="flex-1 space-y-2">
                  {ratingCounts.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-6">
                         <span className="text-[10px] font-black text-white">{star}</span>
                         <Star size={8} className="fill-white text-white" />
                      </div>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-1000" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] font-black text-white/40 w-4 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-platinum/10 bg-platinum/5 space-y-3">
                <div className="flex items-center gap-2 text-platinum">
                  <BarChart3 size={16} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Collector Insights</span>
                </div>
                <p className="text-[11px] leading-relaxed text-platinum/70 font-medium">
                  This seller has a highly consistent reputation in the marketplace. High sales velocity and positive sentiment are indicators of a reliable collector.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
