import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Update in production

const useEditCurrency = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(AppContext);

  const editCurrency = async (updatedData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/employee/edit-currency`,
        updatedData
      );

      if (data.success) {
        toast.success("تم تعديل العملة بنجاح");
        socket.emit("currency:updated", data.data);
      } else {
        toast.error(data.message || "فشل في تعديل العملة");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return { editCurrency, loading };
};

export default useEditCurrency;
