import { useState } from 'react'

const LOCAL_KEY = 'receipt_tracker_settings'
const DEFAULT_SETTINGS = {
  notifyDaysBefore: 3,
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY)
      return saved
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  function saveSettings(newSettings) {
    setSettings(newSettings)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newSettings))
  }

  return { settings, saveSettings }
}
