export default function Sidebar({ currentPage, setCurrentPage }) {
  const staffActive = currentPage.startsWith("staff");
  return <aside className="sidebar"><div className="logo"><span className="logo-mark">🌱</span><div><h1>わかば学園</h1><p>法人ポータル</p></div></div><nav className="menu">
    <button className={`menu-item ${currentPage === "home" ? "active" : ""}`} onClick={() => setCurrentPage("home")}>🏠 ホーム</button>
    <button className={`menu-item ${staffActive ? "active" : ""}`} onClick={() => setCurrentPage("staff")}>👥 職員管理</button>
    <button className="menu-item" disabled>🏫 園管理</button><button className="menu-item" disabled>📊 法人ダッシュボード</button><button className="menu-item" disabled>📁 電子書庫</button><button className="menu-item" disabled>⚙️ システム設定</button>
  </nav></aside>;
}
