import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const useDeleteClient = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const deleteClient = async (clientId) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/employee/delete-client/${clientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { deleteClient, loading };
};

export default useDeleteClient;
