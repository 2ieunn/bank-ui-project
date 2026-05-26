import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function TransferPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    withdrawAccount: "",
    depositAccount: "",
    amount: "",
    memo: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/transfer-confirm", { state: form });
  };

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <h1>송금 요청</h1>
          <p>송금 정보를 입력한 뒤 송금 요청을 진행하세요.</p>
        </div>

        <div className="transfer-card">
          <div className="transfer-balance-box">
            <span>출금 가능 금액</span>
            <strong>10,000원</strong>
          </div>

          <form className="transfer-form" onSubmit={handleSubmit}>
            <label htmlFor="withdraw-account">출금 계좌</label>
            <select
              id="withdraw-account"
              className="transfer-select"
              name="withdrawAccount"
              value={form.withdrawAccount}
              onChange={handleChange}
            >
              <option value="">출금 계좌를 선택하세요</option>
              <option value="110-123-456789">주 계좌 110-123-456789</option>
              <option value="110-987-654321">생활비 계좌 110-987-654321</option>
            </select>

            <label htmlFor="deposit-account">입금 계좌번호</label>
            <input
              type="text"
              id="deposit-account"
              name="depositAccount"
              placeholder="예: 333-456-789000"
              value={form.depositAccount}
              onChange={handleChange}
            />

            <label htmlFor="amount">송금 금액</label>
            <input
              type="text"
              id="amount"
              name="amount"
              placeholder="송금할 금액을 입력하세요"
              value={form.amount}
              onChange={handleChange}
            />

            <label htmlFor="transfer-memo">메모</label>
            <input
              type="text"
              id="transfer-memo"
              name="memo"
              placeholder="받는 통장 표시 메모"
              value={form.memo}
              onChange={handleChange}
            />

            <button type="submit" className="transfer-submit-btn">송금 요청</button>
          </form>
        </div>
      </div>
    </div>
  );
}
