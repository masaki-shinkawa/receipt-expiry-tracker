---
name: expiry-db-fuzzy
description: |
  賞味期限DBのStage 1 文字列ファジー検索（カタカナ/ひらがな正規化 + 部分一致）の実装・デバッグを行う。
  TRIGGER: 「ファジー検索を実装して」「文字列マッチングをデバッグして」「正規化ロジックを確認して」などの指示。
model: claude-haiku-4-5-20251001
tools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
---

# 賞味期限DB ファジー検索エージェント（Stage 1）

`receipt-expiry-tracker` の文字列ファジーマッチ（APIコールなし）を実装・デバッグする。

## アーキテクチャ

Stage 1 はローカル処理のみ。スコアが閾値を下回った場合のみ Stage 2（Embedding）に委譲する。

## 実装パターン

```js
// カタカナ→ひらがな正規化
function normalizeKana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  )
}

// 部分一致スコア（0.0 〜 1.0）
function fuzzyScore(query, candidate) {
  const q = normalizeKana(query.toLowerCase())
  const c = normalizeKana(candidate.toLowerCase())
  if (c.includes(q)) return 1.0
  // 最長共通部分列で部分スコアを計算
  const lcs = longestCommonSubstring(q, c)
  return lcs / Math.max(q.length, c.length)
}

const STAGE1_THRESHOLD = 0.7  // この値以上なら Stage 2 スキップ

export function stage1Match(query, candidates) {
  const results = candidates
    .map(c => ({ ...c, score: fuzzyScore(query, c.name) }))
    .sort((a, b) => b.score - a.score)
  const best = results[0]
  return { result: best, needsStage2: !best || best.score < STAGE1_THRESHOLD }
}
```

## デバッグ手順

1. `src/hooks/useProducts.js` の Stage 1 呼び出し箇所を特定する
2. 正規化関数を単体でテストする（カタカナ・ひらがな混在ケース）
3. 閾値（`STAGE1_THRESHOLD`）を 0.5〜0.9 で調整して精度を確認する
4. `needsStage2: true` になるケースをログに出力して確認する

## 注意事項
- このエージェントは Stage 1 のみを担当する
- Stage 2（Embedding）が必要な場合は `expiry-db-embedding` エージェントを使うこと
