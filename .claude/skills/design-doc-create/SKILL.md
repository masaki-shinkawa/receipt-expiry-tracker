---
name: design-doc-create
description: |
  receipt-expiry-tracker の機能単位の詳細設計書（画面設計・API設計）を
  GitHub Wiki に作成する。
  TRIGGER: 「〇〇機能の設計書を作成して」「〇〇のdesign docを書いて」などの指示。
---

# 設計書作成 Skill

`receipt-expiry-tracker` Wiki に機能単位の詳細設計書（画面設計・API設計）を作成する。

## 前提情報

- Wiki URL: https://github.com/masaki-shinkawa/receipt-expiry-tracker/wiki
- テンプレートページ:
  - `Template-Feature-画面設計`（画面設計のひな形）
  - `Template-Feature-API設計`（API設計のひな形）
- 既存ページの命名規則: `Feature-{機能名}-画面設計` / `Feature-{機能名}-API設計`
- 記述言語: 日本語
- 図: Mermaid（flowchart / sequenceDiagram / stateDiagram-v2 を必要に応じて使用）
- 受け入れ条件: Given-When-Then 形式（表形式）

## ワークフロー

TodoWrite でタスクを管理しながら以下を順に実施する。

### 1. 機能名を確認する

ユーザーの指示から機能名を特定する。不明な場合は質問する。

### 2. 既存情報を収集する

以下を並行して読み込む:

- `REQUIREMENTS.md`（プロジェクトルート）— 機能要件・フェーズ情報
- Wikiのテンプレートページ（`Template-Feature-画面設計.md` / `Template-Feature-API設計.md`）
- 関連する既存Wikiページ（データ設計、GAS API 共通仕様、依存する機能の設計書）
- 既存の実装コード（`src/components/` / `src/hooks/`）— 実装済みの場合のみ

### 3. 設計内容を決定する

収集した情報をもとに以下を設計し、ユーザーに確認を取る:

**画面設計で決める項目**:
- 画面の概要（1〜2文）
- 受け入れ条件（Given-When-Then、最低3件）
- 画面レイアウト（Mermaid flowchart）
- UI要素（必須 / 任意の項目と入力方式）
- 画面遷移（必要な場合のみ）
- 状態管理（複数状態がある場合のみ）
- 依存コンポーネント（他機能の画面・コンポーネントに依存する場合）

**API設計で決める項目**:
- APIの概要（1〜2文）
- 受け入れ条件（正常系・異常系、Given-When-Then）
- データフロー（Mermaid sequenceDiagram）
- エンドポイント（action名・リクエスト・レスポンス・エラーケース）
- 依存コンポーネント（他機能のAPIや外部サービスに依存する場合）
- 実装メモ

**設計時に必ず検討する横断的観点**:

| 観点 | チェック内容 |
|---|---|
| セキュリティ | 入力値検証の欠如・認証不要なエンドポイント・センシティブデータの露出がないか |
| 拡張性 | 将来フェーズ（Phase 2〜5）の機能追加時にリファクタが必要になる設計になっていないか |
| 性能 | 大量データ時のUI描画・GASへの過剰リクエスト・重いクライアント処理がないか |

これらに課題がある場合は設計書の該当箇所に明記し、ユーザーに確認する。

### 4. Wiki をクローンする

```bash
cd /home/user
git clone https://github.com/masaki-shinkawa/receipt-expiry-tracker.wiki.git 2>/dev/null || true
cd receipt-expiry-tracker.wiki
git pull origin master
```

### 5. 設計書ファイルを作成する

テンプレートを参考に以下のファイルを作成する:

- `Feature-{機能名}-画面設計.md`
- `Feature-{機能名}-API設計.md`

**注意事項**:
- `{機能名}` はすべて実際の機能名に置き換える
- 不要なセクション（> 補足 / > 省略可能）は削除する
- Mermaid図は既存ページのスタイルに合わせる
- ASCII art は使用しない
- 依存コンポーネントがある場合は `## 依存コンポーネント` セクションを追加し、依存先Wikiページへのリンクを記載する

### 6. Home.md と _Sidebar.md を更新する

**Home.md**: `### Features` セクションの末尾（PWA通知の後）に追記:
```markdown
- **{機能名}**
  - [[Feature-{機能名}-画面設計]]
  - [[Feature-{機能名}-API設計]]
```

**_Sidebar.md**: `## Features` セクションの末尾（PWA通知の後）に追記:
```markdown
**{機能名}**
- [画面設計](Feature-{機能名}-画面設計)
- [API設計](Feature-{機能名}-API設計)
```

### 7. コミット・プッシュする

```bash
cd /home/user/receipt-expiry-tracker.wiki

# ステージング
git add Feature-{機能名}-画面設計.md Feature-{機能名}-API設計.md Home.md _Sidebar.md

# コミット（署名なし）
git -c commit.gpgsign=false commit -m "docs: {機能名}の設計書を追加（画面設計・API設計）"

# プッシュ（GitHub Token 認証）
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/masaki-shinkawa/receipt-expiry-tracker.wiki.git
git push -u origin master
```

## 完了後の報告

以下のフォーマットで報告する:

```
## 設計書を作成しました

**機能名**: {機能名}

**作成ページ**:
- [Feature-{機能名}-画面設計]({URL})
- [Feature-{機能名}-API設計]({URL})

**設計のポイント**:
- {画面設計の概要を1〜2行}
- {API設計の概要を1〜2行}

**横断的観点の確認結果**:
- セキュリティ: {問題なし / 課題: ...}
- 拡張性: {問題なし / 課題: ...}
- 性能: {問題なし / 課題: ...}

不明点・確認事項があれば教えてください。
```
