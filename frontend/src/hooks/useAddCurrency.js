import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Update this to your backend URL in production

const useAddCurrency = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(AppContext);

  const addCurrency = async (currencyData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/employee/add-currency",
        currencyData
      );
      if (data.success) {
        toast.success(data.message);
        socket.emit("Currency:Added", data.currency);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { addCurrency, loading };
};

export default useAddCurrency;
