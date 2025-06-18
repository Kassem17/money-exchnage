import axios from "axios";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const useCompany = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const fetchCompany = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/get-company", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.company;
    } catch (error) {
      return null;
    }
  };

  const createCompany = async (formdata) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/create",
        formdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Error",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (formdata) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        backendUrl + "/api/admin/update",
        formdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Error",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchCompany,
    createCompany,
    updateCompany,
  };
};

export default useCompany;
