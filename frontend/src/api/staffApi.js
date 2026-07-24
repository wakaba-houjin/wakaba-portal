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
