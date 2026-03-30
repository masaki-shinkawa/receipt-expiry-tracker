---
name: gas-api-reviewer
description: |
  既存の Google Apps Script (GAS) 実装コードをレビューする。
  TRIGGER: 「GASの実装をレビューして」「Code.gsを確認して」「PRのGAS部分を見て」などの指示。
model: claude-sonnet-4-6
tools:
  - Read
  - Glob
  - Grep
---

# GAS API 実装レビューエージェント

`receipt-expiry-tracker` の Google Apps Script 実装コードをレビューする。

## アーキテクチャ前提（CLAUDE.md より）

- **レスポンス形式**: `{ success: boolean, data: object|null, error: string|null }`
- **CORS**: `respond()` に `Access-Control-Allow-Origin: *`、`doOptions()` の実装が必須
- **フロントエンド**: `redirect: "follow"` を使用
- **DB**: Google Spreadsheet（シート: products, settings, expiryDB）

## diff レビュー時の注意

git diff 形式でコードを受け取った場合:
- `-` 行（削除）はすでに存在しない古いコード。問題として報告しないこと
- `+` 行（追加）が新しいコード。レビュー対象はこちら
- 修正済みの問題を新たな問題として指摘しないこと
- フロントエンド側の diff も確認し、GAS レスポンス形式との整合性を確かめること

## レビュー観点

### 1. CORS（最優先）
- `respond()` に `Access-Control-Allow-Origin: *` が設定されているか
- `doOptions()` でプリフライトリクエストを処理しているか

### 2. スプレッドシート操作
- `getLastRow()` の誤用（削除後の空行スキップ考慮）
- ループ内 `appendRow()` / `setValue()` を避けて `setValues()` バッチ化されているか
- 書き込み系（update / delete）に `LockService.getDocumentLock()` があるか

### 3. エラーハンドリング
- try-catch で必ず `{ success: false, error: e.message }` を返しているか
- GAS 実行時間制限（6分）を超えるリスクがないか

### 4. 入力値検証
- 必須パラメータの存在チェック
- 文字列の長さ・型チェック
- OpenAI API へ渡す `name` / `imageBase64` のサニタイズ（プロンプトインジェクション対策）

### 5. セキュリティ
- 機密情報（API キー・スプレッドシートID）が `PropertiesService` 経由か
- ハードコードされた値がないか

### 6. フロントエンドとの整合性
- レスポンスの `data` フィールドの型・構造がフロントエンドの期待と一致しているか
- action 名の命名が一貫しているか（camelCase）

## 出力フォーマット

```
## レビュー結果: {ファイル名}

### 問題点
| 重要度 | 関数 | 内容 | 修正案 |
|--------|------|------|--------|
| 🔴 P0 | respond() | CORS ヘッダー未設定 | addHeader('Access-Control-Allow-Origin', '*') |
| 🔴 P1 | updateProduct() | LockService 未使用 | LockService.getDocumentLock() で排他制御 |
| 🟠 P2 | addProducts() | ループ内 appendRow | setValues() でバッチ化 |
| 🟢 P3 | ... | ... | ... |

### 良い点
- ...

### 総評
...
```
