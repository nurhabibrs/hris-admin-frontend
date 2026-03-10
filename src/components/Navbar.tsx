import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ReactLogo from "../assets/react.svg";

type NavTab = {
  id: string;
  label: string;
};

type NavbarProps = {
  tabs?: NavTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
};

export default function Navbar({ tabs, activeTab, onTabChange }: NavbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = async () => {
    useAuthStore.getState().logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <button
          className="flex items-center gap-2 min-w-0"
          onClick={() => navigate("/")}
        >
          <img src={ReactLogo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm sm:text-base font-bold text-slate-900 truncate">HRIS Company</span>
          </div>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative flex items-center space-x-2 sm:space-x-3" ref={dropdownRef}>
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[150px] lg:max-w-[200px]">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-slate-500 truncate max-w-[150px] lg:max-w-[200px]">
                {user?.email ?? ""}
              </p>
            </div>

            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white font-semibold flex items-center justify-center hover:bg-red-700 transition-colors relative flex-shrink-0"
            >
              {user?.photo_url ? (
                <img src={user.photo_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-sm sm:text-base">{userInitials}</span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="md:hidden px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name ?? "User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email ?? ""}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {tabs && tabs.length > 0 && (
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};