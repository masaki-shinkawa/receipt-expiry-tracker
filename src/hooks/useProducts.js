import { useState, useEffect } from 'react'
import { useSettings } from './useSettings.js'

const LOCAL_KEY = 'receipt_tracker_products'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const { settings } = useSettings()

  // Load from GAS spreadsheet on mount, fallback to localStorage
  useEffect(() => {
    if (settings.gasUrl) {
      fetchFromGas(settings.gasUrl)
    } else {
      const saved = localStorage.getItem(LOCAL_KEY)
      if (saved) setProducts(JSON.parse(saved))
    }
  }, [settings.gasUrl])

  // Always keep localStorage in sync as offline cache
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(products))
  }, [products])

  async function fetchFromGas(gasUrl) {
    setLoading(true)
    try {
      const res = await fetch(`${gasUrl}?action=getProducts`)
      if (!res.ok) throw new Error('GAS fetch failed')
      const data = await res.json()
      if (data.products) setProducts(data.products)
    } catch {
      // Fall back to localStorage cache
      const saved = localStorage.getItem(LOCAL_KEY)
      if (saved) setProducts(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  async function addProducts(newItems) {
    const itemsWithId = newItems.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || new Date().toISOString(),
    }))
    setProducts((prev) => [...itemsWithId, ...prev])

    if (settings.gasUrl) {
      try {
        await fetch(settings.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addProducts', products: itemsWithId }),
        })
      } catch {
        // Optimistic update already applied; GAS sync is best-effort
      }
    }
  }

  async function updateProduct(id, updates) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )

    if (settings.gasUrl) {
      try {
        await fetch(settings.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateProduct', id, updates }),
        })
      } catch {
        // Optimistic update already applied
      }
    }
  }

  async function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))

    if (settings.gasUrl) {
      try {
        await fetch(settings.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteProduct', id }),
        })
      } catch {
        // Optimistic update already applied
      }
    }
  }

  return { products, addProducts, updateProduct, deleteProduct, loading }
}
