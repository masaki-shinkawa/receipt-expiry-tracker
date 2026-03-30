import { useState, useEffect } from 'react'

const LOCAL_KEY = 'receipt_tracker_products'
const GAS_URL = import.meta.env.VITE_GAS_URL

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  // Load from GAS spreadsheet on mount, fallback to localStorage
  useEffect(() => {
    if (GAS_URL) {
      fetchFromGas()
    } else {
      const saved = localStorage.getItem(LOCAL_KEY)
      if (saved) setProducts(JSON.parse(saved))
    }
  }, [])

  // Always keep localStorage in sync as offline cache
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(products))
  }, [products])

  async function fetchFromGas() {
    setLoading(true)
    try {
      const res = await fetch(`${GAS_URL}?action=getProducts`, {
        redirect: 'follow',
      })
      if (!res.ok) throw new Error('GAS fetch failed')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) setProducts(data.data)
    } catch (e) {
      console.error('[useProducts] GAS fetch failed:', e)
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

    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addProducts',
            products: itemsWithId,
          }),
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

    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          redirect: 'follow',
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

    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          redirect: 'follow',
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
