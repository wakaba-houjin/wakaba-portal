const titles = {
  home: ["", "わかば学園ポータル"],
  staff: ["", "職員管理"],
  "staff-new": ["", "職員登録"],
  "staff-detail": ["", "職員詳細"],
  "staff-edit": ["", "職員情報を編集"],
  facility: ["", "園管理"],
  "facility-detail": ["", "園詳細"],
  "facility-edit": ["", "園情報を編集"],
};

export default function Header({ currentPage }) {
  const [label, title] = titles[currentPage] ?? titles.home;

  return (
    <header className="header">
      <div>
        {label && <p className="page-label">{label}</p>}
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
