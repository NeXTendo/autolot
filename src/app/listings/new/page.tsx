"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Porsche'
]

const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Hatchback']
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic']
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD']
const CONDITIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] as const
const TITLE_STATUSES = ['Clean', 'Salvage', 'Rebuilt'] as const
const ACCIDENT_HISTORIES = ['None', 'Minor', 'Moderate', 'Major'] as const

type Condition = typeof CONDITIONS[number]
type TitleStatus = typeof TITLE_STATUSES[number]
type AccidentHistory = typeof ACCIDENT_HISTORIES[number]

const COMMON_FEATURES = [
  'Leather Seats', 'Sunroof', 'Navigation System', 'Backup Camera',
  'Bluetooth', 'Heated Seats', 'Cruise Control', 'Keyless Entry',
  'Premium Sound System', 'Parking Sensors', 'Lane Departure Warning',
  'Blind Spot Monitoring', 'Apple CarPlay', 'Android Auto'
]

interface FormData {
  make: string
  model: string
  year: number
  trim: string
  body_type: string
  mileage: string
  condition: Condition
  fuel_type: string
  transmission: string
  drivetrain: string
  exterior_color: string
  interior_color: string
  vin: string
  title_status: TitleStatus
  accidents: AccidentHistory
  description: string
  features: string[]
  price: string
  pricing_strategy: string
  contact_method: string
  show_phone: boolean
  is_premium: boolean
}

export default function ListingWizard() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingLimits, setCheckingLimits] = useState(true)
  const [canCreate, setCanCreate] = useState(true)
  const [limitInfo, setLimitInfo] = useState({ count: 0, limit: 0 })
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    body_type: '',
    // Specifications
    mileage: '',
    condition: 'Good',
    fuel_type: '',
    transmission: '',
    drivetrain: '',
    exterior_color: '',
    interior_color: '',
    // History & Documentation
    vin: '',
    title_status: 'Clean',
    accidents: 'None',
    // Description & Features
    description: '',
    features: [],
    // Pricing
    price: '',
    pricing_strategy: 'Negotiable',
    contact_method: 'In-built Messenger',
    show_phone: false,
    is_premium: false,
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function checkLimits() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { canCreateListing, getUserListingCount, getUserListingLimit } = await import('@/lib/supabase/rpc')
        
        const [allowed, count, limit] = await Promise.all([
          canCreateListing(supabase),
          getUserListingCount(supabase, user.id),
          getUserListingLimit(supabase, user.id)
        ])

        setCanCreate(allowed)
        setLimitInfo({ count, limit })
      } catch (error) {
        console.error('Error checking limits:', error)
      } finally {
        setCheckingLimits(false)
      }
    }

    checkLimits()
  }, [supabase, router])

  if (checkingLimits) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-platinum" size={48} />
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="container py-12 md:py-24 min-h-screen max-w-4xl flex items-center justify-center">
        <Card className="w-full max-w-lg border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Listing Limit Reached</h2>
            <p className="text-muted-foreground mb-6">
              You have reached your limit of {limitInfo.limit} active listings. 
              Please upgrade your account or archive existing listings to create a new one.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild variant="platinum" className="w-full">
                <a href="/dashboard">Manage Listings</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/pricing">Upgrade Account</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (images.length + newFiles.length > 40) {
        toast({
          variant: "destructive",
          title: "Too Many Images",
          description: "Maximum 40 images allowed.",
        })
        return
      }
      setImages(prev => [...prev, ...newFiles])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)

    // Validation
    if (!formData.make || !formData.model || !formData.price || !formData.mileage) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Please fill in make, model, price, and mileage.",
      })
      setLoading(false)
      return
    }

    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "No Images",
        description: "Please upload at least one image of your vehicle.",
      })
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "Please sign in to create a listing.",
        })
        router.push('/login')
        return
      }

      // Upload images
      const imageUrls: string[] = []
      for (const file of images) {
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

        imageUrls.push(publicUrl)
      }

      // Create listing using RPC function
      const { createVehicle } = await import('@/lib/supabase/rpc')
      
      await createVehicle(supabase, {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        trim: formData.trim || undefined,
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage),
        condition: formData.condition,
        body_type: formData.body_type || undefined,
        fuel_type: formData.fuel_type || undefined,
        transmission: formData.transmission || undefined,
        drivetrain: formData.drivetrain || undefined,
        exterior_color: formData.exterior_color || undefined,
        interior_color: formData.interior_color || undefined,
        vin: formData.vin || undefined,
        images: imageUrls,
        description: formData.description || undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        title_status: formData.title_status,
        accidents: formData.accidents,
        contact_method: formData.contact_method,
        pricing_strategy: formData.pricing_strategy,
        show_phone: formData.show_phone,
        is_premium: formData.is_premium,
      })

      toast({
        variant: "success",
        title: "Listing Created!",
        description: "Your vehicle has been listed successfully.",
      })
      router.push('/dashboard')
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Create Listing",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Year *</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateField('year', parseInt(e.target.value))}
                  min={1980}
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Make *</label>
                <Select value={formData.make} onValueChange={(v) => updateField('make', v)}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium">Model *</label>
                <Input
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="e.g., Camry"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trim</label>
                <Input
                  value={formData.trim}
                  onChange={(e) => updateField('trim', e.target.value)}
                  placeholder="e.g., XLE, Sport"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Body Type</label>
                <Select value={formData.body_type} onValueChange={(v) => updateField('body_type', v)}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium">Mileage (km) *</label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => updateField('mileage', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition *</label>
                <Select value={formData.condition} onValueChange={(v) => updateField('condition', v as Condition)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(cond => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Type</label>
                <Select value={formData.fuel_type} onValueChange={(v) => updateField('fuel_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Transmission</label>
                <Select value={formData.transmission} onValueChange={(v) => updateField('transmission', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map(trans => (
                      <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Drivetrain</label>
                <Select value={formData.drivetrain} onValueChange={(v) => updateField('drivetrain', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drivetrain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRIVETRAINS.map(drive => (
                      <SelectItem key={drive} value={drive}>{drive}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exterior Color</label>
                <Input
                  value={formData.exterior_color}
                  onChange={(e) => updateField('exterior_color', e.target.value)}
                  placeholder="e.g., Black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Interior Color</label>
                <Input
                  value={formData.interior_color}
                  onChange={(e) => updateField('interior_color', e.target.value)}
                  placeholder="e.g., Beige"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">History & Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">VIN (Optional)</label>
                <Input
                  value={formData.vin}
                  onChange={(e) => updateField('vin', e.target.value)}
                  placeholder="17-character VIN"
                  maxLength={17}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title Status</label>
                <Select value={formData.title_status} onValueChange={(v) => updateField('title_status', v as TitleStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLE_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Accident History</label>
                <Select value={formData.accidents} onValueChange={(v) => updateField('accidents', v as AccidentHistory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCIDENT_HISTORIES.map(history => (
                      <SelectItem key={history} value={history}>{history}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Description & Features</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Describe your vehicle's condition, history, and unique features..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Images & Pricing</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Images (Max 40) *</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-bold mb-2">Drop Your High-Res Photos</h4>
                <p className="text-sm text-muted-foreground mb-4">Maximum 40 photos. Showcase the details.</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {images.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                      <Image 
                        src={URL.createObjectURL(file)} 
                        className="w-full h-full object-cover" 
                        alt={`Upload ${i + 1}`}
                        fill
                        unoptimized
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        aria-label="Remove image"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="e.g., 25000"
                />
              </div>
              <div className="space-y-2">
                <Select value={formData.pricing_strategy} onValueChange={(v) => updateField('pricing_strategy', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Negotiable">Negotiable</SelectItem>
                    <SelectItem value="Firm">Firm</SelectItem>
                    <SelectItem value="Best Offer">Best Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/5">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-platinum/5 border border-platinum/10">
                <div className="space-y-1">
                  <h4 className="font-bold text-platinum">Premium Marketplace Listing</h4>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Apply the premium option to have your vehicle featured on the global homepage and recommended sections.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_premium}
                    onChange={(e) => updateField('is_premium', e.target.checked)}
                    className="sr-only peer" 
                    title="Toggle Premium Marketplace Listing"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-platinum after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-platinum/40"></div>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen max-w-4xl">
      <Card className="animate-fade-up">
        <CardContent className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Step {step} of 5
              </span>
              <h2 className="text-2xl font-bold mt-1">Create Listing</h2>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    s <= step ? 'bg-[hsl(var(--platinum))]' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </div>

          {renderStep()}

          <div className="mt-12 flex justify-between gap-4">
            <Button
              onClick={() => setStep(s => Math.max(s - 1, 1))}
              disabled={step === 1 || loading}
              variant="outline"
            >
              Back
            </Button>

            {step < 5 ? (
              <Button onClick={() => setStep(s => s + 1)} variant="platinum">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} variant="platinum">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  'Finalize Listing'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
