"use client"

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useCurrency } from '@/lib/currency/currency-context'
import { Currency, getCurrencyName, getSupportedCurrencies } from '@/lib/currency/exchange-rates'
import { useToast } from '@/hooks/use-toast'

interface UserSettings {
  currency: Currency
  theme: 'dark' | 'light' | 'auto'
  language: 'en' | 'es' | 'fr'
  measurementUnit: 'km' | 'miles'
  notifications: {
    email: boolean
    priceDrops: boolean
    newListings: boolean
  }
}

export function SettingsModal() {
  const [open, setOpen] = useState(false)
  const { currency, setCurrency } = useCurrency()
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<UserSettings>({
    currency: currency,
    theme: 'dark',
    language: 'en',
    measurementUnit: 'km',
    notifications: {
      email: true,
      priceDrops: true,
      newListings: false,
    },
  })

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...settings, ...parsed })
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }, [])

  // Sync currency with context
  useEffect(() => {
    setSettings(prev => ({ ...prev, currency }))
  }, [currency])

  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('user_settings', JSON.stringify(settings))
    
    // Update currency context
    if (settings.currency !== currency) {
      setCurrency(settings.currency)
    }

    toast({
      variant: 'success',
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    })
    
    setOpen(false)
  }

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Customize your AutoLot experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General</h3>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSetting('currency', value as Currency)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getSupportedCurrencies().map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr} - {getCurrencyName(curr)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Prices will be converted to your preferred currency
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => updateSetting('theme', value as 'dark' | 'light' | 'auto')}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurement">Measurement Unit</Label>
              <Select
                value={settings.measurementUnit}
                onValueChange={(value) => updateSetting('measurementUnit', value as 'km' | 'miles')}
              >
                <SelectTrigger id="measurement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers (km)</SelectItem>
                  <SelectItem value="miles">Miles (mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting('language', value as 'en' | 'es' | 'fr')}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Coming soon - Currently English only
              </p>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotification('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="price-drops">Price Drop Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when prices drop on watchlist items
                </p>
              </div>
              <Switch
                id="price-drops"
                checked={settings.notifications.priceDrops}
                onCheckedChange={(checked) => updateNotification('priceDrops', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-listings">New Listings</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about new vehicles matching your preferences
                </p>
              </div>
              <Switch
                id="new-listings"
                checked={settings.notifications.newListings}
                onCheckedChange={(checked) => updateNotification('newListings', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* About */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">About</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>AutoLot v1.0.0</p>
              <p>© 2026 AutoLot. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="platinum" onClick={saveSettings}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
