import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import AttendanceSummary from "../components/AttendanceSummary";
import EmployeeManagement from "../components/EmployeeManagement";
import { socket } from "../services/socket";
import { toast } from "react-toastify";

const TABS = [
  { id: "dashboard", label: "Beranda" },
  { id: "employee", label: "Karyawan" },
  { id: "summary", label: "Rekap Presensi" }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    socket.on("admin-notification", (data): void => {
      toast.warn(data.message);
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      <Navbar sidebarOpen={sidebarOpen} onSidebarToggle={toggleSidebar} />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-0 lg:ml-16"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "summary" && <AttendanceSummary />}
          {activeTab === "employee" && <EmployeeManagement />}
        </div>
      </main>
    </div>
  );
}
