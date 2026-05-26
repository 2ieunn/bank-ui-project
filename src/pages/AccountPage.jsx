import { useNavigate } from "react-router-dom";

export default function AccountPage() {
  const navigate = useNavigate();

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div>
          <div className="logo-area">
            <div className="logo-icon">KB</div>
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
            <button type="button" className="menu-item active" onClick={() => navigate("/account")}>
              <span className="menu-icon">●</span>
              <span>자산 현황</span>
            </button>
            <button type="button" className="menu-item" onClick={() => navigate("/transfer")}>
              <span>●</span>
              <span>이체</span>
            </button>
            <button type="button" className="menu-item" onClick={() => navigate("/history")}>
              <span className="menu-icon">●</span>
              <span>거래 내역</span>
            </button>
          </nav>
        </div>

        <button className="logout-button" type="button" onClick={() => navigate("/")}>
          <span>●</span>
          로그아웃
        </button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>안녕하세요, 김민영님</h1>
            <p>오늘 자산 요약</p>
          </div>
          <div className="header-buttons">
            <button type="button">●</button>
            <button type="button">●</button>
          </div>
        </header>

        <section className="summary-grid">
          <article className="summary-card main-balance">
            <p>총 자산</p>
            <strong>10,000원</strong>
            <span>보안 연결됨</span>
          </article>
          <article className="summary-card">
            <p>이번 달 수입</p>
            <strong>0원</strong>
            <span>내역 없음</span>
          </article>
          <article className="summary-card">
            <p>이번 달 지출</p>
            <strong>0원</strong>
            <span>내역 없음</span>
          </article>
        </section>

        <section className="main-grid">
          <article className="panel quick-panel">
            <h2>빠른 메뉴</h2>
            <div className="quick-grid">
              <button type="button" onClick={() => navigate("/transfer")}>
                <span>●</span>
                <section>
                  <strong>이체</strong>
                  <p>계좌 간 송금 이동</p>
                </section>
              </button>
              <button type="button" onClick={() => navigate("/history")}>
                <span>●</span>
                <section>
                  <strong>거래 내역</strong>
                  <p>내역 확인</p>
                </section>
              </button>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
