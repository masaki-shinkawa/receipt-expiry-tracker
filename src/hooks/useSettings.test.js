import { renderHook, act } from '@testing-library/react'
import { useSettings } from './useSettings'

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('デフォルト設定を返す', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual({
      gasUrl: '',
      notifyDaysBefore: 3,
    })
  })

  test('localStorageから設定を読み込む', () => {
    localStorage.setItem(
      'receipt_tracker_settings',
      JSON.stringify({ gasUrl: 'https://example.com', notifyDaysBefore: 5 })
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.gasUrl).toBe('https://example.com')
    expect(result.current.settings.notifyDaysBefore).toBe(5)
  })

  test('saveSettingsでlocalStorageに永続化される', () => {
    const { result } = renderHook(() => useSettings())
    act(() => {
      result.current.saveSettings({
        gasUrl: 'https://gas.example.com',
        notifyDaysBefore: 7,
      })
    })
    expect(result.current.settings.gasUrl).toBe('https://gas.example.com')
    const saved = JSON.parse(localStorage.getItem('receipt_tracker_settings'))
    expect(saved.gasUrl).toBe('https://gas.example.com')
    expect(saved.notifyDaysBefore).toBe(7)
  })

  test('部分的な保存データにデフォルト値をマージする', () => {
    localStorage.setItem(
      'receipt_tracker_settings',
      JSON.stringify({ gasUrl: 'https://example.com' })
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.gasUrl).toBe('https://example.com')
    expect(result.current.settings.notifyDaysBefore).toBe(3)
  })
})
