const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const receiverMockData = {
  "333-456-789000": "김민수",
  "222-111-123456": "박서연",
  "555-777-888999": "최지훈",
  "999-888-777666": "정하늘",
};

export async function login(payload) {
  if (API_BASE_URL) {
    return request("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  }

  if (!payload.userId || !payload.password) {
    throw new Error("아이디와 비밀번호를 입력해 주세요.");
  }

  return { success: true };
}

export async function fetchAccountSummary() {
  if (API_BASE_URL) {
    return request("/api/accounts/summary");
  }

  const currentBalance = Number(localStorage.getItem("currentBalance") || 10000);

  return {
    totalAsset: currentBalance,
    monthIncome: 0,
    accounts: [
      {
        name: "주 계좌",
        number: "110-123-456789",
        balance: currentBalance,
        availableBalance: currentBalance,
      },
      {
        name: "생활비 계좌",
        number: "110-987-654321",
        balance: 0,
        availableBalance: 0,
      },
    ],
  };
}

export async function fetchTransactions() {
  if (API_BASE_URL) {
    return request("/api/transactions");
  }

  const savedTransactions = JSON.parse(
    localStorage.getItem("transferHistories") || "[]",
  );

  return [
    ...savedTransactions,
    {
      id: "sample-1",
      date: "2026-05-19",
      dateTime: "2026-05-19 10:30:00",
      type: "입금",
      partner: "김지민",
      amount: 20000,
      balance: 30000,
    },
    {
      id: "sample-2",
      date: "2026-05-18",
      dateTime: "2026-05-18 14:20:00",
      type: "이체",
      partner: "박서연",
      amount: 10000,
      balance: 10000,
    },
    {
      id: "sample-3",
      date: "2026-05-17",
      dateTime: "2026-05-17 09:10:00",
      type: "출금",
      partner: "ATM 출금",
      amount: 5000,
      balance: 20000,
    },
  ];
}

export async function checkReceiver(accountNumber) {
  if (API_BASE_URL) {
    return request(`/api/accounts/receiver?accountNumber=${encodeURIComponent(accountNumber)}`);
  }

  if (!/^[0-9]{3}-[0-9]{3}-[0-9]{6}$/.test(accountNumber)) {
    throw new Error("계좌번호 형식을 확인해 주세요.");
  }

  if (["110-123-456789", "110-987-654321"].includes(accountNumber)) {
    throw new Error("본인 계좌로는 이체할 수 없습니다.");
  }

  const receiver = receiverMockData[accountNumber];

  if (!receiver) {
    throw new Error("등록되지 않은 계좌번호입니다.");
  }

  return { receiver };
}

export async function requestTransfer(payload) {
  if (API_BASE_URL) {
    return request("/api/transfers", {
      method: "POST",
      body: payload,
    });
  }

  const currentBalance = Number(localStorage.getItem("currentBalance") || 10000);
  const afterBalance = currentBalance - payload.amount - payload.fee;

  if (afterBalance < 0) {
    throw new Error("잔액이 부족하여 이체할 수 없습니다.");
  }

  if (!receiverMockData[payload.depositAccount]) {
    throw new Error("입금 계좌번호를 다시 확인해 주세요.");
  }

  const transferDateTime = createDateTime();
  const transferNumber = createTransferNumber();
  const transaction = {
    id: transferNumber,
    date: transferDateTime.slice(0, 10),
    dateTime: transferDateTime,
    type: "이체",
    partner: payload.receiver,
    amount: payload.amount,
    balance: afterBalance,
    memo: payload.memo || "",
    withdrawAccount: payload.withdrawAccountName,
    withdrawAccountNumber: payload.withdrawAccount,
    depositAccount: payload.depositAccount,
    receiver: payload.receiver,
    transferNumber,
  };

  localStorage.setItem("currentBalance", String(afterBalance));

  const savedTransactions = JSON.parse(
    localStorage.getItem("transferHistories") || "[]",
  );
  localStorage.setItem(
    "transferHistories",
    JSON.stringify([transaction, ...savedTransactions]),
  );

  return {
    transferDateTime,
    transferNumber,
    afterBalance,
    transaction,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "API 요청에 실패했습니다.");
  }

  return data;
}

function createTransferNumber() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const randomPart = Math.floor(Math.random() * 900000 + 100000);

  return `TR-${datePart}-${randomPart}`;
}

function createDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}
