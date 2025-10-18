import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
// import "https://kit.fontawesome.com/dc548344cf.js";
import "./assets/libs/fontawesome-free-6.4.2-web/css/all.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./App.scss";
import { useMode } from "./context/ModeContext";

// Suppress FedCM errors
import "./utils/suppressFedCMErrors";

import MainLayout from "./layout/mainLayout/MainLayout";
import AuthLayout from "./layout/authLayout/AuthLayout";

import Home from "./pages/home/Home";
import Search from "./pages/search/Search";
import SearchQuick from "./pages/searchQuick/SearchQuick";
import Company from "./pages/company/Company";
import DetailJob from "./pages/detailJob/DetailJob";
import DetailCompany from "./pages/detailCompany/DetailCompany";
import DetailUser from "./pages/detailUser/DetailUser";
import PostJob from "./pages/postJob/PostJob";
import EditJob from "./pages/editJob/EditJob";
import Candidate from "./pages/candidate/Candidate";
import NotFound from "./pages/notFound/NotFound";

import Signin from "./components/signin/Signin";
import Signup from "./components/signup/Signup";
import ForgotPassword from "./components/forgotPassword/ForgotPassword";
import ResetPassword from "./components/resetPassword/ResetPassword";
import ChangePassword from "./components/changePassword/ChangePassword";

import SigninCompany from "./components/signinCompany/SigninCompany";
import SignupCompany from "./components/signupCompany/SignupCompany";
import CandidateHide from "./pages/candidateHide/CandidateHide";
import NotificationList from "./pages/notification/NotificationList";
import Messages from "./pages/messages/Messages";
import CareerGuide from "./pages/careerGuide/CareerGuide";
import PostDetail from "./pages/postDetail/PostDetail";
import SendEmail from "./pages/sendEmail/SendEmail";


function App() {
  const { darkMode } = useMode();

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <div className={`App`}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route path="*" element={<NotFound />} />

              <Route index element={<Home />} />
              <Route path="/tim-kiem" element={<Search />} />
              <Route path="/tim-kiem/:keyword" element={<Search />} />

              <Route path="/tim-viec-lam-nhanh" element={<SearchQuick />} />

              <Route path="/cam-nang-nghe-nghiep" element={<CareerGuide />} />
              <Route path="/cam-nang-nghe-nghiep/:slug" element={<PostDetail />} />

              <Route path="/nha-tuyen-dung/tim-kiem/:keyword" element={<Company />} />
              <Route path="/nha-tuyen-dung" element={<Company />} />

              <Route path="nha-tuyen-dung/:id" element={<DetailCompany />}>
                <Route path="info" element />
                <Route path="jobs" element />
              </Route>

              <Route path="nha-tuyen-dung/ung-vien" element={<Candidate />} />
              <Route path="nha-tuyen-dung/ung-vien-an" element={<CandidateHide />} />
              <Route path="nha-tuyen-dung/gui-email" element={<SendEmail />} />
              <Route path="nha-tuyen-dung/dang-bai" element={<PostJob />} />
              <Route path="nha-tuyen-dung/chinh-sua/:id" element={<EditJob />} />

              <Route path="/viec-lam/:idJob" element={<DetailJob />} />

              <Route path="/nguoi-dung/:id/" element={<DetailUser />}>
                <Route path="info" element />
                <Route path="apply" element />
                <Route path="jobs" element />
                <Route path="companies" element />
              </Route>

              <Route path="/thong-bao" element={<NotificationList />} />
              <Route path="/tin-nhan" element={<Messages />} />

              <Route path="/dang-ky" element={<AuthLayout />}>
                <Route index path="nguoi-dung" element={<Signup />} />
                <Route path="nha-tuyen-dung" element={<SignupCompany />} />
              </Route>

              <Route path="/dang-nhap" element={<AuthLayout />}>
                <Route index path="nguoi-dung" element={<Signin />} />
                <Route path="nha-tuyen-dung" element={<SigninCompany />} />
              </Route>

              <Route path="/quen-mat-khau" element={<AuthLayout />}>
                <Route path="" element={<ForgotPassword />} />
              </Route>

              <Route path="/tao-moi-mat-khau/:id/:token" element={<AuthLayout />}>
                <Route index path="" element={<ResetPassword />} />
              </Route>

              <Route path="/doi-mat-khau" element={<AuthLayout />}>
                <Route index path="" element={<ChangePassword />} />
              </Route>
            </Route>
          </Routes>


        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
