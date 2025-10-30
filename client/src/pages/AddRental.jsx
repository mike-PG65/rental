import FormContainer from "../components/FormContainer";

const AddRental = () => {
  return (
   <FormContainer
  title="Add Rental"
  apiUrl="http://localhost:4050/api/rental/add"
  fetchHouses="http://localhost:4050/api/house/available"
  fetchUsers="http://localhost:4050/api/auth/users"
  fields={[
    { label: "Select House", name: "houseId", type: "select" },
    { label: "Select User", name: "tenantId", type: "select" },
    { label: "Rent Price (KSh)", name: "rentPrice", type: "number", placeholder: "Enter rent price" },
  ]}
/>
  );
};

export default AddRental;
