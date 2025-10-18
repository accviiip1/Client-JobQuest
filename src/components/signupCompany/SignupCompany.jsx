import React, { useEffect, useRef, useState } from "react";
import "./signupCompany.scss";
import { Link, useNavigate } from "react-router-dom";
import { scale } from "../../config/data";
import Select from "../select/Select";
import { makeRequest } from "../../axios";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";

export default function SignupCompany() {
  const [showPass, setShowPass] = useState(true);
  const [showRePass, setShowRePass] = useState(true);
  const [selectedOptionProvince, setSelectedOptionProvince] = useState();
  const [selectedOptionScale, setSelectedOptionScale] = useState();
  const [provinces, setProvinces] = useState();
  const [err, setErr] = useState();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Nhập mã xác thực
  const [verificationLoading, setVerificationLoading] = useState(false);
  const passwordRef = useRef();
  const rePasswordRef = useRef();
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    email: "",
    phone: "",
    password: "",
    nameCompany: "",
    nameAdmin: "",
    idProvince: "",
  });

  const [verificationCode, setVerificationCode] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendVerificationCode = async () => {
    setErr("");
    
    if (!inputs.email) {
      return setErr("Vui lòng nhập email trước khi gửi mã xác thực.");
    }

    setVerificationLoading(true);
    try {
      await makeRequest.post("/verification/send-company-register-code", { email: inputs.email });
      setStep(2);
      toast.success("Mã xác thực đã được gửi đến email của bạn.");
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi gửi mã xác thực.");
    }
    setVerificationLoading(false);
  };

  const handleSumit = async () => {
    setErr("");
    
    if (step === 1) {
      // Kiểm tra thông tin cơ bản
      if (!inputs.nameAdmin || !inputs.nameCompany || !inputs.email || !inputs.phone || !inputs.password) {
        return setErr("Vui lòng điền đầy đủ thông tin.");
      }
      
      if (passwordRef.current.value !== rePasswordRef.current.value) {
        return setErr("Nhập lại mật khẩu không trùng khớp.");
      }
      
      if (!selectedOptionScale || !selectedOptionProvince) {
        return setErr("Chọn quy mô và địa chỉ.");
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
      inputs.scale = selectedOptionScale.name;
      inputs.idProvince = selectedOptionProvince.pId;
      
      await makeRequest.post("/authCompany/register", {
        ...inputs,
        verificationCode
      });
      toast.success('Đăng ký thành công.');
      navigate("/dang-nhap/nha-tuyen-dung");
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
      await makeRequest.post("/verification/send-company-register-code", { email: inputs.email });
      toast.success("Mã xác thực mới đã được gửi.");
    } catch (err) {
      setErr(err?.response?.data?.message || err?.response?.data || "Lỗi khi gửi lại mã xác thực.");
    }
    setVerificationLoading(false);
  };

  const getProvinces = async () => {
    try {
      const res = await makeRequest("/provinces");
      setProvinces(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProvinces();
  }, []);

  useEffect(() => {
    if (currentCompany) return navigate("/");
  }, [currentCompany]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [err]);

  return (
    <div className="signupCompany">
      <div className="signupCompany__header">
        <h4>Đăng ký nhà tuyển dụng</h4>
        <span>Hãy cùng chúng tôi xây dựng cơ hội tuyển dụng tốt nhất cho doanh nghiệp của bạn</span>
      </div>
      {err && <span className="err">{err}</span>}
      
      <div className="signupCompany__body">
        {step === 1 ? (
          <>
            <div className="signupCompany__body__info__auth">
              <h4 className="header">Thông tin đăng nhập</h4>
              <div className="item">
                <i className="fa-solid fa-envelope"></i>
                <input
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="off"
                  id="email"
                  name="email"
                  type="email"
                  value={inputs.email}
                />
                <label htmlFor="email">Email</label>
              </div>
              <div className="item">
                <i className="fa-solid fa-phone"></i>
                <input
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="off"
                  id="phone"
                  name="phone"
                  type="number"
                  value={inputs.phone}
                />
                <label htmlFor="phone">Số điện thoại</label>
              </div>
              <div className="item">
                <i className="fa-solid fa-lock"></i>
                <input
                  ref={passwordRef}
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="off"
                  id="password"
                  name="password"
                  type={`${showPass ? "password" : "text"}`}
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
                  ref={rePasswordRef}
                  placeholder=" "
                  autoComplete="off"
                  id="repassword"
                  name="rePassword"
                  type={`${showRePass ? "password" : "text"}`}
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
            </div>

            <div className="signupCompany__body__info__company">
              <h4 className="header">Thông tin công ty</h4>
              <div className="item">
                <i className="fa-solid fa-building"></i>
                <input
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="off"
                  id="nameCompany"
                  name="nameCompany"
                  type="text"
                  value={inputs.nameCompany}
                />
                <label htmlFor="nameCompany">Tên công ty</label>
              </div>
              <div className="item">
                <i className="fa-solid fa-user-tie"></i>
                <input
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="off"
                  id="nameAdmin"
                  name="nameAdmin"
                  type="text"
                  value={inputs.nameAdmin}
                />
                <label htmlFor="nameAdmin">Tên người đại diện</label>
              </div>
              <div className="item">
                <i className="fa-solid fa-map-marker-alt"></i>
                <Select
                  options={provinces}
                  selectedOption={selectedOptionProvince}
                  setSelectedOption={setSelectedOptionProvince}
                  placeholder="Chọn tỉnh/thành phố"
                />
              </div>
              <div className="item">
                <i className="fa-solid fa-users"></i>
                <Select
                  options={scale}
                  selectedOption={selectedOptionScale}
                  setSelectedOption={setSelectedOptionScale}
                  placeholder="Chọn quy mô công ty"
                />
              </div>
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
          <button className="btn-auth" onClick={handleSumit}>
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
          Bạn đã có tài khoản ?<Link to={"/dang-nhap/nha-tuyen-dung"}> Đăng nhập</Link>
        </span>
      </div>
    </div>
  );
}
