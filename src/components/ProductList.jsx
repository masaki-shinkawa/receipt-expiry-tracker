import { useState } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'

function getExpiryStatus(expiryDate) {
  const days = differenceInCalendarDays(parseISO(expiryDate), new Date())
  if (days <= 0) return { label: '期限切れ', color: 'red', days }
  if (days <= 3) return { label: '要注意', color: 'orange', days }
  if (days <= 7) return { label: '注意', color: 'yellow', days }
  return { label: '安全', color: 'green', days }
}

const STATUS_COLORS = {
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
}

const FILTERS = [
  { id: 'all', label: 'すべて' },
  { id: '期限切れ', label: '期限切れ' },
  { id: '要注意', label: '要注意' },
  { id: '注意', label: '注意' },
  { id: '安全', label: '安全' },
]

function EditModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    name: product.name,
    expiryDate: product.expiryDate,
    expiryType: product.expiryType || '賞味期限',
    storeName: product.storeName || '',
    purchaseDate: product.purchaseDate || '',
    price: product.price ?? '',
    quantity: product.quantity ?? 1,
    category: product.category || '',
    note: product.note || '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">商品を編集</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            商品名 <span className="text-red-500">*</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            賞味/消費期限 <span className="text-red-500">*</span>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            種別
            <select
              name="expiryType"
              value={form.expiryType}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="賞味期限">賞味期限</option>
              <option value="消費期限">消費期限</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            店舗名
            <input
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            メモ
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              キャンセル
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductList({
  products,
  loading,
  onUpdate,
  onDelete,
  onManualAdd,
}) {
  const [filter, setFilter] = useState('all')
  const [editingProduct, setEditingProduct] = useState(null)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div
          role="status"
          className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
          aria-label="読み込み中"
        />
      </div>
    )
  }

  const filtered =
    filter === 'all'
      ? products
      : products.filter((p) => getExpiryStatus(p.expiryDate).label === filter)

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto bg-white border-b border-gray-100">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 && products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-16 text-gray-500">
            <span className="text-5xl">🛒</span>
            <p className="text-sm">商品がありません</p>
            <button onClick={onManualAdd} className="btn-primary">
              手動で追加
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-500 pt-8">
            該当する商品がありません
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((product) => {
              const status = getExpiryStatus(product.expiryDate)
              return (
                <li key={product.id} className="card flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      {product.storeName && (
                        <p className="text-xs text-gray-500">
                          {product.storeName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status.color]}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>{product.expiryType || '賞味期限'}：</span>
                      <span>{product.expiryDate}</span>
                      <span className="ml-1 text-xs text-gray-400">
                        {status.days > 0
                          ? `（あと${status.days}日）`
                          : `（${Math.abs(status.days)}日超過）`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-xs px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
                        aria-label={`${product.name}を編集`}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50"
                        aria-label={`${product.name}を削除`}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* FAB - manual add */}
      {products.length > 0 && (
        <button
          onClick={onManualAdd}
          className="fixed bottom-20 right-4 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-700 transition-colors"
          aria-label="手動で追加"
        >
          +
        </button>
      )}

      {/* Edit modal */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onSave={(updates) => {
            onUpdate(editingProduct.id, updates)
            setEditingProduct(null)
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
