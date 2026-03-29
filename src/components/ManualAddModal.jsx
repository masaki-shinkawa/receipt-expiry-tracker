import { useState } from 'react'

const DEFAULT_FORM = {
  name: '',
  expiryDate: '',
  expiryType: '賞味期限',
  storeName: '',
  purchaseDate: '',
  price: '',
  quantity: 1,
  category: '',
  note: '',
}

export default function ManualAddModal({ onAdd, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onAdd({
      name: form.name,
      expiryDate: form.expiryDate,
      expiryType: form.expiryType,
      storeName: form.storeName,
      purchaseDate: form.purchaseDate,
      price: form.price === '' ? null : Number(form.price),
      quantity: Number(form.quantity),
      category: form.category,
      note: form.note,
      expirySource: 'manual',
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="商品を手動追加"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">商品を手動追加</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label
            htmlFor="name"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            商品名 <span className="text-red-500">*</span>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="例：牛乳"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label
            htmlFor="expiryDate"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            賞味/消費期限 <span className="text-red-500">*</span>
            <input
              id="expiryDate"
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label
            htmlFor="expiryType"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            種別
            <select
              id="expiryType"
              name="expiryType"
              value={form.expiryType}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="賞味期限">賞味期限</option>
              <option value="消費期限">消費期限</option>
            </select>
          </label>

          <label
            htmlFor="storeName"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            店舗名
            <input
              id="storeName"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              placeholder="例：スーパーマルエツ"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label
            htmlFor="purchaseDate"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            購入日
            <input
              id="purchaseDate"
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label
            htmlFor="note"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            メモ
            <input
              id="note"
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
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
