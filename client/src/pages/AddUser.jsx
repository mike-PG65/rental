import React, { useEffect, useState } from "react";
import FormContainer from "../components/FormContainer";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddUser = () => {
  const { id } = useParams(); // Optional: if editing
  const [initialData, setInitialData] = useState(null);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // Fetch existing user data if editing
  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`http://localhost:4050/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setInitialData(res.data.user); // Adjust depending on your API response
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      };
      fetchUser();
    }
  }, [id, token]);

  return (
    <FormContainer
      title={id ? "Edit User" : "Add User"}
      apiUrl={id ? `http://localhost:4050/api/users/edit/${id}` : "http://localhost:4050/api/users/add"}
      method={id ? "PUT" : "POST"}
      fields={[
        { label: "Full Name", name: "name", type: "text", placeholder: "Enter name" },
        { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
        { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
      ]}
      onSuccess={() => navigate("/users")} // Redirect to users list after add/edit
    />
  );
};

export default AddUser;
