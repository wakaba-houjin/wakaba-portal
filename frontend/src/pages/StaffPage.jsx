import { useEffect, useMemo, useState } from "react";

const statusClass = (status) =>
  ({
    退職: "retired",
    試用期間: "trial",
    育児休業: "childcare",
    産前産後休業: "maternity",
  }[status] || "active");

const csvValue = (value) => {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

export default function StaffPage({
  masters,
  staffList,
  loading,
  error,
  onRetry,
  onAddStaff,
  onOpenDetail,
}) {
  const [filters, setFilters] = useState({
    keyword: "",
    facility: "",
    jobType: "",
    employmentType: "",
    status: "",
  });

  const [sortKey, setSortKey] = useState("staffNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeOnly, setActiveOnly] = useState(false);

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return [...staffList]
      .filter((staff) => {
        const keywordMatch =
          !keyword ||
          [staff.staffNumber, staff.name, staff.kana].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(keyword)
          );

        return (
          keywordMatch &&
          (!filters.facility || staff.facility === filters.facility) &&
          (!filters.jobType || staff.jobType === filters.jobType) &&
          (!filters.employmentType ||
            staff.employmentType === filters.employmentType) &&
          (!filters.status || staff.status === filters.status) &&
          (!activeOnly || staff.status !== "退職")
        );
      })
      .sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";

        return (
          String(av).localeCompare(String(bv), "ja", {
            numeric: true,
          }) * (sortDirection === "asc" ? 1 : -1)
        );
      });
  }, [
    staffList,
    filters,
    sortKey,
    sortDirection,
    activeOnly,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const displayList = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters,
    sortKey,
    sortDirection,
    activeOnly,
    pageSize,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      facility: "",
      jobType: "",
      employmentType: "",
      status: "",
    });

    setSortKey("staffNumber");
    setSortDirection("asc");
    setActiveOnly(false);
    setCurrentPage(1);
  };

  const exportCsv = () => {
    const headers = [
      "職員番号",
      "氏名",
      "フリガナ",
      "年齢",
      "所属園",
      "職種",
      "雇用形態",
      "入職日",
      "勤続年数",
      "退職日",
      "状態",
    ];

    const rows = filtered.map((staff) => [
      staff.staffNumber,
      staff.name,
      staff.kana,
      staff.age,
      staff.facility,
      staff.jobType,
      staff.employmentType,
      staff.hireDate,
      staff.yearsOfService,
      staff.retirementDate,
      staff.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvValue).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "職員一覧.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const firstPage = Math.max(1, currentPage - 2);
    const lastPage = Math.min(totalPages, currentPage + 2);

    for (let page = firstPage; page <= lastPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <>
  <div className="staff-toolbar">
    <button
      type="button"
      className="primary-button"
      onClick={onAddStaff}
    >
      ＋ 職員を登録
    </button>
  </div>

      <section className="panel search-panel">
        <div className="search-panel-heading">
          <div>
            <h3>職員を検索</h3>
            <p>条件を指定して職員を絞り込めます。</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={resetFilters}
          >
            条件をリセット
          </button>
        </div>

        <div className="staff-filter-grid">
          <label className="keyword-filter">
            キーワード
            <input
              value={filters.keyword}
              onChange={(event) =>
                updateFilter("keyword", event.target.value)
              }
              placeholder="職員番号・氏名・フリガナ"
            />
          </label>

          <label>
            所属園
            <select
              value={filters.facility}
              onChange={(event) =>
                updateFilter("facility", event.target.value)
              }
            >
              <option value="">すべて</option>
              {masters.facilities.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            職種
            <select
              value={filters.jobType}
              onChange={(event) =>
                updateFilter("jobType", event.target.value)
              }
            >
              <option value="">すべて</option>
              {masters.job_types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            雇用形態
            <select
              value={filters.employmentType}
              onChange={(event) =>
                updateFilter("employmentType", event.target.value)
              }
            >
              <option value="">すべて</option>
              {masters.employment_types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            状態
            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter("status", event.target.value)
              }
            >
              <option value="">すべて</option>
              {masters.statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            並び順
            <select
              value={`${sortKey}:${sortDirection}`}
              onChange={(event) => {
                const [key, direction] =
                  event.target.value.split(":");

                setSortKey(key);
                setSortDirection(direction);
              }}
            >
              <option value="staffNumber:asc">
                職員番号順
              </option>
              <option value="name:asc">
                氏名順
              </option>
              <option value="age:asc">
                年齢が若い順
              </option>
              <option value="age:desc">
                年齢が高い順
              </option>
              <option value="hireDate:asc">
                入職日が古い順
              </option>
              <option value="hireDate:desc">
                入職日が新しい順
              </option>
            </select>
          </label>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(event) =>
                setActiveOnly(event.target.checked)
              }
            />
            在職者のみ表示
          </label>
        </div>
      </section>

      <section className="panel staff-list-panel">
        <div className="staff-list-header">
          <div>
            <h3>登録職員</h3>
            <p>
              全 {filtered.length} 名
              {filtered.length > 0 && (
                <>
                  {" "}
                  ／ {startIndex + 1}～{" "}
                  {Math.min(endIndex, filtered.length)} 名を表示
                </>
              )}
            </p>
          </div>

          <div className="staff-list-actions">
            <select
              aria-label="表示件数"
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value))
              }
            >
              <option value={10}>10件</option>
              <option value={20}>20件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
            </select>

            <button
              type="button"
              className="secondary-button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
            >
              CSV出力
            </button>
          </div>
        </div>

        {loading && (
          <div className="state-message">
            読み込み中です…
          </div>
        )}

        {error && (
          <div className="form-error">
            <span>{error}</span>
            <button
              type="button"
              className="secondary-button"
              onClick={onRetry}
            >
              再読み込み
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>職員番号</th>
                    <th>氏名</th>
                    <th>フリガナ</th>
                    <th>年齢</th>
                    <th>所属園</th>
                    <th>職種</th>
                    <th>雇用形態</th>
                    <th>入職日</th>
                    <th>勤続年数</th>
                    <th>退職日</th>
                    <th>状態</th>
                    <th>詳細</th>
                  </tr>
                </thead>

                <tbody>
                  {displayList.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.staffNumber || "－"}</td>

                      <td>
                        <button
                          type="button"
                          className="name-link"
                          onClick={() =>
                            onOpenDetail(staff.id)
                          }
                        >
                          {staff.name || "－"}
                        </button>
                      </td>

                      <td title={staff.kana || ""}>
                        {staff.kana || "－"}
                      </td>

                      <td>
                        {staff.age ?? "－"}
                        {staff.age != null ? "歳" : ""}
                      </td>

                      <td title={staff.facility || ""}>
                        {staff.facility || "－"}
                      </td>

                      <td>{staff.jobType || "－"}</td>

                      <td>
                        {staff.employmentType || "－"}
                      </td>

                      <td>{staff.hireDate || "－"}</td>

                      <td>
                        {staff.yearsOfService ?? "－"}
                        {staff.yearsOfService != null
                          ? "年"
                          : ""}
                      </td>

                      <td>
                        {staff.retirementDate || "－"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${statusClass(
                            staff.status
                          )}`}
                        >
                          {staff.status || "－"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="detail-button"
                          onClick={() =>
                            onOpenDetail(staff.id)
                          }
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        className="no-results"
                        colSpan="12"
                      >
                        条件に該当する職員はいません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                >
                  前へ
                </button>

                <div className="pagination-pages">
                  {pageNumbers.map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={`pagination-number ${
                        currentPage === page
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
