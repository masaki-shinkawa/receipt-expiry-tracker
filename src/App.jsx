import { useState } from 'react'
import ProductList from './components/ProductList.jsx'
import Scanner from './components/Scanner.jsx'
import ManualAddModal from './components/ManualAddModal.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import BottomNav from './components/BottomNav.jsx'
import { useProducts } from './hooks/useProducts.js'
import { useSettings } from './hooks/useSettings.js'

export default function App() {
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'scan'
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { products, addProducts, updateProduct, deleteProduct, loading } = useProducts()
  const { settings, saveSettings } = useSettings()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧾</span>
          <h1 className="text-lg font-bold text-gray-900">賞味期限トラッカー</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="設定"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'list' && (
          <ProductList
            products={products}
            loading={loading}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            onManualAdd={() => setShowManualAdd(true)}
          />
        )}
        {activeTab === 'scan' && (
          <Scanner
            gasUrl={settings.gasUrl}
            onProductsScanned={(newProducts) => {
              addProducts(newProducts)
              setActiveTab('list')
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      {showManualAdd && (
        <ManualAddModal
          onAdd={(product) => {
            addProducts([product])
            setShowManualAdd(false)
          }}
          onClose={() => setShowManualAdd(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => {
            saveSettings(s)
            setShowSettings(false)
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
