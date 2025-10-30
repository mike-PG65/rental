import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from "./pages/Home"
import Navbar from './components/Navbar'
import AddUserForm from './pages/AddUser'
import AddRentalForm from './pages/AddRental'
import AddHouse from './pages/AddHouse'
import AuthForm from './pages/AuthForm'
import ViewUsers from './pages/ViewUsers'
import ViewHouses from './pages/ViewHouses'
import ViewRentals from './pages/ViewRentals'

const AppContent = () => {
  const location = useLocation();

  // Define routes where you don't want the Navbar
  const hideNavbarRoutes = ["/auth/login", "/auth/register"];

  // Check if current path matches any of the hidden routes
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <div className={shouldShowNavbar ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/add" element={<AddUserForm />} />
          <Route path="/users/edit/:id" element={<AddUserForm />} />
          <Route path="/rental/add" element={<AddRentalForm />} />
          <Route path="/house/add" element={<AddHouse />} />
          <Route path="/rentals" element={<ViewRentals />} />
          <Route path="/houses" element={<ViewHouses />} />
          <Route path="/auth/login" element={<AuthForm />} />
          <Route path="/auth/register" element={<AuthForm />} />
          <Route path="/users" element={<ViewUsers />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
