import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsModal from './SettingsModal'

describe('SettingsModal', () => {
  const defaultSettings = {
    notifyDaysBefore: 3,
  }
  const defaultProps = {
    settings: defaultSettings,
    onSave: vi.fn(),
    onClose: vi.fn(),
  }

  test('ダイアログが表示される', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('通知日数の入力フィールドがある', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByLabelText(/通知日数/)).toBeInTheDocument()
  })

  test('現在の設定値が初期値として表示される', () => {
    const settings = { notifyDaysBefore: 5 }
    render(<SettingsModal {...defaultProps} settings={settings} />)
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })

  test('保存ボタンクリックでonSaveが新しい設定で呼ばれる', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<SettingsModal {...defaultProps} onSave={onSave} />)

    const notifyInput = screen.getByLabelText(/通知日数/)
    await user.clear(notifyInput)
    await user.type(notifyInput, '7')

    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        notifyDaysBefore: 7,
      })
    )
  })

  test('キャンセルボタンでonCloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<SettingsModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onClose).toHaveBeenCalled()
  })
})
