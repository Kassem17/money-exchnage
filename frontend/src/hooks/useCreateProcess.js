import axios from "axios";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const useCreateProcess = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const createProcess = async (formData) => {
    setLoading(true);
    try {
      const {
        clientId,
        processAmountSell,
        processAmountBuy,
        exchangeRate,
        processType,
        moneySource,
        moneyDestination,
        processDate,
        toCurrency,
        fromCurrency,
      } = formData;

      if (
        !clientId ||
        !processAmountSell ||
        !processAmountBuy ||
        !exchangeRate ||
        !processType ||
        !toCurrency ||
        !fromCurrency
      ) {
        toast.error("All fields are required.");
        setLoading(false);
        return null;
      }

      const response = await axios.post(
        `${backendUrl}/api/employee/create-process`,
        {
          clientId,
          processAmountSell,
          processAmountBuy,
          exchangeRate,
          processType,
          moneySource,
          moneyDestination,
          processDate,
          toCurrency,
          fromCurrency,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        return response.data; // ✅ Return full response
      } else {
        toast.error(response.data.message || "Failed to create process.");
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createProcess, loading };
};

export default useCreateProcess;
