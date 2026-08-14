import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { socket } from "../utils/socket";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");
  const [userData, setUserData] = useState({});
  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!backendUrl) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/get-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setUserData(data.employee ?? {});
        } else {
          setToken(null);
        }
      } catch (err) {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/employee/get-clients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          setClients(data.clients);
        }
      } catch (err) {
        // Silent fail for clients; user may not have permission
      }
      // Do not set loading(false) here — only fetchUserData controls loading so the app waits for user data before rendering
    };

    if (token) {
      fetchClients();
    }
  }, [token, backendUrl]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!backendUrl) return;
      try {
        const { data } = await axios.get(backendUrl + "/api/admin/get-company");
        if (data.success) {
          setCompany(data.company ?? {});
        } else {
          toast.error(data.message ?? "فشل في جلب بيانات الشركة");
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ?? error?.message ?? "خطأ في الاتصال";
        toast.error(msg);
      }
    };
    if (token) {
      fetchCompany();
    }
  }, [token, backendUrl]);

  const value = {
    backendUrl: backendUrl ?? "",
    token,
    setToken,
    userData,
    loading,
    clients,
    company,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
