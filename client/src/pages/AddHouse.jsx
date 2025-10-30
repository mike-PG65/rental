import FormContainer from "../components/FormContainer";

const AddHouse = () => {
  return (
    <FormContainer
      title="Add House"
      apiUrl="http://localhost:4050/api/house/add"
      fields={[
        { label: "House Number", name: "houseNo", type: "text", placeholder: "Enter house number" },
        { label: "Price (KSh)", name: "price", type: "number", placeholder: "Enter price" },
      ]}
    />
  );
};

export default AddHouse;
