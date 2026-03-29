// eslint-disable-next-line no-unused-vars
export default function Scanner({ gasUrl, onProductsScanned }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center text-gray-500">
      <span className="text-6xl">📷</span>
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-gray-700">
          レシートスキャン機能
        </p>
        <p className="text-sm">
          カメラでレシートを撮影して商品情報を自動取得します
        </p>
        <p className="text-xs text-gray-400 mt-2">※ Phase 3 で実装予定</p>
      </div>
    </div>
  )
}
