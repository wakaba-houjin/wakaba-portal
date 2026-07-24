import { useState } from "react";

const initialForm = { name: "", kana: "", birthDate: "", facility: "", jobType: "", employmentType: "", position: "", corporationHireDate: "", hireDate: "", retirementDate: "", weeklyHours: "", dailyHours: "", weeklyDays: "", salaryType: "", status: "在職", notes: "" };

export default function StaffFormPage({ masters, onCancel, onRegister }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError("");
    if (!form.name.trim() || !form.kana.trim() || !form.facility || !form.jobType || !form.employmentType || !form.hireDate || !form.weeklyHours) {
      setError("必須項目をすべて入力してください。"); return;
    }
    setSubmitting(true);
    try { await onRegister(form); } catch (e) { setError(e.message); } finally { setSubmitting(false); }
  };

  return <section className="panel form-panel"><div className="form-heading"><h3>職員を新規登録</h3><p>職員番号は保存時にWK形式で自動採番されます。架空データで確認してください。</p></div><form onSubmit={handleSubmit}>{error && <div className="form-error">{error}</div>}<div className="form-grid">
    <label>氏名 <span className="required">必須</span><input value={form.name} onChange={(e) => updateField("name", e.target.value)} /></label>
    <label>フリガナ <span className="required">必須</span><input value={form.kana} onChange={(e) => updateField("kana", e.target.value)} /></label>
    <label>生年月日<input type="date" value={form.birthDate} onChange={(e) => updateField("birthDate", e.target.value)} /></label>
    <label>所属園 <span className="required">必須</span><select value={form.facility} onChange={(e) => updateField("facility", e.target.value)}><option value="">選択してください</option>{masters.facilities.map((v) => <option key={v}>{v}</option>)}</select></label>
    <label>職種 <span className="required">必須</span><select value={form.jobType} onChange={(e) => updateField("jobType", e.target.value)}><option value="">選択してください</option>{masters.job_types.map((v) => <option key={v}>{v}</option>)}</select></label>
    <label>雇用形態 <span className="required">必須</span><select value={form.employmentType} onChange={(e) => updateField("employmentType", e.target.value)}><option value="">選択してください</option>{masters.employment_types.map((v) => <option key={v}>{v}</option>)}</select></label>
    <label>役職<input value={form.position} onChange={(e) => updateField("position", e.target.value)} /></label>
    <label>法人採用日<input type="date" value={form.corporationHireDate} onChange={(e) => updateField("corporationHireDate", e.target.value)} /></label>
    <label>入職日 <span className="required">必須</span><input type="date" value={form.hireDate} onChange={(e) => updateField("hireDate", e.target.value)} /></label>
    <label>退職日<input type="date" value={form.retirementDate} onChange={(e) => updateField("retirementDate", e.target.value)} /></label>
    <label>週勤務時間 <span className="required">必須</span><input type="number" step="0.25" value={form.weeklyHours} onChange={(e) => updateField("weeklyHours", e.target.value)} /></label>
    <label>1日勤務時間<input type="number" step="0.25" value={form.dailyHours} onChange={(e) => updateField("dailyHours", e.target.value)} /></label>
    <label>週勤務日数<input type="number" step="0.5" value={form.weeklyDays} onChange={(e) => updateField("weeklyDays", e.target.value)} /></label>
    <label>給与形態<select value={form.salaryType} onChange={(e) => updateField("salaryType", e.target.value)}><option value="">選択してください</option><option>月給</option><option>時給</option><option>日給</option></select></label>
    <label>在職状況<select value={form.status} onChange={(e) => updateField("status", e.target.value)}>{masters.statuses.map((v) => <option key={v}>{v}</option>)}</select></label>
    <label className="full-width">備考<textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows="4" /></label>
  </div><div className="form-actions"><button className="secondary-button" type="button" onClick={onCancel}>キャンセル</button><button className="primary-button" disabled={submitting}>{submitting ? "登録中…" : "登録する"}</button></div></form></section>;
}
