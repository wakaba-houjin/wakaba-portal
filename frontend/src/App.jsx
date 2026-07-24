import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import StaffPage from "./pages/StaffPage";
import StaffFormPage from "./pages/StaffFormPage";
import StaffDetailPage from "./pages/StaffDetailPage";
import FacilityPage from "./pages/FacilityPage";
import FacilityDetailPage from "./pages/FacilityDetailPage";
import FacilityFormPage from "./pages/FacilityFormPage";
import { facilities as initialFacilities } from "./data/facilities";
import ChildrenPage from "./pages/ChildrenPage";

import {
  completeTask,
  createAdminNote,
  createStaff,
  fetchAdminNotes,
  fetchDashboard,
  fetchMasters,
  fetchStaff,
  updateStaff,
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

function toApiStaff(formData) {
  return {
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
    daily_hours: formData.dailyHours
      ? Number(formData.dailyHours)
      : null,
    weekly_days: formData.weeklyDays
      ? Number(formData.weeklyDays)
      : null,
    salary_type: formData.salaryType || null,
    status: formData.status,
    notes: formData.notes || null,
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [facilityList, setFacilityList] = useState(() => {
    const saved = localStorage.getItem("wakaba-facilities");
    return saved ? JSON.parse(saved) : initialFacilities;
  });

  const [masters, setMasters] = useState({
    facilities: [],
    job_types: [],
    employment_types: [],
    statuses: [],
  });

  const [dashboard, setDashboard] = useState(null);
  const [adminNotes, setAdminNotes] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState("");

  const selectedStaff =
    staffList.find((staff) => staff.id === selectedStaffId) ?? null;

  async function loadAll() {
    setLoadingStaff(true);
    setStaffError("");

    try {
      const [staffData, masterData, dashboardData] = await Promise.all([
        fetchStaff(),
        fetchMasters(),
        fetchDashboard(),
      ]);

      setStaffList(staffData.map(normalizeStaff));
      setMasters(masterData);
      setDashboard(dashboardData);
    } catch (error) {
      setStaffError(error.message || "データの取得に失敗しました。");
    } finally {
      setLoadingStaff(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    localStorage.setItem("wakaba-facilities", JSON.stringify(facilityList));
  }, [facilityList]);

  const openStaffList = () => {
    setSelectedStaffId(null);
    setAdminNotes([]);
    setCurrentPage("staff");
  };

  const openStaffForm = () => {
    setSelectedStaffId(null);
    setAdminNotes([]);
    setCurrentPage("staff-new");
  };

  const openStaffDetail = async (staffId) => {
    setSelectedStaffId(staffId);
    setCurrentPage("staff-detail");

    try {
      const notes = await fetchAdminNotes(staffId);
      setAdminNotes(notes);
    } catch {
      setAdminNotes([]);
    }
  };

  const openStaffEdit = (staffId) => {
    setSelectedStaffId(staffId);
    setCurrentPage("staff-edit");
  };

  const openFacilityDetail = (facilityId) => {
    setSelectedFacilityId(facilityId);
    setCurrentPage("facility-detail");
  };

  const openFacilityEdit = () => {
    setCurrentPage("facility-edit");
  };

  const saveFacilityEdit = (formData) => {
    setFacilityList((current) => current.map((item) => item.id === selectedFacilityId ? { ...item, ...formData, capacity: Number(formData.capacity) } : item));
    setCurrentPage("facility-detail");
  };

  const openFacilityList = () => {
    setSelectedFacilityId(null);
    setCurrentPage("facility");
  };

  const registerStaff = async (formData) => {
    const created = await createStaff(toApiStaff(formData));
    const normalized = normalizeStaff(created);

    setStaffList((current) => [...current, normalized]);
    setSelectedStaffId(normalized.id);
    setAdminNotes([]);
    setDashboard(await fetchDashboard());
    setCurrentPage("staff-detail");
  };

  const saveStaffEdit = async (formData) => {
    if (!selectedStaffId) {
      throw new Error("編集対象の職員が選択されていません。");
    }

    const updated = await updateStaff(
      selectedStaffId,
      toApiStaff(formData)
    );

    const normalized = normalizeStaff(updated);

    setStaffList((current) =>
      current.map((staff) =>
        staff.id === normalized.id ? normalized : staff
      )
    );

    setSelectedStaffId(normalized.id);
    setDashboard(await fetchDashboard());
    setCurrentPage("staff-detail");
  };

  const addAdminNote = async (noteData) => {
    if (!selectedStaffId) {
      throw new Error("対象の職員が選択されていません。");
    }

    const created = await createAdminNote(
      selectedStaffId,
      noteData
    );

    setAdminNotes((current) => [created, ...current]);
  };

  const markTaskComplete = async (taskId) => {
    await completeTask(taskId);
    setDashboard(await fetchDashboard());
  };

  return (
    <div className="app">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main">
        <Header currentPage={currentPage} />

        {currentPage === "home" && (
          <HomePage
            dashboard={dashboard}
            error={staffError}
            onCompleteTask={markTaskComplete}
            openStaffPage={openStaffList}
            openStaffForm={openStaffForm}
          />
        )}

        {currentPage === "staff" && (
          <StaffPage
            masters={masters}
            staffList={staffList}
            loading={loadingStaff}
            error={staffError}
            onRetry={loadAll}
            onAddStaff={openStaffForm}
            onOpenDetail={openStaffDetail}
          />
        )}

        {currentPage === "staff-new" && (
          <StaffFormPage
            masters={masters}
            onCancel={openStaffList}
            onRegister={registerStaff}
            mode="new"
          />
        )}

        {currentPage === "staff-edit" && selectedStaff && (
          <StaffFormPage
            masters={masters}
            initialStaff={selectedStaff}
            onCancel={() => openStaffDetail(selectedStaff.id)}
            onRegister={saveStaffEdit}
            mode="edit"
          />
        )}

        {currentPage === "staff-detail" && selectedStaff && (
          <StaffDetailPage
            staff={selectedStaff}
            adminNotes={adminNotes}
            onAddAdminNote={addAdminNote}
            onBack={openStaffList}
            onEdit={() => openStaffEdit(selectedStaff.id)}
          />
        )}

        {currentPage === "facility" && (
          <FacilityPage facilities={facilityList} onOpenDetail={openFacilityDetail} />
        )}

        {currentPage === "facility-detail" &&
          selectedFacilityId !== null && (
            <FacilityDetailPage
              facility={facilityList.find((item) => item.id === Number(selectedFacilityId))}
              staffList={staffList}
              onBack={openFacilityList}
              onEdit={openFacilityEdit}
            />
          )}
        
        {currentPage === "children" && <ChildrenPage />}

        {currentPage === "facility-edit" && selectedFacilityId !== null && (
          <FacilityFormPage
            facility={facilityList.find((item) => item.id === Number(selectedFacilityId))}
            onCancel={() => setCurrentPage("facility-detail")}
            onSave={saveFacilityEdit}
          />
        )}
      </main>
    </div>
  );
}