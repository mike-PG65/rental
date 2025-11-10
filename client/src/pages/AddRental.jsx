import FormContainer from "../components/FormContainer";

const AddRental = () => {

   const apiUrl = import.meta.env.VITE_BASE_URL

  return (
   <FormContainer
  title="Add Rental"
  apiUrl={`${apiUrl}/rental/add`}
  fetchHouses={`${apiUrl}/house/available`}
  fetchUsers={`${apiUrl}/auth/users`}
  fields={[
    { label: "Select House", name: "houseId", type: "select" },
    { label: "Select User", name: "tenantId", type: "select" },
    { label: "Rent Price (KSh)", name: "rentPrice", type: "number", placeholder: "Enter rent price" },
  ]}
/>
  );
};

export default AddRental;
