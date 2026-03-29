import { render, screen } from '@testing-library/react'
import Scanner from './Scanner'

describe('Scanner', () => {
  test('Phase 3未実装を示すメッセージを表示する', () => {
    render(<Scanner gasUrl="" onProductsScanned={() => {}} />)
    expect(screen.getByText(/Phase 3/)).toBeInTheDocument()
  })

  test('カメラアイコンまたは案内テキストを表示する', () => {
    render(<Scanner gasUrl="" onProductsScanned={() => {}} />)
    expect(screen.getByText(/レシートスキャン機能/)).toBeInTheDocument()
  })
})
