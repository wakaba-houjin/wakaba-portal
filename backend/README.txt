Step3: FastAPI起動確認

1. このZIPを展開
2. backendフォルダ内の2ファイルを C:\Projects\wakaba-portal\backend にコピー
3. docker-compose.yml を C:\Projects\wakaba-portal に上書き
4. PowerShellで以下を実行

cd C:\Projects\wakaba-portal
docker compose down
docker compose up -d

5. 1〜2分後、ブラウザで開く

http://localhost:8000/health

次が表示されれば成功:
{"status":"ok"}

API仕様画面:
http://localhost:8000/docs
