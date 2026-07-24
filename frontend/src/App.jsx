import { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import StaffPage from "./pages/StaffPage";
import StaffFormPage from "./pages/StaffFormPage";
import StaffDetailPage from "./pages/StaffDetailPage";
import {
  completeTask,
  createAdminNote,
  createStaff,
  fetchAdminNotes,
  fetchDashboard,
  fetchMasters,
  fetchStaff,
} from "./api/staffApi";

function normalizeStaff(apiStaff) {
  return {
    id: apiStaff.id,
    staffNumber: apiStaff.staff_number,
    name: apiStaff.name,
    kana: apiStaff.kana,
    birthDate: apiStaff.birth_date,
    age: apiStaff.age,
    facility: apiStaff.facility,
    jobType: apiStaff.job_type,
    employmentType: apiStaff.employment_type,
    position: apiStaff.position,
    corporationHireDate: apiStaff.corporation_hire_date,
    hireDate: apiStaff.hire_date,
    retirementDate: apiStaff.retirement_date,
    weeklyHours: apiStaff.weekly_hours,
    dailyHours: apiStaff.daily_hours,
    weeklyDays: apiStaff.weekly_days,
    salaryType: apiStaff.salary_type,
    yearsOfService: apiStaff.years_of_service,
    status: apiStaff.status,
    notes: apiStaff.notes,
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [masters, setMasters] = useState({ facilities: [], job_types: [], employment_types: [], statuses: [] });
  const [dashboard, setDashboard] = useState(null);
  const [adminNotes, setAdminNotes] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState("");

  async function loadAll() {
    setLoadingStaff(true);
    setStaffError("");
    try {
      const [staffData, masterData, dashboardData] = await Promise.all([
        fetchStaff(), fetchMasters(), fetchDashboard(),
      ]);
      setStaffList(staffData.map(normalizeStaff));
      setMasters(masterData);
      setDashboard(dashboardData);
    } catch (error) {
      setStaffError(error.message);
    } finally {
      setLoadingStaff(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const selectedStaff = staffList.find((staff) => staff.id === selectedStaffId) ?? null;

  const openStaffList = () => { setSelectedStaffId(null); setCurrentPage("staff"); };
  const openStaffForm = () => { setSelectedStaffId(null); setCurrentPage("staff-new"); };
  const openStaffDetail = async (staffId) => {
    setSelectedStaffId(staffId);
    setCurrentPage("staff-detail");
    try { setAdminNotes(await fetchAdminNotes(staffId)); } catch { setAdminNotes([]); }
  };

  const registerStaff = async (formData) => {
    const created = await createStaff({
      name: formData.name.trim(),
      kana: formData.kana.trim(),
      birth_date: formData.birthDate || null,
      facility: formData.facility,
      job_type: formData.jobType,
      employment_type: formData.employmentType,
      position: formData.position || null,
      corporation_hire_date: formData.corporationHireDate || null,
      hire_date: formData.hireDate,
      retirement_date: formData.retirementDate || null,
      weekly_hours: Number(formData.weeklyHours),
      daily_hours: formData.dailyHours ? Number(formData.dailyHours) : null,
      weekly_days: formData.weeklyDays ? Number(formData.weeklyDays) : null,
      salary_type: formData.salaryType || null,
      status: formData.status,
      notes: formData.notes || null,
    });
    const normalized = normalizeStaff(created);
    setStaffList((current) => [...current, normalized]);
    setSelectedStaffId(normalized.id);
    setAdminNotes([]);
    setCurrentPage("staff-detail");
    setDashboard(await fetchDashboard());
  };

  const addAdminNote = async (noteData) => {
    const created = await createAdminNote(selectedStaffId, noteData);
    setAdminNotes((current) => [created, ...current]);
  };

  const markTaskComplete = async (taskId) => {
    await completeTask(taskId);
    setDashboard(await fetchDashboard());
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main">
        <Header currentPage={currentPage} />
        {currentPage === "home" && (
          <HomePage dashboard={dashboard} error={staffError} onCompleteTask={markTaskComplete} openStaffPage={openStaffList} openStaffForm={openStaffForm} />
        )}
        {currentPage === "staff" && (
          <StaffPage masters={masters} staffList={staffList} loading={loadingStaff} error={staffError} onRetry={loadAll} onAddStaff={openStaffForm} onOpenDetail={openStaffDetail} />
        )}
        {currentPage === "staff-new" && (
          <StaffFormPage masters={masters} onCancel={openStaffList} onRegister={registerStaff} />
        )}
        {currentPage === "staff-detail" && selectedStaff && (
          <StaffDetailPage staff={selectedStaff} adminNotes={adminNotes} onAddAdminNote={addAdminNote} onBack={openStaffList} />
        )}
      </main>
    </div>
  );
}
