import { useState } from "react";
import { retireStaff } from "../api/staffApi";

export default function StaffDetailPage({
  staff,
  adminNotes,
  onAddAdminNote,
  onBack,
  onEdit,
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRetireDialog, setShowRetireDialog] = useState(false);

const [retirementDate, setRetirementDate] = useState(
  new Date().toISOString().slice(0, 10)
);

const retire = async () => {
  if (!window.confirm("この職員を退職にしますか？")) {
    return;
  }

  try {
    await retireStaff(staff.id, retirementDate);

    alert("退職処理が完了しました。");

    setShowRetireDialog(false);
    onBack();
  } catch (error) {
    alert(error.message);
  }
};
  const submitNote = async (event) => {
    event.preventDefault();

    if (!note.trim()) {
      return;
    }

    setSaving(true);

    try {
      await onAddAdminNote({
        note_type: "管理者メモ",
        content: note.trim(),
        visibility: "法人本部",
      });

      setNote("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="detail-topbar">
        <button
          className="secondary-button"
          type="button"
          onClick={onBack}
        >
          ← 職員一覧へ戻る
        </button>

        <button
          className="primary-button"
          type="button"
          onClick={onEdit}
        >
          編集する
        </button>
        <button
  className="primary-button"
  type="button"
  onClick={() => setShowRetireDialog(true)}
>
  退職処理
</button>
      </div>

      <section className="panel staff-profile">
        <div className="profile-heading">
          <div className="profile-icon">👤</div>

          <div>
            <p className="profile-id">{staff.staffNumber}</p>
            <h3>{staff.name}</h3>
            <p>{staff.kana}</p>
          </div>

          <span className="status-badge">{staff.status}</span>
        </div>

        <div className="detail-grid">
          <div>
            <span>年齢</span>
            <strong>
              {staff.age ?? "－"}
              {staff.age != null ? "歳" : ""}
            </strong>
          </div>

          <div>
            <span>生年月日</span>
            <strong>{staff.birthDate || "－"}</strong>
          </div>

          <div>
            <span>所属園</span>
            <strong>{staff.facility}</strong>
          </div>

          <div>
            <span>職種</span>
            <strong>{staff.jobType}</strong>
          </div>

          <div>
            <span>役職</span>
            <strong>{staff.position || "－"}</strong>
          </div>

          <div>
            <span>雇用形態</span>
            <strong>{staff.employmentType}</strong>
          </div>

          <div>
            <span>法人採用日</span>
            <strong>{staff.corporationHireDate || "－"}</strong>
          </div>

          <div>
            <span>入職日</span>
            <strong>{staff.hireDate}</strong>
          </div>

          <div>
            <span>退職日</span>
            <strong>{staff.retirementDate || "－"}</strong>
          </div>

          <div>
            <span>勤続年数</span>
            <strong>
              {staff.yearsOfService ?? "－"}
              {staff.yearsOfService != null ? "年" : ""}
            </strong>
          </div>

          <div>
            <span>週勤務時間</span>
            <strong>{staff.weeklyHours}時間</strong>
          </div>

          <div>
            <span>1日勤務時間</span>
            <strong>
              {staff.dailyHours != null
                ? `${staff.dailyHours}時間`
                : "－"}
            </strong>
          </div>

          <div>
            <span>週勤務日数</span>
            <strong>{staff.weeklyDays ?? "－"}</strong>
          </div>

          <div>
            <span>給与形態</span>
            <strong>{staff.salaryType || "－"}</strong>
          </div>

          <div className="full-width">
            <span>備考</span>
            <strong>{staff.notes || "－"}</strong>
          </div>
        </div>
      </section>

      <section className="detail-card-grid">
        <article className="panel">
          <h3>🔒 管理者メモ</h3>

          <p className="privacy-note">
            法人本部・権限を持つ管理者のみ閲覧する想定です。
            個人情報や健康情報など不要な内容は入力しないでください。
          </p>

          <form onSubmit={submitNote}>
            <textarea
              className="note-textarea"
              rows="4"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="業務上必要な引継ぎ事項など"
            />

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "保存中…" : "メモを追加"}
            </button>
          </form>

          <div className="admin-note-list">
            {adminNotes.length === 0 && (
              <p className="subtle">
                登録されたメモはありません。
              </p>
            )}

            {adminNotes.map((item) => (
              <div key={item.id}>
                <strong>{item.note_type}</strong>
                <p>{item.content}</p>
                <small>
                  {new Date(item.created_at).toLocaleString("ja-JP")}
                  ・{item.visibility}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel future-card">
          <h3>🎓 資格・研修</h3>
          <p>
            資格証、研修受講歴、修了証を次の段階で追加します。
          </p>
        </article>

        <article className="panel future-card">
          <h3>📄 添付書類</h3>
          <p>
            雇用契約書、前歴証明書、健康診断等を管理予定です。
          </p>
        </article>

        <article className="panel future-card">
          <h3>⏰ 履歴</h3>
          <p>
            所属・役職・勤務条件の変更履歴を管理予定です。
          </p>
        </article>
      </section>
    {showRetireDialog && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>退職処理</h3>

      <label>退職日</label>

      <input
        type="date"
        value={retirementDate}
        onChange={(e) => setRetirementDate(e.target.value)}
      />

      <div className="modal-buttons">
        <button
          type="button"
          onClick={() => setShowRetireDialog(false)}
        >
          キャンセル
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={retire}
        >
          退職する
        </button>
      </div>
    </div>
  </div>
)}
</>
  );
}