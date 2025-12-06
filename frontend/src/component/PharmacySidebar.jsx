import React, { useState } from "react";
import {
  Menu,
  X,
  User,
  Home,
  CalendarDays,
  LogOut,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ChatBot from "./ChatBot.jsx";
import { useAuth } from "../context/AuthContext";

const PharmacySidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const navItemClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md ${
      location.pathname === path
        ? "bg-[#F26522]/20 text-[#F26522]"
        : "text-gray-700 hover:bg-[#F26522]/10"
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Topbar */}
      <div className="lg:hidden w-full fixed top-0 left-0 bg-white shadow-md px-4 py-3 z-50 flex justify-between items-center">
        <div className="text-xl font-bold text-[#F26522]">
          E-Health <span className="text-black">track.lk</span>
        </div>
        <button onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar content */}
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-[#F26522]">
              E-Health <span className="text-black">track.lk</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/pharmacyDashboard"
              className={navItemClass("/pharmacyDashboard")}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            {/* <Link to="/pharmacyChat" className={navItemClass("/pharmacyChat")}>
              <MessageSquare className="w-5 h-5" />
              Chat
            </Link> */}
          </nav>

          {/* Profile section */}
          <div className="absolute bottom-0 w-full border-t">
            <div className="relative px-4 py-4">
              <button
                onClick={toggleProfileMenu}
                className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md"
              >
                <User className="w-5 h-5 text-[#F26522]" />
                {user?.pharmacyName || "User Name"}
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute bottom-16 left-4 w-56 bg-white border rounded-md shadow-md z-50">
                  <Link
                    to="/pharmacyProfile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col mt-[64px] lg:mt-0 overflow-y-auto">
        {/* If children are passed (e.g., from dashboard/profile), render them */}
        <main className="p-6">{children}</main>
      </div>

      <ChatBot />
    </div>
  );
};

export default PharmacySidebar;
