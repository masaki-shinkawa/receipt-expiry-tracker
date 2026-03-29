import { renderHook, act } from '@testing-library/react'
import { useSettings } from './useSettings'

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('デフォルト設定を返す', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual({
      notifyDaysBefore: 3,
    })
  })

  test('localStorageから設定を読み込む', () => {
    localStorage.setItem(
      'receipt_tracker_settings',
      JSON.stringify({ notifyDaysBefore: 5 })
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.notifyDaysBefore).toBe(5)
  })

  test('saveSettingsでlocalStorageに永続化される', () => {
    const { result } = renderHook(() => useSettings())
    act(() => {
      result.current.saveSettings({ notifyDaysBefore: 7 })
    })
    expect(result.current.settings.notifyDaysBefore).toBe(7)
    const saved = JSON.parse(localStorage.getItem('receipt_tracker_settings'))
    expect(saved.notifyDaysBefore).toBe(7)
  })

  test('部分的な保存データにデフォルト値をマージする', () => {
    localStorage.setItem(
      'receipt_tracker_settings',
      JSON.stringify({ notifyDaysBefore: 5 })
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.notifyDaysBefore).toBe(5)
  })
})
