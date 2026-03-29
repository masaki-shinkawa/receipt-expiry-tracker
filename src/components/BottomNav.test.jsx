import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomNav from './BottomNav'

describe('BottomNav', () => {
  test('一覧タブとスキャンタブを表示する', () => {
    render(<BottomNav activeTab="list" onTabChange={() => {}} />)
    expect(screen.getByText('一覧')).toBeInTheDocument()
    expect(screen.getByText('スキャン')).toBeInTheDocument()
  })

  test('一覧タブクリックでonTabChange("list")が呼ばれる', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<BottomNav activeTab="scan" onTabChange={onTabChange} />)
    await user.click(screen.getByText('一覧'))
    expect(onTabChange).toHaveBeenCalledWith('list')
  })

  test('スキャンタブクリックでonTabChange("scan")が呼ばれる', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<BottomNav activeTab="list" onTabChange={onTabChange} />)
    await user.click(screen.getByText('スキャン'))
    expect(onTabChange).toHaveBeenCalledWith('scan')
  })

  test('アクティブなタブがハイライトされる', () => {
    const { rerender } = render(
      <BottomNav activeTab="list" onTabChange={() => {}} />
    )
    expect(screen.getByRole('button', { name: /一覧/ })).toHaveClass(
      'text-primary-600'
    )
    expect(screen.getByRole('button', { name: /スキャン/ })).not.toHaveClass(
      'text-primary-600'
    )

    rerender(<BottomNav activeTab="scan" onTabChange={() => {}} />)
    expect(screen.getByRole('button', { name: /スキャン/ })).toHaveClass(
      'text-primary-600'
    )
    expect(screen.getByRole('button', { name: /一覧/ })).not.toHaveClass(
      'text-primary-600'
    )
  })
})
