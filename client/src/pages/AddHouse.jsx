import FormContainer from "../components/FormContainer";

const AddHouse = () => {

    const apiUrl = import.meta.env.VITE_BASE_URL

  return (
    <FormContainer
      title="Add House"
      apiUrl={`${apiUrl}/house/add`}
      fields={[
        { label: "House Number", name: "houseNo", type: "text", placeholder: "Enter house number" },
        { label: "Price (KSh)", name: "price", type: "number", placeholder: "Enter price" },
      ]}
    />
  );
};

export default AddHouse;
