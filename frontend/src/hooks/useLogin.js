import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const login = async ({ username, password }) => {
    try {
      setLoading(true);
      const { data } = await axios.post(backendUrl + "/api/auth/login", {
        username,
        password,
      });

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message || "Login successful!");
        navigate("/");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.log("Login error:", error);
      if (error.response) {
        // Handle server response errors (4xx, 5xx)
        toast.error(error.response.data.message || "Login failed");
      } else if (error.request) {
        // Handle no response errors (network issues)
        toast.error("Network error. Please try again.");
      } else {
        // Handle other errors
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return { login, loading };
};

export default useLogin;
