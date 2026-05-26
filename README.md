# Bank UI React

기존 정적 HTML 화면을 Vite + React 구조로 옮긴 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

## 백엔드 연동

백엔드 주소가 생기면 `.env`에 아래 값을 추가합니다.

```bash
VITE_API_BASE_URL=http://localhost:8080
```

API 주소가 없으면 `src/api.js`가 `localStorage`와 mock 데이터로 동작합니다.

## 필요한 API

- `POST /api/auth/login`
- `GET /api/accounts/summary`
- `GET /api/transactions`
- `GET /api/accounts/receiver?accountNumber=333-456-789000`
- `POST /api/transfers`

## 응답 형태

`GET /api/accounts/summary`

```json
{
  "totalAsset": 10000,
  "monthIncome": 0,
  "accounts": [
    {
      "name": "주 계좌",
      "number": "110-123-456789",
      "balance": 10000,
      "availableBalance": 10000
    }
  ]
}
```

`GET /api/transactions`

```json
[
  {
    "id": "TR-20260526-123456",
    "date": "2026-05-26",
    "dateTime": "2026-05-26 14:30:15",
    "type": "이체",
    "partner": "김민수",
    "amount": 5000,
    "balance": 5000
  }
]
```

`GET /api/accounts/receiver`

```json
{
  "receiver": "김민수"
}
```

`POST /api/transfers`

```json
{
  "transferDateTime": "2026-05-26 14:30:15",
  "transferNumber": "TR-20260526-123456",
  "afterBalance": 5000,
  "transaction": {
    "id": "TR-20260526-123456",
    "date": "2026-05-26",
    "dateTime": "2026-05-26 14:30:15",
    "type": "이체",
    "partner": "김민수",
    "amount": 5000,
    "balance": 5000
  }
}
```
