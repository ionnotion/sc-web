# School Academic System — Web (Vite + React)

## Develop
Requires Node 20+ and the API running on `http://localhost:8080` (see the API repo).
```bash
npm install
cp .env.example .env     # optional: site name, address, DEV_API_URL ...
npm run dev              # public: http://localhost:5173/   admin: http://localhost:5173/admin/
```
The dev server proxies `/api` to the backend, so no CORS configuration is needed.

## Build & run in Docker
```bash
npm run build                                   # static files in dist/ (both apps)
docker build -t school-web .                    # nginx serving dist/ and proxying /api
docker run -p 3000:80 -e API_UPSTREAM=http://api:8080 --network <api-compose-network> school-web
```
