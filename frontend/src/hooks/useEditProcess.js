// hooks/useEditProcess.js or .ts
import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { socket } from "../utils/socket";

const useEditProcess = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { backendUrl, token } = useContext(AppContext);

  const editProcess = async (processId, updatedData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await axios.put(
        backendUrl + `/api/employee/edit-process/${processId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage(response.data.message);
      toast.success(response.data.message);
      socket.emit("process:edited", response.data.process);
      return response.data.process;
    } catch (err) {
      console.error("Edit process failed:", err);
      setError(err.response?.data?.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    editProcess,
    loading,
    error,
    successMessage,
  };
};

export default useEditProcess;
