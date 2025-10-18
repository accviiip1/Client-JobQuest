import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { makeRequest } from "../axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // Debug localStorage
  const userFromStorage = localStorage.getItem("user");
  const companyFromStorage = localStorage.getItem("company");
  
  const [currentUser, setCurrentUser] = useState(
    userFromStorage ? JSON.parse(userFromStorage) : null
  );

  const [currentCompany, setCurrentCompany] = useState(
    companyFromStorage ? JSON.parse(companyFromStorage) : null
  );

  // Đăng nhập nhà tuyển dụng
  const loginCompany = async (inputs) => {
    setCurrentUser(null);
    localStorage.setItem("user", null);
    const res = await makeRequest.post("/authCompany/login", inputs);
    setCurrentCompany(res.data);
  };

  // Đăng xuất nhà tuyển dụng
  const logoutCompany = async () => {
    await makeRequest.post("/authCompany/logout");
    setCurrentCompany(null);
    navigate("/");
  };

  //Đăng nhập người tìm việc
  const loginUser = async (inputs) => {
    setCurrentCompany(null);
    localStorage.setItem("company", null);
    const res = await makeRequest.post("/authUser/login", inputs);
    setCurrentUser(res.data);
  };

  //Đăng nhập người tìm việc với Google
  const loginUserWithGoogle = async (token) => {
    try {
      setCurrentCompany(null);
      localStorage.setItem("company", null);
      const res = await makeRequest.post("/authUser/login/google", { token });
      
      if (res.data.success) {
        setCurrentUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        throw new Error(res.data.message || "Đăng nhập Google thất bại");
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  //Đăng xuất người tìm việc
  const logoutUser = async () => {
    await makeRequest.post("/authUser/logout");
    setCurrentUser(null);
    navigate("/");
  };

  useEffect(() => {
    localStorage.setItem("company", JSON.stringify(currentCompany));
  }, [currentCompany]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await makeRequest.get("/user/owner");
        setCurrentUser(res.data);
      } catch (error) {
        console.error("❌ AuthContext - Error getting user info:", error);
        setCurrentUser(null);
      }
    };
    currentUser && getInfo();
  }, []);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await makeRequest.get("/company/owner");
        setCurrentCompany(res.data);
      } catch (error) {
        console.error("❌ AuthContext - Error getting company info:", error);
        setCurrentCompany(null);
      }
    };
    currentCompany && getInfo();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        setCurrentUser,
        currentUser,
        loginUser,
        loginUserWithGoogle,
        logoutUser,
        currentCompany,
        setCurrentCompany,
        loginCompany,
        logoutCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
