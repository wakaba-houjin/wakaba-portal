# わかば学園ポータル Ver.1.0 修正版

React + FastAPI + PostgreSQL + Docker で構成した開発版です。
個人情報・顔写真・実在職員データは含まれていません。

## 起動

プロジェクトフォルダで次を実行します。

```powershell
docker compose down
docker compose up -d
```

初回は npm と Python パッケージのインストールに少し時間がかかります。

## 確認URL

- ポータル: http://localhost:5173
- APIヘルスチェック: http://localhost:8000/health
- API仕様書: http://localhost:8000/docs

## 状態確認

```powershell
docker compose ps
docker compose logs frontend --tail 50
docker compose logs backend --tail 50
```

## 主な実装内容

- 職員番号自動採番（WK00001形式）
- 職員一覧の年齢・勤続年数表示
- 氏名クリックで詳細画面
- 所属園・職種・雇用形態・状態による絞り込み
- バス運転手を職種に追加
- 在職状態の色分け
- 今日やること
- 今月の誕生日
- 定年アラート
- 園別職員数
- 管理者メモ
