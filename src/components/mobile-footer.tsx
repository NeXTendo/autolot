"use client"

import { CurrencySelector } from "./currency-selector"
import { SettingsModal } from "./settings-modal"

export function MobileFooter() {
  return (
    <div className="md:hidden border-t border-border/40 bg-background py-4">
      <div className="container">
        <div className="flex items-center justify-center gap-4">
          <CurrencySelector />
          <SettingsModal />
        </div>
      </div>
    </div>
  )
}
