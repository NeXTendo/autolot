"use client"

import { 
  Wind, 
  Shield, 
  Disc, 
  Settings, 
  Navigation, 
  Camera, 
  Bluetooth, 
  Thermometer, 
  Gauge, 
  Key, 
  Music, 
  ParkingCircle, 
  AlertTriangle, 
  Eye, 
  Smartphone, 
  Sun,
  User,
  Coffee,
  Lock,
  Zap,
  Waves
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VehicleFeaturesProps {
  features: string[]
}

const MASTER_FEATURES = [
  { name: 'A/C', icon: Wind },
  { name: 'Airbags', icon: Shield },
  { name: 'ABS', icon: Disc },
  { name: 'Power Steering', icon: Gauge },
  { name: 'Navigation System', icon: Navigation },
  { name: 'Backup Camera', icon: Camera },
  { name: 'Bluetooth', icon: Bluetooth },
  { name: 'Leather Seats', icon: User },
  { name: 'Heated Seats', icon: Thermometer },
  { name: 'Sunroof', icon: Sun },
  { name: 'Keyless Entry', icon: Key },
  { name: 'Premium Sound System', icon: Music },
  { name: 'Parking Sensors', icon: ParkingCircle },
  { name: 'Lane Departure Warning', icon: AlertTriangle },
  { name: 'Blind Spot Monitoring', icon: Eye },
  { name: 'Apple CarPlay', icon: Smartphone },
  { name: 'Android Auto', icon: Zap },
  { name: 'Power Windows', icon: Waves },
  { name: 'Power Locks', icon: Lock },
  { name: 'Cruise Control', icon: Settings },
]

export function VehicleFeatures({ features }: VehicleFeaturesProps) {
  // Normalize features from DB to match master list (case-insensitive)
  const normalizedFeatures = features.map(f => f.toLowerCase().trim())

  return (
    <div className="space-y-8">
      <h4 className="font-bold uppercase text-lg lg:text-xs tracking-[0.2em] pl-3 border-l-2 border-platinum">
        Equipment & Features
      </h4>
      
      <div className="flex flex-wrap gap-2 md:gap-3">
        {MASTER_FEATURES.map((feature, idx) => {
          const isAvailable = normalizedFeatures.some(f => f === feature.name.toLowerCase())
          
          return (
            <div 
              key={idx} 
              className={cn(
                "w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center p-2 rounded-xl transition-all border",
                isAvailable 
                  ? "bg-platinum/10 border-platinum/40 shadow-[0_0_15px_rgba(229,229,229,0.1)]" 
                  : "bg-white/5 border-white/10 opacity-30 grayscale"
              )}
            >
              <feature.icon className={cn(
                "w-6 h-6 md:w-8 md:h-8 mb-2",
                isAvailable ? "text-platinum shadow-[0_0_10px_rgba(229,229,229,0.5)]" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[8px] md:text-[10px] text-center font-bold uppercase tracking-tighter leading-tight line-clamp-2",
                isAvailable ? "text-platinum" : "text-muted-foreground/60"
              )}>
                {feature.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
