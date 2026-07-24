export default function HomePage({ dashboard, error, onCompleteTask, openStaffPage, openStaffForm }) {
  if (error) return <section className="panel form-error">{error}</section>;
  if (!dashboard) return <section className="panel">読み込み中です…</section>;

  return (
    <>
      <section className="welcome">
        <div><p className="welcome-label">WAKABA GAKUEN PORTAL</p><h3>今日の業務を、ここから確認</h3><p>期限・誕生日・定年対象を一画面で確認できます。</p></div>
        <div className="welcome-icon">🌱</div>
      </section>

      <section className="summary-grid">
        <article className="summary-card"><span className="card-icon">👥</span><div><p>在職職員</p><strong>{dashboard.active_staff_count}名</strong></div></article>
        <article className="summary-card"><span className="card-icon">🏫</span><div><p>施設数</p><strong>{dashboard.facility_count}</strong></div></article>
        <article className="summary-card"><span className="card-icon">🍼</span><div><p>産休・育休中</p><strong>{dashboard.leave_count}名</strong></div></article>
        <article className="summary-card"><span className="card-icon">🚪</span><div><p>今年の退職</p><strong>{dashboard.retired_this_year}名</strong></div></article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header"><h3>📌 今日やること</h3><p className="subtle">期限超過は赤く表示されます。</p></div>
          <div className="task-list">
            {dashboard.tasks.length === 0 && <div className="empty-message">現在、未完了の予定はありません。</div>}
            {dashboard.tasks.map((task) => (
              <div className={`task-item ${task.overdue ? "overdue" : ""}`} key={task.id}>
                <div><span className="task-category">{task.category}</span><strong>{task.title}</strong><p>{task.due_date}{task.staff_name ? `・${task.staff_name}` : ""}</p></div>
                <button className="small-button" onClick={() => onCompleteTask(task.id)}>完了</button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header"><h3>🎂 今月の誕生日</h3></div>
          <div className="notice-list">
            {dashboard.birthdays.length === 0 && <p className="subtle">今月の対象者はいません。</p>}
            {dashboard.birthdays.map((item) => <div key={item.id}><strong>{item.date}　{item.name}</strong><span>{item.facility}</span></div>)}
          </div>
          <div className="panel-header section-gap"><h3>👴 定年アラート</h3></div>
          <div className="notice-list">
            {dashboard.retirement_alerts.length === 0 && <p className="subtle">対象者はいません。</p>}
            {dashboard.retirement_alerts.map((item) => <div key={item.id}><strong>{item.name}（{item.age}歳）</strong><span>{item.facility}</span></div>)}
          </div>
        </article>
      </section>

      <section className="panel facilities">
        <div className="panel-header"><h3>📊 園別職員数</h3></div>
        <div className="facility-list">{Object.entries(dashboard.facility_counts).map(([name, count]) => <span key={name}><strong>{name}</strong><b>{count}名</b></span>)}</div>
      </section>

      <section className="panel facilities">
        <div className="panel-header"><h3>クイック操作</h3></div>
        <div className="quick-grid"><button className="quick-button" onClick={openStaffForm}>＋ 職員を登録</button><button className="quick-button" onClick={openStaffPage}>👥 職員一覧を開く</button></div>
      </section>
    </>
  );
}
