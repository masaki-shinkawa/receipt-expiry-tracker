import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ManualAddModal from './ManualAddModal'

describe('ManualAddModal', () => {
  const defaultProps = {
    onAdd: vi.fn(),
    onClose: vi.fn(),
  }

  test('ダイアログが表示される', () => {
    render(<ManualAddModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('商品名と賞味期限日の入力フィールドがある', () => {
    render(<ManualAddModal {...defaultProps} />)
    expect(screen.getByRole('textbox', { name: /商品名/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/賞味.消費期限/)).toBeInTheDocument()
  })

  test('必須項目が空のままでは送信できない', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<ManualAddModal {...defaultProps} onAdd={onAdd} />)
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(onAdd).not.toHaveBeenCalled()
  })

  test('必須項目を入力して送信するとonAddが呼ばれる', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<ManualAddModal {...defaultProps} onAdd={onAdd} />)

    await user.type(screen.getByRole('textbox', { name: /商品名/ }), '牛乳')
    await user.type(screen.getByLabelText(/賞味.消費期限/), '2026-04-10')

    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '牛乳',
        expiryDate: '2026-04-10',
      })
    )
  })

  test('キャンセルボタンでonCloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ManualAddModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onClose).toHaveBeenCalled()
  })

  test('賞味期限/消費期限の区分を選択できる', () => {
    render(<ManualAddModal {...defaultProps} />)
    expect(screen.getByRole('combobox', { name: /種別/ })).toBeInTheDocument()
  })

  test('送信後にonAddに渡すオブジェクトにexpiryTypeが含まれる', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<ManualAddModal {...defaultProps} onAdd={onAdd} />)

    await user.type(screen.getByRole('textbox', { name: /商品名/ }), '豆腐')
    await user.type(screen.getByLabelText(/賞味.消費期限/), '2026-04-05')

    const select = screen.getByRole('combobox', { name: /種別/ })
    await user.selectOptions(select, '消費期限')

    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        expiryType: '消費期限',
      })
    )
  })
})
