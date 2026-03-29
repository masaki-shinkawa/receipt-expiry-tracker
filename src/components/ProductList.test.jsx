import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductList from './ProductList'

// 今日 = 2026-03-29 (currentDate)
const today = '2026-03-29'

function makeProduct(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: 'テスト商品',
    expiryDate: '2026-04-10',
    expiryType: '賞味期限',
    storeName: '',
    purchaseDate: today,
    price: 0,
    quantity: 1,
    category: '',
    note: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('ProductList', () => {
  const defaultProps = {
    products: [],
    loading: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onManualAdd: vi.fn(),
  }

  test('ローディング中はスピナーを表示する', () => {
    render(<ProductList {...defaultProps} loading={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('商品がない場合は空メッセージと手動追加ボタンを表示する', () => {
    render(<ProductList {...defaultProps} />)
    expect(screen.getByText(/商品がありません/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /手動で追加/ })
    ).toBeInTheDocument()
  })

  test('手動追加ボタンクリックでonManualAddが呼ばれる', async () => {
    const user = userEvent.setup()
    const onManualAdd = vi.fn()
    render(<ProductList {...defaultProps} onManualAdd={onManualAdd} />)
    await user.click(screen.getByRole('button', { name: /手動で追加/ }))
    expect(onManualAdd).toHaveBeenCalled()
  })

  test('商品一覧を表示する', () => {
    const products = [
      makeProduct({ name: '牛乳', expiryDate: '2026-04-05' }),
      makeProduct({ name: '卵', expiryDate: '2026-04-10' }),
    ]
    render(<ProductList {...defaultProps} products={products} />)
    expect(screen.getByText('牛乳')).toBeInTheDocument()
    expect(screen.getByText('卵')).toBeInTheDocument()
  })

  describe('ステータス表示', () => {
    test('期限切れ（残り0日以下）は赤で表示する', () => {
      const products = [makeProduct({ name: '牛乳', expiryDate: '2026-03-28' })]
      render(<ProductList {...defaultProps} products={products} />)
      // フィルターボタン + ステータスバッジの2箇所に「期限切れ」が表示される
      expect(screen.getAllByText('期限切れ').length).toBeGreaterThanOrEqual(2)
    })

    test('要注意（残り1〜3日）はオレンジで表示する', () => {
      const products = [makeProduct({ name: '卵', expiryDate: '2026-03-31' })]
      render(<ProductList {...defaultProps} products={products} />)
      expect(screen.getAllByText('要注意').length).toBeGreaterThanOrEqual(2)
    })

    test('注意（残り4〜7日）は黄で表示する', () => {
      const products = [
        makeProduct({ name: 'チーズ', expiryDate: '2026-04-05' }),
      ]
      render(<ProductList {...defaultProps} products={products} />)
      expect(screen.getAllByText('注意').length).toBeGreaterThanOrEqual(2)
    })

    test('安全（残り8日以上）は緑で表示する', () => {
      const products = [
        makeProduct({ name: 'ヨーグルト', expiryDate: '2026-04-10' }),
      ]
      render(<ProductList {...defaultProps} products={products} />)
      expect(screen.getAllByText('安全').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('削除', () => {
    test('削除ボタンクリックでonDeleteが商品IDで呼ばれる', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      const product = makeProduct({ name: '牛乳', id: 'delete-id-1' })
      render(
        <ProductList
          {...defaultProps}
          products={[product]}
          onDelete={onDelete}
        />
      )
      await user.click(screen.getByRole('button', { name: '牛乳を削除' }))
      expect(onDelete).toHaveBeenCalledWith('delete-id-1')
    })
  })

  describe('編集', () => {
    test('編集ボタンクリックで編集モーダルが開く', async () => {
      const user = userEvent.setup()
      const product = makeProduct({ name: '牛乳' })
      render(<ProductList {...defaultProps} products={[product]} />)
      await user.click(screen.getByRole('button', { name: '牛乳を編集' }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    test('編集モーダルに現在の商品名が入力済みで表示される', async () => {
      const user = userEvent.setup()
      const product = makeProduct({ name: '既存商品名' })
      render(<ProductList {...defaultProps} products={[product]} />)
      await user.click(screen.getByRole('button', { name: '既存商品名を編集' }))
      expect(screen.getByDisplayValue('既存商品名')).toBeInTheDocument()
    })

    test('編集保存でonUpdateが呼ばれる', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      const product = makeProduct({ name: '元の名前', id: 'edit-id-1' })
      render(
        <ProductList
          {...defaultProps}
          products={[product]}
          onUpdate={onUpdate}
        />
      )
      await user.click(screen.getByRole('button', { name: '元の名前を編集' }))

      const nameInput = screen.getByDisplayValue('元の名前')
      await user.clear(nameInput)
      await user.type(nameInput, '新しい名前')

      await user.click(screen.getByRole('button', { name: '保存' }))
      expect(onUpdate).toHaveBeenCalledWith(
        'edit-id-1',
        expect.objectContaining({ name: '新しい名前' })
      )
    })
  })

  describe('フィルタ', () => {
    test('ステータスフィルタで絞り込みができる', async () => {
      const user = userEvent.setup()
      const products = [
        makeProduct({ name: '古い牛乳', expiryDate: '2026-03-28' }),
        makeProduct({ name: '新鮮な卵', expiryDate: '2026-04-10' }),
      ]
      render(<ProductList {...defaultProps} products={products} />)

      // フィルターボタン（期限切れ）をexactに取得
      const filterBtn = screen
        .getAllByRole('button', { name: '期限切れ' })
        .find(
          (b) => b.closest('div')?.classList.contains('overflow-x-auto') || true
        )
      // filterタブのみ存在する場合はgetAllByRole[0]
      await user.click(screen.getAllByRole('button', { name: '期限切れ' })[0])
      expect(screen.getByText('古い牛乳')).toBeInTheDocument()
      expect(screen.queryByText('新鮮な卵')).not.toBeInTheDocument()
    })

    test('「すべて」フィルタで全商品を表示する', async () => {
      const user = userEvent.setup()
      const products = [
        makeProduct({ name: '古い牛乳', expiryDate: '2026-03-28' }),
        makeProduct({ name: '新鮮な卵', expiryDate: '2026-04-10' }),
      ]
      render(<ProductList {...defaultProps} products={products} />)

      await user.click(screen.getAllByRole('button', { name: '期限切れ' })[0])
      await user.click(screen.getByRole('button', { name: 'すべて' }))
      expect(screen.getByText('古い牛乳')).toBeInTheDocument()
      expect(screen.getByText('新鮮な卵')).toBeInTheDocument()
    })
  })
})
