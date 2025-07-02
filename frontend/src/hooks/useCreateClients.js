import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { socket } from "../utils/socket";

const useCreateClients = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const createClient = async (formData) => {
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/employee/create-client`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data?.success) {
        toast.success(data.message);
        socket.emit("client:created", data.client);
      } else {
        toast.error(data.message || "فشل في إضافة العميل");
      }

      return data; // ✅ RETURN THE SERVER RESPONSE TO FRONTEND
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
      toast.error(errorMessage);
      return { success: false, error: errorMessage }; // ✅ Return consistent structure
    } finally {
      setLoading(false);
    }
  };

  return { createClient, loading };
};

export default useCreateClients;
