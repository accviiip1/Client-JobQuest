import React, { useEffect, useRef, useState } from "react";
import "./signup.scss";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../axios";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";

export default function Signup() {
  const [err, setErr] = useState();
  const [mess, setMess] = useState();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(true);
  const [showRePass, setShowRePass] = useState(true);
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Nhập mã xác thực
  const [verificationLoading, setVerificationLoading] = useState(false);
  const rePasswordRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [verificationCode, setVerificationCode] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendVerificationCode = async () => {
    setErr("");
    setMess("");
    
    if (!inputs.email) {
      return setErr("Vui lòng nhập email trước khi gửi mã xác thực.");
    }

    setVerificationLoading(true);
    try {
      await makeRequest.post("/verification/send-register-code", { email: inputs.email });
      setStep(2);
      toast.success("Mã xác thực đã được gửi đến email của bạn.");
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi gửi mã xác thực.");
    }
    setVerificationLoading(false);
  };

  const handleSubmit = async () => {
    setErr("");
    setMess("");
    
    if (step === 1) {
      // Kiểm tra thông tin cơ bản
      if (!inputs.name || !inputs.email || !inputs.phone || !inputs.password) {
        return setErr("Vui lòng điền đầy đủ thông tin.");
      }
      
      if (passwordRef.current.value !== rePasswordRef.current.value) {
        return setErr("Nhập lại mật khẩu không trùng khớp.");
      }

      // Kiểm tra định dạng mật khẩu
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(inputs.password)) {
        return setErr("Mật khẩu phải bao gồm ít nhất 6 kí tự, trong đó có chữ cái, số, chữ cái viết hoa và kí tự đặt biệt.");
      }

      // Chuyển sang bước gửi mã xác thực
      await handleSendVerificationCode();
      return;
    }

    // Bước 2: Xác thực mã và đăng ký
    if (!verificationCode) {
      return setErr("Vui lòng nhập mã xác thực.");
    }

    setLoading(true);
    try {
      await makeRequest.post("/authUser/register", {
        ...inputs,
        verificationCode
      });
      toast.success("Đăng ký tài khoản thành công.");
      navigate("/dang-nhap/nguoi-dung");
      setInputs("");
      setVerificationCode("");
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi đăng ký.");
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setErr("");
    setVerificationLoading(true);
    try {
      await makeRequest.post("/verification/send-register-code", { email: inputs.email });
      toast.success("Mã xác thực mới đã được gửi.");
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi gửi lại mã xác thực.");
    }
    setVerificationLoading(false);
  };

  useEffect(() => {
    if (currentUser) return navigate("/");
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="signup">
      <div className="signup__header">
        <h4>Chào mừng bạn đến với SDU-JobQuest</h4>
        <span>Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng</span>
      </div>
      {err && <span className="err">{err}</span>}
      {mess && <p className="mess">{mess}</p>}
      
      <div className="signup__body">
        {step === 1 ? (
          <>
            <div className="item">
              <i className="fa-solid fa-user"></i>
              <input
                autoComplete="off"
                onChange={handleChange}
                name="name"
                type="text"
                placeholder=" "
                id="name"
                value={inputs.name}
              />
              <label htmlFor="name">Họ và tên</label>
            </div>
            <div className="item">
              <i className="fa-solid fa-envelope"></i>
              <input
                autoComplete="off"
                onChange={handleChange}
                name="email"
                type="email"
                placeholder=" "
                id="email"
                value={inputs.email}
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="item">
              <i className="fa-solid fa-phone"></i>
              <input
                autoComplete="off"
                onChange={handleChange}
                name="phone"
                type="number"
                placeholder=" "
                id="phone"
                value={inputs.phone}
              />
              <label htmlFor="phone">Số điện thoại</label>
            </div>
            <div className="item">
              <i className="fa-solid fa-lock"></i>
              <input
                autoComplete="off"
                ref={passwordRef}
                onChange={handleChange}
                name="password"
                type={`${showPass ? "password" : "text"}`}
                placeholder=" "
                id="password"
                value={inputs.password}
              />
              <label htmlFor="password">Mật khẩu</label>
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
                ref={rePasswordRef}
                name="rePassword"
                type={`${showRePass ? "password" : "text"}`}
                placeholder=" "
                id="repassword"
              />
              <label htmlFor="repassword">Nhập lại mật khẩu</label>
              <span className="tooglePassword" onClick={() => setShowRePass(!showRePass)}>
                {showRePass ? (
                  <i className="fa-regular fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="verification-step">
              <div className="verification-info">
                <i className="fa-solid fa-envelope-circle-check"></i>
                <h5>Xác thực email</h5>
                <p>Chúng tôi đã gửi mã xác thực đến email <strong>{inputs.email}</strong></p>
                <p>Vui lòng kiểm tra hộp thư và nhập mã 6 số bên dưới.</p>
              </div>
              <div className="item">
                <i className="fa-solid fa-key"></i>
                <input
                  autoComplete="off"
                  onChange={(e) => setVerificationCode(e.target.value)}
                  name="verificationCode"
                  type="text"
                  placeholder=" "
                  id="verificationCode"
                  value={verificationCode}
                  maxLength="6"
                />
                <label htmlFor="verificationCode">Mã xác thực</label>
              </div>
              <div className="resend-section">
                <span>Không nhận được mã?</span>
                <button 
                  type="button" 
                  className="resend-btn"
                  onClick={handleResendCode}
                  disabled={verificationLoading}
                >
                  {verificationLoading ? "Đang gửi..." : "Gửi lại"}
                </button>
              </div>
            </div>
          </>
        )}
        
        {!loading ? (
          <button className="btn-auth" onClick={handleSubmit}>
            {step === 1 ? "Tiếp tục" : "Đăng ký"}
          </button>
        ) : (
          <button className="btn-loading">
            <div className="loading"></div>
          </button>
        )}
        
        {step === 2 && (
          <button 
            type="button" 
            className="btn-back"
            onClick={() => setStep(1)}
          >
            Quay lại
          </button>
        )}
        
        <span className="link-signin">
          Bạn đã có tài khoản ?<Link to={"/dang-nhap/nguoi-dung"}> Đăng nhập</Link>
        </span>
      </div>
    </div>
  );
}
