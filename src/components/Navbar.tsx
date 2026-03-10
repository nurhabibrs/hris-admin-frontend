import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type NavbarProps = {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
};

export default function Navbar({ sidebarOpen, onSidebarToggle }: NavbarProps) {
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
    <header
      className={`fixed top-0 right-0 h-16 bg-white shadow-sm border-b border-slate-200 z-30 flex items-center justify-between px-4 transition-all duration-300 ease-in-out
        ${sidebarOpen ? "left-64" : "left-0 lg:left-16"}`}
    >
      <button
        onClick={onSidebarToggle}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
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
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white font-semibold flex items-center justify-center hover:bg-red-700 transition-colors flex-shrink-0"
        >
          {user?.photo_url ? (
            <img src={user.photo_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-sm">{userInitials}</span>
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
    </header>
  );
}