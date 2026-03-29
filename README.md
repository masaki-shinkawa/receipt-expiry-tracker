# 賞味期限トラッカー

レシートをカメラで撮影し、AIで商品情報を自動抽出して賞味期限・消費期限を管理するPWAアプリ。

## 機能

- **手動追加**：商品名・期限日・種別（賞味/消費）などを入力して登録
- **期限一覧**：ステータス別（期限切れ／要注意／注意／安全）の色分けと絞り込み
- **編集・削除**：登録済み商品のインライン編集・削除
- **設定**：GAS URL・通知日数の設定（オフライン時はlocalStorageに保存）
- **スキャン** _(Phase 3予定)_：カメラでレシートを撮影してAI自動抽出

## ステータス色定義

| ステータス | 条件        | 色       |
| ---------- | ----------- | -------- |
| 期限切れ   | 残り0日以下 | 赤       |
| 要注意     | 残り1〜3日  | オレンジ |
| 注意       | 残り4〜7日  | 黄       |
| 安全       | 残り8日以上 | 緑       |

## 技術スタック

| レイヤー            | 技術                           |
| ------------------- | ------------------------------ |
| Frontend            | React 19 + Vite + Tailwind CSS |
| 日付処理            | date-fns                       |
| テスト              | Vitest + Testing Library       |
| Linter              | oxlint                         |
| Formatter           | Prettier                       |
| Git Hooks           | Lefthook                       |
| Backend _(Phase 2)_ | Google Apps Script             |
| DB _(Phase 2)_      | Google Spreadsheet             |
| Deploy _(Phase 5)_  | Cloudflare Pages               |

## セットアップ

```bash
npm install
npm run dev
```

## スクリプト

| コマンド           | 内容                         |
| ------------------ | ---------------------------- |
| `npm run dev`      | 開発サーバー起動             |
| `npm run build`    | プロダクションビルド         |
| `npm test`         | テストをウォッチモードで実行 |
| `npm run test:run` | テストを1回実行              |
| `npm run lint`     | Lintチェック                 |
| `npm run format`   | コードフォーマット           |

## ディレクトリ構成

```
src/
├── components/
│   ├── BottomNav.jsx        # 下部ナビゲーション（一覧/スキャン切替）
│   ├── ManualAddModal.jsx   # 手動追加モーダル
│   ├── ProductList.jsx      # 商品一覧（期限ステータス表示・編集・削除）
│   ├── Scanner.jsx          # スキャン画面（Phase 3プレースホルダー）
│   └── SettingsModal.jsx    # 設定モーダル
├── hooks/
│   ├── useProducts.js       # 商品データ管理（GAS/localStorage）
│   └── useSettings.js       # 設定管理（localStorage）
├── App.jsx                  # アプリシェル
├── main.jsx                 # エントリーポイント
└── index.css                # グローバルスタイル（Tailwind）
```

## 開発フェーズ

| フェーズ | 内容                                   | 状態      |
| -------- | -------------------------------------- | --------- |
| Phase 1  | React基盤 + 手動追加 + 期限一覧        | ✅ 完了   |
| Phase 2  | GASバックエンド + スプレッドシート連携 | 🔜 未着手 |
| Phase 3  | カメラスキャン + OpenAI Vision連携     | 🔜 未着手 |
| Phase 4  | 期限DB + AI推測 + PWA通知              | 🔜 未着手 |
| Phase 5  | Cloudflare Pagesデプロイ設定           | 🔜 未着手 |

## テスト

TDDで実装。全6ファイル・36テストをカバー。

```bash
npm run test:run
```

```
Test Files  6 passed (6)
     Tests  36 passed (36)
```

### テスト対象

| ファイル                  | テスト数 | 内容                                                     |
| ------------------------- | -------- | -------------------------------------------------------- |
| `useSettings.test.js`     | 4        | デフォルト値・localStorage読込・保存・マージ             |
| `BottomNav.test.jsx`      | 4        | タブ表示・クリック・アクティブ状態                       |
| `ProductList.test.jsx`    | 12       | ローディング・空状態・ステータス色・削除・編集・フィルタ |
| `ManualAddModal.test.jsx` | 6        | ダイアログ表示・必須バリデーション・送信・キャンセル     |
| `SettingsModal.test.jsx`  | 4        | ダイアログ表示・初期値・保存・キャンセル                 |
| `Scanner.test.jsx`        | 2        | プレースホルダー表示                                     |

## 詳細要件

[REQUIREMENTS.md](./REQUIREMENTS.md) を参照。
