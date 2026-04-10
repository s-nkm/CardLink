---
name: CardLink開発状況
description: CardLink営業支援アプリの開発進捗・スプリント状況
type: project
---

営業支援PWA「CardLink」を単一HTMLファイル（app.html）+ Google Apps Script（gas-backend.gs）で開発中。

**Why:** 展示会・商談での名刺管理〜メール生成をスマホで完結させる個人ツール。将来はBtoB SaaS展開予定。

**How to apply:** 単一HTMLファイル構成・スマホファースト（max-width:430px）・claude-haiku-4-5-20251001を維持する。

## 完了済み
- Sprint 1: 名刺OCR・連絡先管理・AIメール生成・設定画面（モック完成）
- Sprint 2: Google Sheets連携（GAS作成 + app.html修正）→ 接続テスト成功（2026-04-10）

## 残スプリント
- Sprint 3: メモ機能強化（Sheets保存済み・音声入力・AI整理テスト）
- Sprint 4: メール機能強化（履歴保存・多言語・mailtoリンク）
- Sprint 5: QR交換機能（qrcode.js・html5-qrcode）
- Sprint 6: 位置情報・自動補完（Geolocation・Places API）

## ファイル構成
- app.html — フロントエンド（単一ファイル）
- gas-backend.gs — GASに貼り付けるバックエンド
- tmp/引き継ぎ書.md — 詳細仕様書
