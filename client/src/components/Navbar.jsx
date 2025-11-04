import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  UserCircle,
  LogOut,
  Home,
  Users,
  Building2,
  ClipboardList,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileMenu, setProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/auth/login");
  };

  // Navigation structure (with icons)
  const nav = [
    {
      title: "Dashboard",
      path: "/",
      icon: <Home size={18} className="text-blue-600" />,
    },
    {
      title: "Users",
      icon: <Users size={18} className="text-blue-600" />,
      children: [
        { name: "Add User", path: "/user/add" },
        { name: "View Users", path: "/users" },
      ],
    },
    {
      title: "Houses",
      icon: <Building2 size={18} className="text-blue-600" />,
      children: [
        { name: "Add House", path: "/house/add" },
        { name: "View Houses", path: "/houses" },
      ],
    },
    {
      title: "Rentals",
      icon: <ClipboardList size={18} className="text-blue-600" />,
      children: [
        { name: "Add Rental", path: "/rental/add" },
        { name: "View Rentals", path: "/rentals" },
      ],
    },
  ];

  // Admin-only sections
  if (user?.role === "admin") {
    nav.push({
      title: "Messages",
      icon: <MessageSquare size={18} className="text-blue-600" />,
      children: [
        { name: "Send Message", path: "/message/send" },
        { name: "View Messages", path: "/messages" },
      ],
    });
    nav.push({
      title: "Complaints",
      icon: <AlertCircle size={18} className="text-blue-600" />,
      children: [{ name: "View Complaints", path: "/complaints" }],
    });
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 fixed w-full z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-gray-800 flex items-center gap-2"
        >
          🏢 <span className="text-blue-600">Gonye's</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8 items-center text-gray-700 font-medium">
          {nav.map((sec, index) => (
            <li key={index} className="relative group">
              {sec.path ? (
                <Link
                  to={sec.path}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  {sec.icon}
                  {sec.title}
                </Link>
              ) : (
                <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  {sec.icon}
                  {sec.title}
                  <ChevronDown size={16} />
                </button>
              )}

              {sec.children && (
                <ul
                  className="absolute left-0 mt-2 bg-white border border-gray-100 text-sm min-w-[200px] rounded-lg shadow-lg 
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                >
                  {sec.children.map((child, i) => (
                    <li key={i}>
                      <Link
                        to={child.path}
                        className="block px-5 py-2 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* Profile / Login */}
          <li className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setProfileMenu(!profileMenu)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition"
                >
                  <UserCircle size={20} className="text-gray-700" />
                  <span className="text-gray-800 font-medium">
                    {user?.name || "Admin"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      profileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileMenu && (
                  <ul className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg text-sm w-44">
                    <li>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenu(false)}
                        className="flex items-center gap-2 px-5 py-2 hover:bg-blue-50 text-gray-700"
                      >
                        <UserCircle size={16} /> Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-5 py-2 hover:bg-red-50 text-red-600"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </li>
                  </ul>
                )}
              </>
            ) : (
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-800"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-4 space-y-3 text-gray-700 font-medium">
          {nav.map((sec, index) => (
            <div key={index}>
              {sec.path ? (
                <Link
                  to={sec.path}
                  className="flex items-center gap-2 py-2 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {sec.icon}
                  {sec.title}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                    className="flex justify-between w-full items-center py-2 hover:text-blue-600"
                  >
                    <div className="flex items-center gap-2">
                      {sec.icon}
                      {sec.title}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        openDropdown === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {sec.children && openDropdown === index && (
                    <ul className="ml-4 border-l border-gray-200 pl-3 space-y-2">
                      {sec.children.map((child, i) => (
                        <li key={i}>
                          <Link
                            to={child.path}
                            className="block py-1 text-sm hover:text-blue-600"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Profile / Logout for mobile */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 hover:text-blue-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-left text-red-600 hover:text-red-700 w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="block py-2 hover:text-blue-600"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
