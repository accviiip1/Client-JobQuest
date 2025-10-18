import React, { useState } from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import "./forgotPassword.scss";
import { makeRequest } from "../../axios";
import queryString from "query-string";
import { useEffect } from "react";
import { toast } from "sonner";
import { validatePasswordForm } from "../../utils/passwordValidation";
import ValidationError from "../validationError/ValidationError";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã xác thực và mật khẩu mới
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(true);
  const [showConfirmPass, setShowConfirmPass] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const params = queryString.parse(location.search);

  const getEmail = async () => {
    setErr(null);
    setSuccess(false);
    setLoading(true);
    if (!email?.length) return setErr("Vui lòng nhập email !");
    
    try {
      let res;
      params.type === "nguoi-dung"
        ? (res = await makeRequest.post("/authUser/forgot", { email }))
        : (res = await makeRequest.post("/authCompany/forgot", { email }));
      
      if (res.data.success) {
        setStep(2);
        toast.success("Mã reset mật khẩu đã được gửi đến email của bạn.");
      }
      setLoading(false);
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi gửi email reset mật khẩu.");
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    setErr(null);
    setLoading(true);
    
    // Validation using utility function
    const validation = validatePasswordForm(newPassword, confirmPassword);
    
    if (!verificationCode) {
      setErr("Vui lòng nhập mã xác thực.");
      setLoading(false);
      return;
    }
    
    if (!validation.isValid) {
      setErr(validation.errors.join(" "));
      setLoading(false);
      return;
    }
    
    try {
      let res;
      params.type === "nguoi-dung"
        ? (res = await makeRequest.post("/authUser/reset", { 
            email, 
            code: verificationCode, 
            newPassword 
          }))
        : (res = await makeRequest.post("/authCompany/reset", { 
            email, 
            code: verificationCode, 
            newPassword 
          }));
      
      if (res.data.success) {
        setSuccess(true);
        toast.success("Đặt lại mật khẩu thành công!");
        setTimeout(() => {
          navigate(`/dang-nhap/${params.type === "nguoi-dung" ? "nguoi-dung" : "nha-tuyen-dung"}`);
        }, 2000);
      }
      setLoading(false);
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi đặt lại mật khẩu.");
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setErr(null);
    setLoading(true);
    try {
      let res;
      params.type === "nguoi-dung"
        ? (res = await makeRequest.post("/authUser/forgot", { email }))
        : (res = await makeRequest.post("/authCompany/forgot", { email }));
      
      if (res.data.success) {
        toast.success("Mã reset mật khẩu mới đã được gửi.");
      }
      setLoading(false);
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi gửi lại mã reset mật khẩu.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!(params.type === "nguoi-dung" || params.type === "nha-tuyen-dung")) return navigate('/')
  }, [])

  return (
    <div className="forgotPassword">
      <div className="forgotPassword__header">
        <h4>Quên mật khẩu</h4>
        <span>
          {step === 1 
            ? "Vui lòng nhập email đã đăng ký tài khoản." 
            : "Nhập mã xác thực và mật khẩu mới."
          }
        </span>
      </div>
      
      <div className="forgotPassword__body">
        {step === 1 ? (
          <div className="item">
            <i className="fa-solid fa-envelope"></i>
            <input
              autoComplete="off"
              type="email"
              name="email"
              id="email"
              value={email}
              placeholder=" "
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email">Email</label>
          </div>
        ) : (
          <>
            <div className="verification-info">
              <i className="fa-solid fa-envelope-circle-check"></i>
              <h5>Đặt lại mật khẩu</h5>
              <p>Chúng tôi đã gửi mã xác thực đến email <strong>{email}</strong></p>
              <p>Vui lòng nhập mã xác thực và mật khẩu mới.</p>
            </div>
            
            <div className="item">
              <i className="fa-solid fa-key"></i>
              <input
                autoComplete="off"
                type="text"
                name="verificationCode"
                id="verificationCode"
                value={verificationCode}
                placeholder=" "
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength="6"
              />
              <label htmlFor="verificationCode">Mã xác thực</label>
            </div>
            
            <div className="item">
              <i className="fa-solid fa-lock"></i>
              <input
                autoComplete="off"
                type={`${showPass ? "password" : "text"}`}
                name="newPassword"
                id="newPassword"
                value={newPassword}
                placeholder=" "
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <span className="tooglePassword" onClick={() => setShowPass(!showPass)}>
                {showPass ? (
                  <i className="fa-regular fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </span>
            </div>
            
            <div className="item">
              <i className="fa-solid fa-lock"></i>
              <input
                autoComplete="off"
                type={`${showConfirmPass ? "password" : "text"}`}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                placeholder=" "
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <span className="tooglePassword" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? (
                  <i className="fa-regular fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </span>
            </div>
            
            <div className="resend-section">
              <span>Không nhận được mã?</span>
              <button 
                type="button" 
                className="resend-btn"
                onClick={handleResendCode}
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi lại"}
              </button>
            </div>
          </>
        )}

        <div className={`${(success && "notify") || (err && "notify")}`}>
          {success && (
            <div className="notify__succ">
              <i className="fa-solid fa-check-circle"></i>
              <span>Đặt lại mật khẩu thành công! Đang chuyển hướng...</span>
            </div>
          )}
          {err && (
            <ValidationError message={err} />
          )}
        </div>
      </div>
      
      <div className="forgotPassword__control">
        {loading ? (
          <button className="btn-loading">
            <div className="loading"></div>
          </button>
        ) : (
          <button
            disabled={success ? true : false}
            className="btn-auth"
            onClick={step === 1 ? getEmail : resetPassword}
          >
            {step === 1 ? "Gửi mã reset" : "Đặt lại mật khẩu"}
          </button>
        )}
        
        {step === 2 && (
          <button 
            type="button" 
            className="btn-back"
            onClick={() => setStep(1)}
            disabled={loading}
          >
            Quay lại
          </button>
        )}
      </div>
      
      <span className="link-signup">
        Trở về
        <Link to={`/dang-nhap/${params.type === "nguoi-dung" ? "nguoi-dung" : "nha-tuyen-dung"}`}>
          Đăng nhập
        </Link>
      </span>
    </div>
  );
}
