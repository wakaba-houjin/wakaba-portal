const API_BASE_URL = "http://localhost:8000";

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    let message = "処理に失敗しました。";
    try {
      const error = await response.json();
      message = error.detail ?? message;
    } catch {
      // JSON以外は共通メッセージを使う
    }
    throw new Error(message);
  }
  return response.json();
}

export const fetchMasters = () => request("/masters");
export const fetchDashboard = () => request("/dashboard");
export const fetchStaff = () => request("/staff");
export const createStaff = (staffData) => request("/staff", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(staffData),
});
export const fetchAdminNotes = (staffId) => request(`/staff/${staffId}/admin-notes`);
export const createAdminNote = (staffId, noteData) => request(`/staff/${staffId}/admin-notes`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(noteData),
});
export const completeTask = (taskId) => request(`/tasks/${taskId}/complete`, { method: "PATCH" });
export async function updateStaff(staffId, staffData) {
  const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail || "職員情報の更新に失敗しました。"
    );
  }

  return response.json();
}
    


export async function retireStaff(staffId, retirementDate) {
  const response = await fetch(
    `http://localhost:8000/staff/${staffId}/retire?retirement_date=${retirementDate}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("退職処理に失敗しました。");
  }

  return response.json();
}
// =========================
// 園児管理 API
// =========================

export async function fetchChildren(year, month) {
  const response = await fetch(
    `http://localhost:8000/children?year=${year}&month=${month}`
  );

  if (!response.ok) {
    throw new Error("園児データの取得に失敗しました。");
  }

  return await response.json();
}

export async function createChildren(data) {
  const response = await fetch(
    "http://localhost:8000/children",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("保存に失敗しました。");
  }

  return await response.json();
}

export async function updateChildren(id, data) {
  const response = await fetch(
    `http://localhost:8000/children/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("更新に失敗しました。");
  }

  return await response.json();
}

export async function deleteChildren(id) {
  const response = await fetch(
    `http://localhost:8000/children/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("削除に失敗しました。");
  }

  return true;
}