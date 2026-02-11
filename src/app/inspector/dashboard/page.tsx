"use client"

import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileCheck, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function InspectorDashboardPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [inspectionData, setInspectionData] = useState({
    mechanical_rating: '',
    exterior_rating: '',
    interior_rating: '',
    safety_rating: '',
    overall_condition: '',
    report_summary: '',
    issues_found: '',
    recommendations: '',
    estimated_repair_cost: '',
    report_url: '',
    is_public: true
  })

  const loadVehicles = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is inspector
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'inspector' && profile?.role !== 'admin') {
      router.push('/')
      return
    }

    // Load all active vehicles
    const { data } = await supabase
      .from('vehicles')
      .select('id, year, make, model, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setVehicles(data)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  async function submitInspection() {
    if (!selectedVehicle) return

    setSubmitting(true)

    const issues = inspectionData.issues_found
      ? inspectionData.issues_found.split('\n').filter(i => i.trim())
      : []

    const recommendations = inspectionData.recommendations
      ? inspectionData.recommendations.split('\n').filter(r => r.trim())
      : []

    const { error } = await supabase.rpc('submit_inspection', {
      p_vehicle_id: selectedVehicle,
      p_inspection_data: {
        mechanical_rating: inspectionData.mechanical_rating ? parseInt(inspectionData.mechanical_rating) : null,
        exterior_rating: inspectionData.exterior_rating ? parseInt(inspectionData.exterior_rating) : null,
        interior_rating: inspectionData.interior_rating ? parseInt(inspectionData.interior_rating) : null,
        safety_rating: inspectionData.safety_rating ? parseInt(inspectionData.safety_rating) : null,
        overall_condition: inspectionData.overall_condition,
        report_summary: inspectionData.report_summary,
        issues_found: issues,
        recommendations: recommendations,
        estimated_repair_cost: inspectionData.estimated_repair_cost ? parseFloat(inspectionData.estimated_repair_cost) : null,
        report_url: inspectionData.report_url || null,
        is_public: inspectionData.is_public
      }
    })

    if (!error) {
      setSelectedVehicle(null)
      // Reset form
      setInspectionData({
        mechanical_rating: '',
        exterior_rating: '',
        interior_rating: '',
        safety_rating: '',
        overall_condition: '',
        report_summary: '',
        issues_found: '',
        recommendations: '',
        estimated_repair_cost: '',
        report_url: '',
        is_public: true
      })
      
      // Refresh list
      setLoading(true)
      await loadVehicles()
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            Inspector Dashboard
          </h1>
          <p className="text-white/60">Submit professional vehicle inspection reports</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <FileCheck size={20} />
            New Inspection Report
          </h2>

          <div className="space-y-6">
            {/* Vehicle Selection */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Select Vehicle
              </Label>
              <Select value={selectedVehicle || undefined} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a vehicle to inspect" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                  Mechanical (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={inspectionData.mechanical_rating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInspectionData({ ...inspectionData, mechanical_rating: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                  Exterior (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={inspectionData.exterior_rating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInspectionData({ ...inspectionData, exterior_rating: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                  Interior (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={inspectionData.interior_rating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInspectionData({ ...inspectionData, interior_rating: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                  Safety (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={inspectionData.safety_rating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInspectionData({ ...inspectionData, safety_rating: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Overall Condition */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Overall Condition
              </Label>
              <Select
                value={inspectionData.overall_condition}
                onValueChange={(value) => setInspectionData({ ...inspectionData, overall_condition: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Summary */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Report Summary
              </Label>
              <Textarea
                value={inspectionData.report_summary}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInspectionData({ ...inspectionData, report_summary: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="Provide a brief summary of the inspection..."
              />
            </div>

            {/* Issues Found */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Issues Found (one per line)
              </Label>
              <Textarea
                value={inspectionData.issues_found}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInspectionData({ ...inspectionData, issues_found: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="List any issues found during inspection..."
              />
            </div>

            {/* Recommendations */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Recommendations (one per line)
              </Label>
              <Textarea
                value={inspectionData.recommendations}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInspectionData({ ...inspectionData, recommendations: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="Provide recommendations for the buyer..."
              />
            </div>

            {/* Repair Cost */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Estimated Repair Cost ($)
              </Label>
              <Input
                type="number"
                value={inspectionData.estimated_repair_cost}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInspectionData({ ...inspectionData, estimated_repair_cost: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="0"
              />
            </div>

            {/* Report URL */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Full Report URL (optional)
              </Label>
              <Input
                type="url"
                value={inspectionData.report_url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInspectionData({ ...inspectionData, report_url: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://..."
              />
            </div>

            {/* Visibility */}
            <div>
              <Label className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
                Report Visibility
              </Label>
              <Select
                value={inspectionData.is_public ? 'public' : 'private'}
                onValueChange={(value) => setInspectionData({ ...inspectionData, is_public: value === 'public' })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (visible to all)</SelectItem>
                  <SelectItem value="private">Private (owner only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitInspection}
              disabled={!selectedVehicle || submitting}
              className="w-full bg-platinum text-black hover:bg-platinum/90 font-black"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Submit Inspection Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
