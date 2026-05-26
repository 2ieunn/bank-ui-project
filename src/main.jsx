import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "../style.css";
import "./react.css";
import {
  checkReceiver,
  fetchAccountSummary,
  fetchTransactions,
  login,
  requestTransfer,
} from "./api";

const INITIAL_TRANSFER = {
  withdrawAccount: "",
  withdrawAccountName: "",
  depositAccount: "",
  receiver: "",
  amount: "",
  fee: 0,
  memo: "",
};

function formatMoney(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return "-";
  }

  return `${numberValue.toLocaleString("ko-KR")}원`;
}

function App() {
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/");
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transferDraft, setTransferDraft] = useState(INITIAL_TRANSFER);
  const [lastTransfer, setLastTransfer] = useState(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash.replace("#", "") || "/");
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    refreshBankData();
  }, []);

  async function refreshBankData() {
    const [summaryData, transactionData] = await Promise.all([
      fetchAccountSummary(),
      fetchTransactions(),
    ]);

    setSummary(summaryData);
    setTransactions(transactionData);
  }

  function navigate(nextRoute) {
    window.location.hash = nextRoute;
  }

  async function completeTransfer() {
    const result = await requestTransfer({
      ...transferDraft,
      amount: Number(transferDraft.amount),
      fee: Number(transferDraft.fee || 0),
    });

    setLastTransfer(result);
    setSummary((current) => ({
      ...current,
      totalAsset: result.afterBalance,
      accounts: current.accounts.map((account) =>
        account.number === transferDraft.withdrawAccount
          ? { ...account, balance: result.afterBalance }
          : account,
      ),
    }));
    setTransactions((current) => [result.transaction, ...current]);
    navigate("/transfer-complete");
  }

  if (route === "/account") {
    return (
      <AccountPage
        summary={summary}
        transactions={transactions}
        navigate={navigate}
      />
    );
  }

  if (route === "/balance") {
    return (
      <BalancePage
        summary={summary}
        transactions={transactions}
        navigate={navigate}
      />
    );
  }

  if (route === "/transfer") {
    return (
      <TransferPage
        summary={summary}
        transferDraft={transferDraft}
        setTransferDraft={setTransferDraft}
        navigate={navigate}
      />
    );
  }

  if (route === "/transfer-confirm") {
    return (
      <TransferConfirmPage
        summary={summary}
        transferDraft={transferDraft}
        navigate={navigate}
        onComplete={completeTransfer}
      />
    );
  }

  if (route === "/transfer-complete") {
    return (
      <TransferCompletePage
        lastTransfer={lastTransfer}
        navigate={navigate}
      />
    );
  }

  if (route === "/history") {
    return (
      <HistoryPage
        summary={summary}
        transactions={transactions}
        navigate={navigate}
      />
    );
  }

  return <LoginPage navigate={navigate} />;
}

function LoginPage({ navigate }) {
  const [form, setForm] = useState({ userId: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/account");
    } catch (apiError) {
      setError(apiError.message || "로그인에 실패했습니다.");
    }
  }

  return (
    <main className="page">
      <section className="login-card">
        <div className="login-header">
          <h1>안전하게 로그인하세요.</h1>
          <p>등록하신 아이디와 비밀번호를 입력해 주세요.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">아이디</label>
            <input
              id="userId"
              name="userId"
              type="text"
              placeholder="아이디를 입력해 주세요"
              value={form.userId}
              onChange={(event) =>
                setForm((current) => ({ ...current, userId: event.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </div>

          <div className="option-row">
            <label className="save-id">
              <input type="checkbox" defaultChecked />
              <span>아이디 저장</span>
            </label>
            <a href="#/">비밀번호를 잊으셨나요?</a>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            로그인
          </button>

          <div className="divider"></div>

          <div className="bottom-links">
            <a href="#/">아이디 찾기</a>
            <span></span>
            <p>아직 회원이 아니신가요?</p>
            <a href="#/" className="join-link">
              회원가입
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}

function Sidebar({ active, navigate }) {
  const menuItems = [
    ["account", "자산 현황", "/account"],
    ["transfer", "이체", "/transfer"],
    ["history", "거래 내역", "/history"],
    ["manage", "계좌 관리", "/account"],
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-area">
          <div className="logo-icon">₩</div>
          <span>금융서비스</span>
        </div>

        <div className="profile-box">
          <div className="profile-circle">김</div>
          <div>
            <strong>김민영 님</strong>
            <p>일반 회원</p>
          </div>
        </div>

        <nav className="menu-section">
          <p className="menu-title">메뉴</p>
          {menuItems.map(([key, label, path]) => (
            <button
              key={key}
              type="button"
              className={`menu-item ${active === key ? "active" : ""}`}
              onClick={() => navigate(path)}
            >
              <span className="menu-icon">•</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <nav className="menu-section setting-section">
          <p className="menu-title">설정</p>
          <button type="button" className="menu-item">
            <span className="menu-icon">•</span>
            <span>보안 설정</span>
          </button>
          <button type="button" className="menu-item">
            <span className="menu-icon">•</span>
            <span>고객 지원</span>
          </button>
        </nav>
      </div>

      <button className="logout-button" type="button" onClick={() => navigate("/")}>
        <span>↩</span>
        로그아웃
      </button>
    </aside>
  );
}

function AccountPage({ summary, transactions, navigate }) {
  const currentSummary = summary || createEmptySummary();
  const monthExpense = transactions
    .filter((item) => item.type !== "입금")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const mainAccount = currentSummary.accounts[0];

  return (
    <main className="dashboard-page">
      <Sidebar active="account" navigate={navigate} />
      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>안녕하세요, 김민영님</h1>
            <p>오늘 기준 자산을 안전하게 관리하고 있어요.</p>
          </div>
          <div className="header-buttons">
            <button type="button" onClick={() => navigate("/balance")}>
              잔액조회
            </button>
            <button type="button" onClick={() => navigate("/history")}>
              알림
            </button>
          </div>
        </header>

        <section className="summary-grid">
          <article className="summary-card main-balance">
            <p>총 자산</p>
            <strong>{formatMoney(currentSummary.totalAsset)}</strong>
            <span>보안 연결됨</span>
          </article>
          <article className="summary-card">
            <p>이번 달 수입</p>
            <strong>{formatMoney(currentSummary.monthIncome)}</strong>
            <span>입금 합계</span>
          </article>
          <article className="summary-card">
            <p>이번 달 지출</p>
            <strong>{formatMoney(monthExpense)}</strong>
            <span>{monthExpense > 0 ? "거래 내역 있음" : "내역 없음"}</span>
          </article>
        </section>

        <section className="main-grid">
          <article className="panel account-panel">
            <div className="panel-title-row">
              <h2>연결된 계좌</h2>
              <button type="button" className="text-link" onClick={() => navigate("/balance")}>
                전체 보기
              </button>
            </div>

            <div className="account-box">
              <div className="account-icon">₩</div>
              <div className="account-info">
                <p>{mainAccount.name}</p>
                <span>{mainAccount.number}</span>
              </div>
              <strong>{formatMoney(mainAccount.balance)}</strong>
            </div>

            <div className="account-divider"></div>

            <div className="add-account">
              <div>+</div>
              <section>
                <p>계좌 추가</p>
                <span>새 계좌를 연결하세요.</span>
              </section>
            </div>
          </article>

          <article className="panel quick-panel">
            <h2>빠른 메뉴</h2>
            <div className="quick-grid">
              <QuickButton title="이체" desc="계좌 간 자금 이동" onClick={() => navigate("/transfer")} />
              <QuickButton title="거래 내역" desc="수입과 지출 확인" onClick={() => navigate("/history")} />
              <QuickButton title="잔액조회" desc="현재 잔액 확인" onClick={() => navigate("/balance")} />
              <QuickButton title="고객 지원" desc="문의하기" />
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function QuickButton({ title, desc, onClick }) {
  return (
    <button type="button" onClick={onClick}>
      <span>›</span>
      <section>
        <strong>{title}</strong>
        <p>{desc}</p>
      </section>
    </button>
  );
}

function BalancePage({ summary, transactions, navigate }) {
  const currentSummary = summary || createEmptySummary();
  const account = currentSummary.accounts[0];
  const recent = transactions[0];

  return (
    <div className="balance-page">
      <div className="balance-container">
        <div className="balance-header">
          <h1>잔액 조회</h1>
          <p>내 계좌의 현재 잔액과 출금 가능 금액을 확인할 수 있습니다.</p>
        </div>

        <div className="balance-card">
          <InfoRow label="계좌 번호" value={account.number} />
          <div className="balance-line"></div>
          <InfoRow label="현재 잔액" value={formatMoney(account.balance)} className="current-balance" />
          <div className="balance-line"></div>
          <InfoRow label="출금 가능 금액" value={formatMoney(account.availableBalance)} />
          <div className="balance-line"></div>
          <InfoRow
            label="최근 거래 상태"
            value={
              recent
                ? `${recent.date} ${recent.partner} ${formatMoney(recent.amount)}`
                : "최근 거래 내역 없음"
            }
          />

          <div className="complete-button-group">
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/history")}>
              거래내역 보기
            </button>
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/transfer")}>
              추가 이체
            </button>
            <button type="button" className="transfer-submit-btn" onClick={() => navigate("/account")}>
              메인으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, className = "" }) {
  return (
    <div className={`balance-section ${className}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function TransferPage({ summary, transferDraft, setTransferDraft, navigate }) {
  const currentSummary = summary || createEmptySummary();
  const [errors, setErrors] = useState({});
  const account = currentSummary.accounts[0];
  const amountNumber = Number(transferDraft.amount || 0);
  const expectedBalance = account.availableBalance - amountNumber;

  function updateField(name, value) {
    setTransferDraft((current) => ({ ...current, [name]: value }));
  }

  function formatAccountNumber(value) {
    const numbers = value.replace(/[^0-9]/g, "").slice(0, 12);

    if (numbers.length > 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }

    if (numbers.length > 3) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    return numbers;
  }

  async function handleReceiverCheck() {
    setErrors({});

    try {
      const result = await checkReceiver(transferDraft.depositAccount);
      updateField("receiver", result.receiver);
    } catch (error) {
      setErrors({ depositAccount: error.message });
      updateField("receiver", "");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!transferDraft.withdrawAccount) {
      nextErrors.withdrawAccount = "출금 계좌를 선택해 주세요.";
    }

    if (!/^[0-9]{3}-[0-9]{3}-[0-9]{6}$/.test(transferDraft.depositAccount)) {
      nextErrors.depositAccount = "계좌번호는 333-456-789000 형식으로 입력해 주세요.";
    }

    if (!transferDraft.receiver) {
      nextErrors.depositAccount = "예금주 확인을 먼저 해 주세요.";
    }

    if (!amountNumber || amountNumber <= 0) {
      nextErrors.amount = "이체 금액을 입력해 주세요.";
    } else if (amountNumber > account.availableBalance) {
      nextErrors.amount = "출금 가능 금액을 초과할 수 없습니다.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      navigate("/transfer-confirm");
    }
  }

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <h1>이체 요청</h1>
          <p>받는 계좌와 금액을 입력한 뒤 이체 요청을 진행해 주세요.</p>
        </div>

        <div className="transfer-card">
          <div className="transfer-balance-box">
            <span>출금 가능 금액</span>
            <strong>{formatMoney(account.availableBalance)}</strong>
          </div>

          <form className="transfer-form" onSubmit={handleSubmit}>
            <label htmlFor="withdraw-account">출금 계좌</label>
            <select
              id="withdraw-account"
              className="transfer-select"
              value={transferDraft.withdrawAccount}
              onChange={(event) => {
                const selected = currentSummary.accounts.find(
                  (item) => item.number === event.target.value,
                );

                setTransferDraft((current) => ({
                  ...current,
                  withdrawAccount: selected?.number || "",
                  withdrawAccountName: selected
                    ? `${selected.name} ${selected.number}`
                    : "",
                }));
              }}
            >
              <option value="">출금 계좌를 선택해 주세요</option>
              {currentSummary.accounts.map((item) => (
                <option key={item.number} value={item.number}>
                  {item.name} {item.number}
                </option>
              ))}
            </select>
            {errors.withdrawAccount && <p className="error-message">{errors.withdrawAccount}</p>}

            <label htmlFor="deposit-account">입금 계좌번호</label>
            <input
              id="deposit-account"
              type="text"
              placeholder="예: 333-456-789000"
              maxLength="14"
              value={transferDraft.depositAccount}
              onChange={(event) => {
                updateField("depositAccount", formatAccountNumber(event.target.value));
                updateField("receiver", "");
              }}
            />
            {errors.depositAccount && <p className="error-message">{errors.depositAccount}</p>}

            <div className="receiver-check-box">
              <div>
                <span>예금주 확인</span>
                <strong>{transferDraft.receiver || "확인 전"}</strong>
              </div>
              <button type="button" className="receiver-check-btn" onClick={handleReceiverCheck}>
                {transferDraft.receiver ? "확인완료" : "확인"}
              </button>
            </div>

            <label htmlFor="amount">이체 금액</label>
            <input
              id="amount"
              type="text"
              placeholder="이체할 금액을 입력하세요"
              value={transferDraft.amount}
              onChange={(event) =>
                updateField("amount", event.target.value.replace(/[^0-9]/g, ""))
              }
            />
            {errors.amount && <p className="error-message">{errors.amount}</p>}

            <label htmlFor="transfer-memo">메모 / 받는 통장 표시명</label>
            <input
              id="transfer-memo"
              type="text"
              placeholder="20자 이내로 입력하세요"
              maxLength="20"
              value={transferDraft.memo}
              onChange={(event) => updateField("memo", event.target.value)}
            />

            <div className="transfer-summary-box">
              <div>
                <span>이체 수수료</span>
                <strong>{formatMoney(transferDraft.fee)}</strong>
              </div>
              <div>
                <span>출금 후 예상 잔액</span>
                <strong>{expectedBalance >= 0 ? formatMoney(expectedBalance) : "초과"}</strong>
              </div>
            </div>

            <p className="transfer-info-text">출금 가능 금액 이하로 입력해 주세요.</p>
            <button type="submit" className="transfer-submit-btn">
              이체 요청
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TransferConfirmPage({ summary, transferDraft, navigate, onComplete }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = (summary || createEmptySummary()).accounts[0];
  const amount = Number(transferDraft.amount || 0);
  const afterBalance = account.balance - amount - Number(transferDraft.fee || 0);

  async function handleComplete() {
    setError("");
    setIsSubmitting(true);

    try {
      await onComplete();
    } catch (apiError) {
      setError(apiError.message || "이체 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  if (!transferDraft.withdrawAccount || !transferDraft.depositAccount || !transferDraft.receiver) {
    return (
      <EmptyState
        title="이체 정보가 없습니다."
        description="이체 요청 화면에서 정보를 입력해 주세요."
        buttonLabel="이체 화면으로"
        onClick={() => navigate("/transfer")}
      />
    );
  }

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <h1>이체 확인</h1>
          <p>입력한 이체 정보를 확인하고 최종 이체를 진행해 주세요.</p>
        </div>

        <div className="transfer-card">
          <div className="confirm-title-box">
            <span>확인 필요</span>
            <strong>아래 정보가 맞는지 확인해 주세요.</strong>
          </div>

          <div className="confirm-info-list">
            <ConfirmRow label="받는 계좌" value={transferDraft.depositAccount} />
            <ConfirmRow label="받는 사람" value={transferDraft.receiver} />
            <ConfirmRow label="이체 금액" value={formatMoney(amount)} className="confirm-amount" />
            <ConfirmRow label="수수료" value={formatMoney(transferDraft.fee)} />
            <ConfirmRow label="출금 계좌" value={transferDraft.withdrawAccountName} />
            <ConfirmRow label="메모" value={transferDraft.memo || "없음"} />
            <ConfirmRow label="이체 후 잔액" value={formatMoney(afterBalance)} />
          </div>

          {error && <p className="error-message react-center-error">{error}</p>}

          <div className="confirm-button-group">
            <button type="button" className="confirm-edit-btn" onClick={() => navigate("/transfer")}>
              수정
            </button>
            <button
              type="button"
              className="transfer-submit-btn"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "이체 처리 중..." : "확인 후 이체"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value, className = "" }) {
  return (
    <div className="confirm-info-row">
      <span>{label}</span>
      <strong className={className}>{value}</strong>
    </div>
  );
}

function TransferCompletePage({ lastTransfer, navigate }) {
  if (!lastTransfer) {
    return (
      <EmptyState
        title="완료된 이체가 없습니다."
        description="새 이체를 진행해 주세요."
        buttonLabel="이체 화면으로"
        onClick={() => navigate("/transfer")}
      />
    );
  }

  return (
    <div className="balance-page">
      <div className="balance-container">
        <div className="balance-header">
          <h1>이체 완료</h1>
          <p>요청하신 이체가 정상 처리되었습니다.</p>
        </div>

        <div className="balance-card">
          <InfoRow label="거래 번호" value={lastTransfer.transferNumber} />
          <div className="balance-line"></div>
          <InfoRow label="거래 일시" value={lastTransfer.transferDateTime} />
          <div className="balance-line"></div>
          <InfoRow label="이체 후 잔액" value={formatMoney(lastTransfer.afterBalance)} />

          <div className="complete-button-group">
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/history")}>
              거래내역 보기
            </button>
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/transfer")}>
              추가 이체
            </button>
            <button type="button" className="transfer-submit-btn" onClick={() => navigate("/account")}>
              메인으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ summary, transactions, navigate }) {
  const currentSummary = summary || createEmptySummary();
  const [filters, setFilters] = useState({ date: "", type: "전체", keyword: "" });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchDate = !filters.date || item.date === filters.date;
      const matchType = filters.type === "전체" || item.type === filters.type;
      const matchKeyword = !filters.keyword || item.partner.includes(filters.keyword);

      return matchDate && matchType && matchKeyword;
    });
  }, [filters, transactions]);

  const monthIncome = transactions
    .filter((item) => item.type === "입금")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const monthExpense = transactions
    .filter((item) => item.type !== "입금")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <main className="dashboard-page">
      <Sidebar active="history" navigate={navigate} />
      <section className="content-area">
        <header className="page-header">
          <div>
            <h1>거래 내역</h1>
            <p>입금, 출금, 이체 내역을 확인할 수 있습니다.</p>
          </div>
        </header>

        <section className="history-summary">
          <div className="summary-card">
            <p>이번 달 입금</p>
            <strong>{formatMoney(monthIncome)}</strong>
          </div>
          <div className="summary-card">
            <p>이번 달 출금</p>
            <strong>{formatMoney(monthExpense)}</strong>
          </div>
          <div className="summary-card">
            <p>현재 잔액</p>
            <strong>{formatMoney(currentSummary.totalAsset)}</strong>
          </div>
        </section>

        <section className="history-box">
          <div className="history-top">
            <div>
              <h2>전체 거래 내역</h2>
              <p>날짜, 구분, 거래처, 금액, 잔액을 확인할 수 있습니다.</p>
            </div>
          </div>

          <div className="filter-area">
            <input
              type="date"
              value={filters.date}
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: event.target.value }))
              }
            />
            <select
              value={filters.type}
              onChange={(event) =>
                setFilters((current) => ({ ...current, type: event.target.value }))
              }
            >
              <option value="전체">전체</option>
              <option value="입금">입금</option>
              <option value="출금">출금</option>
              <option value="이체">이체</option>
            </select>
            <input
              type="text"
              placeholder="거래처 검색"
              value={filters.keyword}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  keyword: event.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() => setFilters({ date: "", type: "전체", keyword: "" })}
            >
              초기화
            </button>
          </div>

          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>구분</th>
                  <th>거래처</th>
                  <th>금액</th>
                  <th>잔액</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <span className={`type-badge ${badgeClass(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.partner}</td>
                    <td className={item.type === "입금" ? "plus" : "minus"}>
                      {item.type === "입금" ? "+" : "-"}
                      {formatMoney(item.amount)}
                    </td>
                    <td>{formatMoney(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <p className="empty-message">조건에 맞는 거래 내역이 없습니다.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function EmptyState({ title, description, buttonLabel, onClick }) {
  return (
    <main className="page">
      <section className="login-card">
        <div className="login-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button type="button" className="login-button" onClick={onClick}>
          {buttonLabel}
        </button>
      </section>
    </main>
  );
}

function badgeClass(type) {
  if (type === "입금") {
    return "deposit";
  }

  if (type === "출금") {
    return "withdraw";
  }

  return "transfer";
}

function createEmptySummary() {
  return {
    totalAsset: 10000,
    monthIncome: 0,
    accounts: [
      {
        name: "주 계좌",
        number: "110-123-456789",
        balance: 10000,
        availableBalance: 10000,
      },
    ],
  };
}

createRoot(document.getElementById("root")).render(<App />);
