import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Update this to your backend URL in production

export const useEditClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedClient, setUpdatedClient] = useState(null);
  const [success, setSuccess] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const editClient = async (clientId, clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setUpdatedClient(null);

    try {
      const { data } = await axios.put(
        backendUrl + `/api/employee/edit-client/${clientId}`,
        clientData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        setUpdatedClient(data.client);
        toast.success(data.message);
        setSuccess(true);
        socket.emit("client:updated", data.client);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      // err.response?.data?.message or err.response?.data?.error could be API error message
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update client"
      );
    } finally {
      setLoading(false);
    }
  };

  return { editClient, loading, error, updatedClient, success };
};
