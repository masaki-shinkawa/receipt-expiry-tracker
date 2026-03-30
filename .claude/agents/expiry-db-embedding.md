---
name: expiry-db-embedding
description: |
  賞味期限DBのStage 2 Embedding類似度検索（text-embedding-3-small / GAS経由）の実装・デバッグを行う。
  TRIGGER: 「Embeddingの類似度を確認して」「ベクトル検索を実装して」「GASのsearchByEmbeddingをデバッグして」などの指示。
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
---

# 賞味期限DB Embedding検索エージェント（Stage 2）

`receipt-expiry-tracker` のEmbedding類似度検索（Stage 1 で閾値未達の場合のフォールバック）を実装・デバッグする。

## アーキテクチャ（CLAUDE.md より）

- モデル: `text-embedding-3-small` / **256次元**
- ベクトルはスプレッドシート `expiryDB` シートに事前計算・保存済み
- フロントエンド → GAS → OpenAI Embeddings API → コサイン類似度計算

## GAS リクエスト/レスポンス形式

```js
// フロントエンド → GAS
POST { action: "searchByEmbedding", query: "商品名", topK: 3 }

// GAS レスポンス
{
  success: true,
  data: [
    { name: "商品名", expiryDays: 7, score: 0.92 },
    { name: "類似商品", expiryDays: 14, score: 0.78 },
  ]
}
```

## GAS 側実装パターン

```js
function searchByEmbedding(query, topK = 3) {
  // 1. クエリをEmbedding化
  const queryVec = fetchEmbedding(query)  // OpenAI API呼び出し

  // 2. expiryDB シートから全ベクトルを取得
  const sheet = SpreadsheetApp.getActive().getSheetByName('expiryDB')
  const rows = sheet.getDataRange().getValues()  // [name, expiryDays, embeddingJSON]

  // 3. コサイン類似度でランキング
  const scored = rows.slice(1).map(([name, expiryDays, embJson]) => ({
    name, expiryDays,
    score: cosineSimilarity(queryVec, JSON.parse(embJson))
  }))
  return scored.sort((a, b) => b.score - a.score).slice(0, topK)
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (normA * normB)
}
```

## スプレッドシート列構成

| 列 | 内容 | 例 |
|---|---|---|
| A | 商品名 | "牛乳" |
| B | 賞味期限日数 | 7 |
| C | Embeddingベクトル（JSON） | "[0.12, -0.34, ...]" |

## デバッグ手順

1. GAS ログ（`console.log`）で `queryVec` の次元数（256）を確認する
2. コサイン類似度スコアの分布を確認し、0.7 以上が期待候補か検証する
3. `expiryDB` シートの embedding 列が正しい JSON 配列形式か確認する
4. OpenAI API のレート制限・タイムアウトに注意（GAS 実行時間 6 分上限）

## 注意事項
- Stage 1 でスコアが `STAGE1_THRESHOLD`（0.7）以上の場合はこのエージェントを呼ばない
- embedding の事前計算スクリプトは別途用意（初回 or 商品マスタ更新時に実行）
