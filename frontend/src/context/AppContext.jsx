import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { socket } from "../utils/socket";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [userData, setUserData] = useState({});
  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Call backend to verify token & fetch user
        const { data } = await axios.get(`${backendUrl}/api/admin/get-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setUserData(data.employee);
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
  }, [token]);

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
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await axios.get(backendUrl + "/api/admin/get-company");
        if (data.success) {
          setCompany(data.company);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      }
    };
    if (token) {
      fetchCompany();
    }
  }, [token, backendUrl]);

  const value = {
    backendUrl,
    token,
    setToken,
    userData,
    loading,
    clients,
    company,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
