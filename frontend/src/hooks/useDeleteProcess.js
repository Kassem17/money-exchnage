import React from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const useDeleteProcess = () => {
  const { backendUrl, token } = useContext(AppContext);

  const deleteProcess = async (processId) => {
    try {
      const token = localStorage.getItem("token"); // Adjust if you're using a different storage or context
      const response = await axios.delete(
        backendUrl + `/api/employee/delete-process/${processId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log("Process deleted:", response.data.message);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error(
        "Error deleting process:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Something went wrong",
      };
    }
  };
  return { deleteProcess };
};

export default useDeleteProcess;
