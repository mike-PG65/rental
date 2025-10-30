import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, UserCircle, LogOut } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileMenu, setProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/auth/login");
  };

  const nav = [
    { title: "Dashboard", path: "/" },
    {
      title: "Users",
      children: [
        { name: "Add User", path: "/user/add" },
        { name: "View Users", path: "/users" },
      ],
    },
    {
      title: "Houses",
      children: [
        { name: "Add House", path: "/house/add" },
        { name: "View Houses", path: "/houses" },
      ],
    },
    {
      title: "Rentals",
      children: [
        { name: "Add Rental", path: "/rental/add" },
        { name: "View Rentals", path: "/rentals" },
      ],
    },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-400">
          Jeffika Admin
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8 items-center">
          {nav.map((sec, index) => (
            <li key={index} className="relative group">
              {/* Top-level item */}
              {sec.path ? (
                <Link
                  to={sec.path}
                  className="hover:text-blue-400 transition-colors font-medium"
                >
                  {sec.title}
                </Link>
              ) : (
                <button
                  className="flex items-center gap-1 font-medium hover:text-blue-400 transition-colors"
                >
                  {sec.title}
                  <ChevronDown size={16} />
                </button>
              )}

              {/* Dropdown */}
              {sec.children && (
                <ul
                  className="absolute left-0 mt-2 bg-gray-800 text-sm min-w-[180px] rounded-lg shadow-xl 
                  border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                  transition-all duration-200 ease-in-out"
                >
                  {sec.children.map((child, i) => (
                    <li key={i}>
                      <Link
                        to={child.path}
                        className="block px-5 py-2 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* Profile Dropdown */}
          <li className="relative">
            <button
              onClick={() => setProfileMenu(!profileMenu)}
              className="flex items-center gap-2 hover:text-blue-400 font-medium transition-colors"
            >
              <UserCircle size={24} />
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  profileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileMenu && (
              <ul
                className="absolute right-0 mt-3 bg-gray-800 text-sm min-w-[180px] rounded-lg shadow-xl border border-gray-700 z-50"
              >
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-5 py-2 hover:bg-blue-600 hover:text-white transition-all"
                    onClick={() => setProfileMenu(false)}
                  >
                    <UserCircle size={16} />
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-5 py-2 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden focus:outline-none"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 px-6 pb-4 space-y-3">
          {nav.map((sec, index) => (
            <div key={index}>
              {sec.path ? (
                <Link
                  to={sec.path}
                  className="block py-2 font-medium hover:text-blue-400"
                  onClick={() => setMobileOpen(false)}
                >
                  {sec.title}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                    className="flex justify-between w-full items-center py-2 font-medium hover:text-blue-400"
                  >
                    {sec.title}
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        openDropdown === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {sec.children && openDropdown === index && (
                    <ul className="ml-4 border-l border-gray-700 pl-3 space-y-2">
                      {sec.children.map((child, i) => (
                        <li key={i}>
                          <Link
                            to={child.path}
                            className="block py-1 hover:text-blue-400 text-sm"
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

          {/* Mobile Profile + Logout */}
          <div className="border-t border-gray-700 pt-3 mt-3">
            <Link
              to="/profile"
              className="block py-2 font-medium hover:text-blue-400"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block py-2 font-medium text-left hover:text-red-500 w-full"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
