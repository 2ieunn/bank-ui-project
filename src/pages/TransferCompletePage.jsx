import { useLocation, useNavigate } from "react-router-dom";

export default function TransferCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const transferData = state || {};

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <h1>송금 완료</h1>
          <p>송금이 정상적으로 완료되었습니다.</p>
        </div>

        <div className="transfer-card">
          <div className="complete-message-box">
            <div className="complete-icon">✓</div>
            <h2>송금이 완료되었습니다.</h2>
            <p>요청하신 금액이 수취인 계좌로 이체되었습니다.</p>
          </div>

          <div className="complete-info-list">
            <div className="complete-info-row">
              <span>송금 금액</span>
              <strong className="complete-amount">{transferData.amount || "-"}</strong>
            </div>
            <div className="complete-info-row">
              <span>받는 계좌</span>
              <strong>{transferData.depositAccount || "-"}</strong>
            </div>
          </div>

          <div className="complete-button-group">
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/history")}>
              거래내역 보기
            </button>
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/balance")}>
              잔액 조회
            </button>
            <button type="button" className="complete-sub-btn" onClick={() => navigate("/transfer")}>
              추가 송금
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
