"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, X, Trash2, CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteVehicle, updateVehicle, type VehicleInput } from '@/lib/supabase/rpc'

const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Porsche'
]

const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Hatchback']
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic']
const CONDITIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']



export default function EditListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [formData, setFormData] = useState<{
    make: string
    model: string
    year: number
    trim: string
    body_type: string
    mileage: string
    condition: VehicleInput['condition']
    fuel_type: string
    transmission: string
    drivetrain: string
    exterior_color: string
    interior_color: string
    vin: string
    title_status: VehicleInput['title_status']
    accidents: VehicleInput['accidents']
    description: string
    features: string[]
    price: string
    pricing_strategy: string
    contact_method: string
    show_phone: boolean
    status: VehicleInput['status']
    is_premium: boolean
  }>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    body_type: '',
    mileage: '',
    condition: 'Good',
    fuel_type: '',
    transmission: '',
    drivetrain: '',
    exterior_color: '',
    interior_color: '',
    vin: '',
    title_status: 'Clean',
    accidents: 'None',
    description: '',
    features: [] as string[],
    price: '',
    pricing_strategy: 'Negotiable',
    contact_method: 'In-built Messenger',
    show_phone: false,
    status: 'active',
    is_premium: false,
  })

  const loadVehicle = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !vehicle) {
        toast({
          variant: "destructive",
          title: "Vehicle Not Found",
          description: "Could not find the listing you want to edit.",
        })
        router.push('/dashboard')
        return
      }

      if (vehicle.seller_id !== user.id) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You can only edit your own listings.",
        })
        router.push('/dashboard')
        return
      }

      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        trim: vehicle.trim || '',
        body_type: vehicle.body_type || '',
        mileage: vehicle.mileage.toString(),
        condition: vehicle.condition,
        fuel_type: vehicle.fuel_type || '',
        transmission: vehicle.transmission || '',
        drivetrain: vehicle.drivetrain || '',
        exterior_color: vehicle.exterior_color || '',
        interior_color: vehicle.interior_color || '',
        vin: vehicle.vin || '',
        title_status: vehicle.title_status,
        accidents: vehicle.accidents,
        description: vehicle.description || '',
        features: vehicle.features || [],
        price: vehicle.price.toString(),
        pricing_strategy: vehicle.pricing_strategy || 'Negotiable',
        contact_method: vehicle.contact_method || 'In-built Messenger',
        show_phone: vehicle.show_phone || false,
        status: vehicle.status,
        is_premium: vehicle.is_premium || false,
      })
      setExistingImages(vehicle.images || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      router.push('/dashboard')
    }
  }, [id, supabase, router, toast])

  useEffect(() => {
    loadVehicle()
  }, [loadVehicle])

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const added = Array.from(e.target.files)
      if (existingImages.length + newImages.length + added.length > 40) {
        toast({
          variant: "destructive",
          title: "Too Many Images",
          description: "Maximum 40 images allowed.",
        })
        return
      }
      setNewImages(prev => [...prev, ...added])
    }
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(i => i !== url))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload new images
      const uploadedUrls: string[] = []
      for (const file of newImages) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('vehicle-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      const finalImages = [...existingImages, ...uploadedUrls]

      await updateVehicle(supabase, id as string, {
        ...formData,
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage),
        images: finalImages,
        is_premium: formData.is_premium,
      })

      toast({
        variant: "success",
        title: "Listing Updated",
        description: "Your changes have been saved successfully.",
      })
      router.push(`/vehicle/${id}`)
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAsSold = async () => {
    setSaving(true)
    try {
      await updateVehicle(supabase, id as string, { status: 'sold' })
      toast({
        variant: "success",
        title: "Vehicle Sold!",
        description: "Congratulations on your sale!",
      })
      router.push(`/vehicle/${id}`)
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return
    
    setSaving(true)
    try {
      await deleteVehicle(supabase, id as string)
      toast({
        variant: "success",
        title: "Listing Deleted",
        description: "Your vehicle has been removed.",
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-platinum" />
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Year *</label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateField('year', parseInt(e.target.value))}
                  min={1980}
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="make-trigger" id="make-label" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Make *</label>
                <Select value={formData.make} onValueChange={(v) => updateField('make', v)}>
                  <SelectTrigger id="make-trigger" aria-labelledby="make-label">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_MAKES.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Model *</label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="e.g., Camry"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="trim" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Trim</label>
                <Input
                  id="trim"
                  value={formData.trim}
                  onChange={(e) => updateField('trim', e.target.value)}
                  placeholder="e.g., XLE, Sport"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="body_type-trigger" id="body_type-label" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Body Type</label>
                <Select value={formData.body_type} onValueChange={(v) => updateField('body_type', v)}>
                  <SelectTrigger id="body_type-trigger" aria-labelledby="body_type-label">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="mileage" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Mileage (km) *</label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => updateField('mileage', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="condition-trigger" id="condition-label" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Condition *</label>
                <Select value={formData.condition} onValueChange={(v) => updateField('condition', v as VehicleInput['condition'])}>
                  <SelectTrigger id="condition-trigger" aria-labelledby="condition-label"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(cond => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="fuel_type-trigger" id="fuel_type-label" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Fuel Type</label>
                <Select value={formData.fuel_type} onValueChange={(v) => updateField('fuel_type', v)}>
                  <SelectTrigger id="fuel_type-trigger" aria-labelledby="fuel_type-label"><SelectValue placeholder="Select fuel" /></SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="transmission-trigger" id="transmission-label" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Transmission</label>
                <Select value={formData.transmission} onValueChange={(v) => updateField('transmission', v)}>
                  <SelectTrigger id="transmission-trigger" aria-labelledby="transmission-label"><SelectValue placeholder="Select transmission" /></SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map(trans => (
                      <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Images & Description</h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground block mb-4">Photos (Max 40)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((url, i) => (
                    <div key={`exist-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={url} fill className="object-cover" alt="Gallery" />
                      <button 
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 bg-destructive p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {/* New Images */}
                  {newImages.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-platinum border-dashed">
                      <Image src={URL.createObjectURL(file)} fill className="object-cover opacity-60" alt="New" unoptimized />
                      <button 
                        onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 bg-destructive p-1 rounded-full"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {/* Upload Button */}
                  {(existingImages.length + newImages.length < 40) && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-platinum/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Add</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Narrative Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full min-h-[150px] rounded-xl border border-input bg-card px-4 py-3 text-sm focus:ring-2 focus:ring-platinum/20"
                  placeholder="Describe your vehicle's condition, history, and key features..."
                  title="Narrative Description"
                />
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-bold">Pricing & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Price ($) *</label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Premium Status</label>
                <div className="p-4 rounded-xl bg-platinum/5 border border-platinum/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold uppercase tracking-widest text-xs">Featured Listing</span>
                    <p className="text-[10px] text-muted-foreground">Premium listings appear on the homepage</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_premium}
                      onChange={(e) => updateField('is_premium', e.target.checked)}
                      className="sr-only peer" 
                      title="Toggle Premium Status"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-platinum after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-platinum/40"></div>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Current Status</label>
                <div className="p-4 rounded-xl bg-platinum/5 border border-platinum/20 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-widest text-xs">{formData.status}</span>
                  {formData.status !== 'sold' && (
                    <Button variant="outline" size="sm" onClick={handleMarkAsSold} disabled={saving}>
                      Mark as Sold
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 mt-12">
              <h4 className="font-bold text-destructive text-sm uppercase tracking-widest mb-2">Danger Zone</h4>
              <p className="text-xs text-muted-foreground mb-4">Deleting this listing will remove it from search results and archive all data.</p>
              <Button variant="destructive" className="w-full md:w-auto" onClick={handleDelete} disabled={saving}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Permanentely
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen max-w-4xl">
      <Card className="animate-fade-up overflow-hidden">
        <div className="h-1 bg-platinum/10 w-full">
          <div 
            className={`h-full bg-platinum transition-all duration-500 ${
              step === 1 ? 'w-1/4' : 
              step === 2 ? 'w-2/4' : 
              step === 3 ? 'w-3/4' : 
              'w-full'
            }`} 
          />
        </div>
        <CardContent className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
                Editing Listing • Step {step} of 4
              </span>
              <h2 className="text-3xl font-bold mt-2 tracking-tight">Modify Inventory</h2>
            </div>
          </div>

          {renderStep()}

          <div className="mt-16 flex justify-between gap-4">
            <Button
              onClick={() => setStep(s => Math.max(s - 1, 1))}
              disabled={step === 1 || saving}
              variant="outline"
              className="h-12 px-8 font-bold uppercase tracking-widest text-xs"
            >
              Back
            </Button>

            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)} variant="platinum" className="h-12 px-8 font-bold uppercase tracking-widest text-xs">
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} variant="platinum" className="h-12 px-8 font-bold uppercase tracking-widest text-xs">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
