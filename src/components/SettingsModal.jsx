import { useState } from 'react'

export default function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({
    gasUrl: settings.gasUrl ?? '',
    notifyDaysBefore: settings.notifyDaysBefore ?? 3,
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      gasUrl: form.gasUrl,
      notifyDaysBefore: Number(form.notifyDaysBefore),
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="設定"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">設定</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label
            htmlFor="gasUrl"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            GAS URL
            <input
              id="gasUrl"
              name="gasUrl"
              type="url"
              value={form.gasUrl}
              onChange={handleChange}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-xs text-gray-400">
              Google Apps Script のデプロイURL（未設定の場合はローカル保存）
            </span>
          </label>

          <label
            htmlFor="notifyDaysBefore"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            通知日数（期限X日前に通知）
            <input
              id="notifyDaysBefore"
              name="notifyDaysBefore"
              type="number"
              min="1"
              max="30"
              value={form.notifyDaysBefore}
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
