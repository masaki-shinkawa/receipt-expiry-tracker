# 賞味期限トラッカー 要件定義書

## 概要

レシートをカメラで撮影し、AIで商品情報を自動抽出して賞味期限・消費期限を管理するPWAアプリ。

---

## 機能要件

### 1. レシートスキャン

- カメラ撮影 or 画像ファイル選択
- GAS経由でOpenAI gpt-5.4-mini Vision APIに画像送信
- 抽出情報：商品名・購入日・店舗名・価格・数量
- 1枚のレシートから複数商品を一括抽出

### 2. 賞味期限／消費期限の推定

- **Primary**：アプリ内蔵JSON（日本の一般食材 約300品）をファジー検索
- **Fallback**：見つからない場合はgpt-5.4-miniに推測依頼（信頼度を表示）
- スキャン後にユーザーが確認・修正してから保存

### 3. 商品一覧管理

| ステータス | 条件        | 表示色      |
| ---------- | ----------- | ----------- |
| 期限切れ   | 残り0日以下 | 🔴 赤       |
| 要注意     | 残り1〜3日  | 🟠 オレンジ |
| 注意       | 残り4〜7日  | 🟡 黄       |
| 安全       | 残り8日以上 | 🟢 緑       |

- 編集・削除
- 手動追加（カメラ不使用でも登録可能）
- 賞味期限 / 消費期限の区別

### 4. PWAプッシュ通知

- 期限X日前にプッシュ通知（デフォルト：3日前）
- Service Workerで実装
- オフラインでも動作

### 5. 家族共有

- GAS Web AppのURLを家族で共有するだけ
- 認証不要（GAS側でアクセス制御）

---

## 技術スタック

| レイヤー    | 技術                              |
| ----------- | --------------------------------- |
| Frontend    | React.js + Vite + Tailwind CSS    |
| PWA         | Service Worker + Web App Manifest |
| AI          | OpenAI gpt-5.4-mini (Vision対応)  |
| Backend/API | Google Apps Script (Web App)      |
| DB          | Google Spreadsheet                |
| Deploy      | Cloudflare Pages                  |

---

## データ設計

### Spreadsheet シート構成

**`products` シート**
| 列 | 型 | 説明 |
|---|---|---|
| id | string | UUID |
| name | string | 商品名 |
| storeName | string | 店舗名 |
| purchaseDate | date | 購入日 |
| price | number | 価格 |
| quantity | number | 数量 |
| expiryDate | date | 賞味/消費期限 |
| expiryType | string | "賞味期限" or "消費期限" |
| expirySource | string | "db" or "ai" or "manual" |
| category | string | カテゴリ（肉・魚・野菜など） |
| note | string | メモ |
| createdAt | datetime | 登録日時 |

**`settings` シート**
| 列 | 値 |
|---|---|
| notifyDaysBefore | 3 |

---

## GAS API設計

**Base URL**: `https://script.google.com/macros/s/{SCRIPT_ID}/exec`

| メソッド | パラメータ               | 処理                            |
| -------- | ------------------------ | ------------------------------- |
| GET      | `?action=getProducts`    | 全商品一覧取得                  |
| POST     | `action: addProducts`    | 商品追加（複数可）              |
| POST     | `action: updateProduct`  | 商品更新                        |
| POST     | `action: deleteProduct`  | 商品削除                        |
| POST     | `action: scanReceipt`    | 画像→OpenAI Vision→商品情報返却 |
| POST     | `action: estimateExpiry` | 商品名→期限推定（Fallback）     |

---

## 期限DB設計（アプリ内蔵JSON）

```json
{
  "items": [
    {
      "name": "牛乳",
      "aliases": ["ミルク", "milk"],
      "category": "乳製品",
      "expiryDaysAfterPurchase": 7,
      "expiryType": "消費期限"
    },
    ...
  ]
}
```

- 約300品（肉・魚・野菜・乳製品・調味料・加工食品など）
- 購入日からの日数で期限を計算
- ファジーマッチング（部分一致 + カタカナ/ひらがな正規化）

---

## 画面構成

```
┌─────────────────────┐
│  Header（タイトル + 設定）  │
├─────────────────────┤
│                     │
│   メインコンテンツ       │
│   ・商品一覧 or         │
│   ・スキャン画面         │
│                     │
├─────────────────────┤
│  BottomNav（一覧｜スキャン）│
└─────────────────────┘
```

### 画面一覧

1. **商品一覧** - 期限ステータス別フィルタ・ソート
2. **スキャン** - カメラ撮影 → AI抽出 → 確認・編集 → 保存
3. **設定** - GAS URL・通知日数・OpenAI APIキー
4. **手動追加モーダル**
5. **商品編集モーダル**

---

## 非機能要件

- **オフライン対応**：localStorage をキャッシュとして利用
- **レスポンシブ**：スマートフォン優先（max-width: 448px）
- **セキュリティ**：OpenAI APIキーはGAS側で管理（フロントに露出しない）
- **パフォーマンス**：初期ロード < 2秒（Cloudflare CDN）

---

## 開発フェーズ

| フェーズ | 内容                                   | 状態      |
| -------- | -------------------------------------- | --------- |
| Phase 1  | React基盤 + 手動追加 + 期限一覧        | ✅ 完了   |
| Phase 2  | GASバックエンド + スプレッドシート連携 | 🔜 未着手 |
| Phase 3  | カメラスキャン + OpenAI Vision連携     | 🔜 未着手 |
| Phase 4  | 期限DB + AI推測 + PWA通知              | 🔜 未着手 |
| Phase 5  | Cloudflare Pagesデプロイ設定           | 🔜 未着手 |
