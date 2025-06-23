import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
const socket = io("http://localhost:5000");

export const useEditClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { backendUrl, token } = useContext(AppContext);

  const editClient = async (clientId, clientData) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/employee/edit-client/${clientId}`,
        clientData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("client:updated", data.client);
        toast.success(data.message);
        return { success: true, client: data.client };
      }
      throw new Error(data.message || "Update failed");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { editClient, loading, error };
};
