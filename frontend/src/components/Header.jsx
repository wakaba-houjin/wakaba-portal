const titles = {
  home: ["HOME", "わかば学園ポータル"],
  staff: ["STAFF", "職員管理"],
  "staff-new": ["STAFF", "職員登録"],
  "staff-detail": ["STAFF", "職員詳細"],
};

export default function Header({ currentPage }) {
  const [label, title] = titles[currentPage] ?? titles.home;

  return (
    <header className="header">
      <div>
        <p className="page-label">{label}</p>
        <h2>{title}</h2>
      </div>

      <div className="user-box">
        <span className="user-icon">👤</span>
        <div>
          <strong>管理者</strong>
          <p>法人本部</p>
        </div>
      </div>
    </header>
  );
}
