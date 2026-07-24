import { useMemo, useState } from "react";

const statusClass = (status) => ({
  "退職": "retired", "試用期間": "trial", "育児休業": "childcare", "産前産後休業": "maternity",
}[status] || "active");

export default function StaffPage({ masters, staffList, loading, error, onRetry, onAddStaff, onOpenDetail }) {
  const [filters, setFilters] = useState({ keyword: "", facility: "", jobType: "", employmentType: "", status: "" });
  const [sortKey, setSortKey] = useState("staffNumber");
  const [sortDirection, setSortDirection] = useState("asc");

  const filtered = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return [...staffList].filter((staff) => (
      (!keyword || [staff.staffNumber, staff.name, staff.kana].some((value) => value?.toLowerCase().includes(keyword))) &&
      (!filters.facility || staff.facility === filters.facility) &&
      (!filters.jobType || staff.jobType === filters.jobType) &&
      (!filters.employmentType || staff.employmentType === filters.employmentType) &&
      (!filters.status || staff.status === filters.status)
    )).sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      return String(av).localeCompare(String(bv), "ja", { numeric: true }) * (sortDirection === "asc" ? 1 : -1);
    });
  }, [staffList, filters, sortKey, sortDirection]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <div className="staff-toolbar"><div><h3>職員一覧</h3><p>年齢・所属・雇用状況を一覧で確認できます。</p></div><button className="primary-button" onClick={onAddStaff}>＋ 職員を登録</button></div>
      <section className="panel search-panel">
        <div className="filter-grid">
          <label>キーワード<input value={filters.keyword} onChange={(e) => update("keyword", e.target.value)} placeholder="職員番号・氏名・フリガナ" /></label>
          <label>所属園<select value={filters.facility} onChange={(e) => update("facility", e.target.value)}><option value="">すべて</option>{masters.facilities.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>職種<select value={filters.jobType} onChange={(e) => update("jobType", e.target.value)}><option value="">すべて</option>{masters.job_types.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>雇用形態<select value={filters.employmentType} onChange={(e) => update("employmentType", e.target.value)}><option value="">すべて</option>{masters.employment_types.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>状態<select value={filters.status} onChange={(e) => update("status", e.target.value)}><option value="">すべて</option>{masters.statuses.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>並び順<select value={`${sortKey}:${sortDirection}`} onChange={(e) => { const [key, dir] = e.target.value.split(":"); setSortKey(key); setSortDirection(dir); }}><option value="staffNumber:asc">職員番号順</option><option value="name:asc">氏名順</option><option value="age:asc">年齢が若い順</option><option value="age:desc">年齢が高い順</option><option value="hireDate:asc">入職日が古い順</option></select></label>
        </div>
      </section>
      <section className="panel staff-list-panel">
        <div className="table-header"><div><h3>登録職員</h3><p>{filtered.length}名を表示</p></div></div>
        {loading && <p>読み込み中です…</p>}
        {error && <div className="form-error">{error}<button onClick={onRetry}>再読み込み</button></div>}
        {!loading && !error && <div className="table-wrap"><table className="staff-table"><thead><tr><th>職員番号</th><th>氏名</th><th>年齢</th><th>所属園</th><th>職種</th><th>雇用形態</th><th>勤続年数</th><th>状態</th></tr></thead><tbody>{filtered.map((staff) => <tr key={staff.id}><td>{staff.staffNumber}</td><td><button className="name-link" onClick={() => onOpenDetail(staff.id)}>{staff.name}</button><span className="staff-kana">{staff.kana}</span></td><td>{staff.age ?? "－"}{staff.age != null ? "歳" : ""}</td><td>{staff.facility}</td><td>{staff.jobType}</td><td>{staff.employmentType}</td><td>{staff.yearsOfService ?? "－"}{staff.yearsOfService != null ? "年" : ""}</td><td><span className={`status-badge ${statusClass(staff.status)}`}>{staff.status}</span></td></tr>)}{filtered.length === 0 && <tr><td className="no-results" colSpan="8">該当する職員はいません。</td></tr>}</tbody></table></div>}
      </section>
    </>
  );
}
