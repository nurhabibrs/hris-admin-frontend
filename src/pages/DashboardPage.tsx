import { useState } from "react";
import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";

const TABS = [
  { id: "dashboard", label: "Beranda" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      <Navbar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pt-24 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
          {activeTab === "dashboard" && <Dashboard />}
        </div>
      </div>
    </>
  );
}