import { useLocation, useNavigate } from "react-router-dom";

export default function TransferConfirmPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const transferData = state || {};

  const handleFinalTransfer = () => {
    navigate("/transfer-complete", { state: transferData });
  };

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <h1>송금 확인</h1>
          <p>입력한 정보를 확인하고 최종 송금을 진행하세요.</p>
        </div>

        <div className="transfer-card">
          <div className="confirm-title-box">
            <span>확인 필요</span>
            <strong>아래 정보가 맞는지 확인해주세요.</strong>
          </div>

          <div className="confirm-info-list">
            <div className="confirm-info-row">
              <span>받는 계좌</span>
              <strong>{transferData.depositAccount || "-"}</strong>
            </div>
            <div className="confirm-info-row">
              <span>송금 금액</span>
              <strong className="confirm-amount">{transferData.amount || "-"}</strong>
            </div>
            <div className="confirm-info-row">
              <span>출금 계좌</span>
              <strong>{transferData.withdrawAccount || "-"}</strong>
            </div>
            <div className="confirm-info-row">
              <span>메모</span>
              <strong>{transferData.memo || "-"}</strong>
            </div>
          </div>

          <div className="confirm-button-group">
            <button type="button" className="confirm-edit-btn" onClick={() => navigate("/transfer")}>
              수정
            </button>
            <button type="button" className="transfer-submit-btn" onClick={handleFinalTransfer}>
              확인 후 송금
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
