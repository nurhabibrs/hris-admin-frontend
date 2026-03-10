import { useNavigate } from "react-router-dom";
import ReactLogo from "../assets/react.svg";

type NavTab = {
  id: string;
  label: string;
};

type SidebarProps = {
  tabs?: NavTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

function getTabIcon(tabId: string) {
  switch (tabId) {
    case "dashboard":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
  }
}

export default function Sidebar({ tabs, activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "w-64" : "w-0 lg:w-16"}`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 min-w-0"
          >
            <img src={ReactLogo} alt="Logo" className="w-8 h-8 flex-shrink-0" />
            <span
              className={`text-sm font-bold text-slate-900 text-left transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              HRIS Admin Company Manager
            </span>
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {tabs?.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              title={!isOpen ? tab.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 mb-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-red-50 text-red-600 border-r-2 border-red-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {getTabIcon(tab.id)}
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-2 flex-shrink-0">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
