/**
 * 賞味期限トラッカー GAS バックエンド
 *
 * Script Properties (設定 > スクリプト プロパティ) に以下を登録すること:
 *   SPREADSHEET_ID : Google Spreadsheet の ID
 *   OPENAI_API_KEY : OpenAI API キー
 *
 * デプロイ設定:
 *   実行するユーザー : 自分
 *   アクセスできるユーザー : 全員
 */

// スプレッドシートの products シートのカラム定義（順序固定）
const PRODUCT_COLUMNS = [
  'id',
  'name',
  'storeName',
  'purchaseDate',
  'price',
  'quantity',
  'expiryDate',
  'expiryType',
  'expirySource',
  'category',
  'note',
  'createdAt',
]

// ----------------------------------------------------------------
// エントリーポイント
// ----------------------------------------------------------------

function doGet(e) {
  try {
    const action = e.parameter.action
    if (action === 'getProducts') {
      return respond({ success: true, data: getProducts(), error: null })
    }
    return respond({ success: false, data: null, error: 'Unknown action: ' + action })
  } catch (err) {
    return respond({ success: false, data: null, error: err.message })
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const { action } = body

    if (action === 'addProducts') {
      return respond({ success: true, data: addProducts(body.products), error: null })
    }
    if (action === 'updateProduct') {
      return respond({ success: true, data: updateProduct(body.id, body.updates), error: null })
    }
    if (action === 'deleteProduct') {
      return respond({ success: true, data: deleteProduct(body.id), error: null })
    }
    if (action === 'scanReceipt') {
      return respond({ success: true, data: scanReceipt(body.imageBase64), error: null })
    }
    if (action === 'estimateExpiry') {
      return respond({ success: true, data: estimateExpiry(body.name), error: null })
    }

    return respond({ success: false, data: null, error: 'Unknown action: ' + action })
  } catch (err) {
    return respond({ success: false, data: null, error: err.message })
  }
}

// ----------------------------------------------------------------
// レスポンスヘルパー
// ----------------------------------------------------------------

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  )
}

// ----------------------------------------------------------------
// スプレッドシートヘルパー
// ----------------------------------------------------------------

function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  if (!id) throw new Error('SPREADSHEET_ID is not set in Script Properties')
  return SpreadsheetApp.openById(id)
}

function getProductsSheet() {
  const ss = getSpreadsheet()
  let sheet = ss.getSheetByName('products')
  if (!sheet) {
    sheet = ss.insertSheet('products')
    sheet.appendRow(PRODUCT_COLUMNS)
  }
  return sheet
}

// ----------------------------------------------------------------
// 商品 CRUD
// ----------------------------------------------------------------

function getProducts() {
  const sheet = getProductsSheet()
  const lastRow = sheet.getLastRow()
  if (lastRow <= 1) return []

  const rows = sheet.getRange(1, 1, lastRow, PRODUCT_COLUMNS.length).getValues()
  const headers = rows[0]

  return rows.slice(1).map((row) => {
    const obj = {}
    headers.forEach((h, i) => {
      const v = row[i]
      // Date オブジェクトを ISO 文字列に変換
      if (v instanceof Date) {
        obj[h] = h === 'createdAt' ? v.toISOString() : Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd')
      } else {
        obj[h] = v
      }
    })
    return obj
  })
}

function addProducts(products) {
  const sheet = getProductsSheet()
  // ヘッダー行がなければ追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PRODUCT_COLUMNS)
  }

  products.forEach((product) => {
    const row = PRODUCT_COLUMNS.map((col) => {
      const v = product[col]
      return v !== undefined && v !== null ? v : ''
    })
    sheet.appendRow(row)
  })

  return { added: products.length }
}

function updateProduct(id, updates) {
  const sheet = getProductsSheet()
  const lastRow = sheet.getLastRow()
  if (lastRow <= 1) return { updated: null }

  const rows = sheet.getRange(1, 1, lastRow, PRODUCT_COLUMNS.length).getValues()
  const headers = rows[0]
  const idColIndex = headers.indexOf('id')

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idColIndex] === id) {
      Object.entries(updates).forEach(([key, value]) => {
        const colIndex = headers.indexOf(key)
        if (colIndex >= 0) {
          sheet.getRange(i + 1, colIndex + 1).setValue(value !== null ? value : '')
        }
      })
      return { updated: id }
    }
  }

  return { updated: null }
}

function deleteProduct(id) {
  const sheet = getProductsSheet()
  const lastRow = sheet.getLastRow()
  if (lastRow <= 1) return { deleted: null }

  const rows = sheet.getRange(1, 1, lastRow, PRODUCT_COLUMNS.length).getValues()
  const headers = rows[0]
  const idColIndex = headers.indexOf('id')

  // 後ろから削除してインデックスのズレを防ぐ
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][idColIndex] === id) {
      sheet.deleteRow(i + 1)
      return { deleted: id }
    }
  }

  return { deleted: null }
}

// ----------------------------------------------------------------
// レシートスキャン（OpenAI GPT-4o Vision）
// ----------------------------------------------------------------

function scanReceipt(imageBase64) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set in Script Properties')

  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'このレシート画像から商品情報を抽出してください。以下のJSON形式のみで返してください（説明不要）：{"products": [{"name": "商品名", "purchaseDate": "YYYY-MM-DD", "storeName": "店舗名", "price": 価格の数値, "quantity": 数量の数値}]}。購入日はYYYY-MM-DD形式、価格・数量は数値で返してください。',
          },
          {
            type: 'image_url',
            image_url: { url: 'data:image/jpeg;base64,' + imageBase64 },
          },
        ],
      },
    ],
    max_tokens: 1000,
  }

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })

  const result = JSON.parse(response.getContentText())
  if (result.error) throw new Error(result.error.message)

  const content = result.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('レシートの解析に失敗しました')

  return JSON.parse(jsonMatch[0])
}

// ----------------------------------------------------------------
// 賞味期限推定（OpenAI GPT-4o mini）
// ----------------------------------------------------------------

function estimateExpiry(name) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set in Script Properties')

  const today = Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd')

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content:
          '食品「' +
          name +
          '」の賞味期限または消費期限を推定してください。今日は' +
          today +
          'です。購入日も今日と仮定して期限日を推定してください。以下のJSON形式のみで返してください（説明不要）：{"expiryDate": "YYYY-MM-DD", "expiryType": "賞味期限 or 消費期限"}',
      },
    ],
    max_tokens: 100,
  }

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })

  const result = JSON.parse(response.getContentText())
  if (result.error) throw new Error(result.error.message)

  const content = result.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('期限推定に失敗しました')

  return JSON.parse(jsonMatch[0])
}
