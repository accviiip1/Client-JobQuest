import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { makeRequest, apiCv } from "../../axios.js";
import { toast } from "sonner";
import "./sendEmail.scss";

export default function SendEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [emailContent, setEmailContent] = useState({
    subject: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách ứng viên đã chọn từ state
    if (location.state?.selectedCandidates) {
      setSelectedCandidates(location.state.selectedCandidates);
    } else {
      // Nếu không có dữ liệu, quay lại trang candidate
      navigate("/nha-tuyen-dung/ung-vien");
    }
  }, [location.state, navigate]);

  const handleSendEmail = async () => {
    if (!emailContent.subject.trim() || !emailContent.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung email");
      return;
    }

    if (selectedCandidates.length === 0) {
      toast.error("Không có ứng viên nào được chọn");
      return;
    }

    setLoading(true);
    try {
      const emails = selectedCandidates.map(candidate => candidate.email);
      
      const response = await makeRequest.post("/admin/send-bulk-email", {
        emails: emails,
        subject: emailContent.subject,
        content: emailContent.content
      });

      if (response.data.success) {
        toast.success(`Email đã được gửi thành công đến ${response.data.sentCount} ứng viên`);
        navigate("/nha-tuyen-dung/ung-vien");
      } else {
        toast.error("Có lỗi xảy ra khi gửi email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Có lỗi xảy ra khi gửi email");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.filter(candidate => candidate.id !== candidateId)
    );
  };

  const handleBack = () => {
    navigate("/nha-tuyen-dung/ung-vien");
  };

  return (
    <div className="send-email">
      <div className="container">
        <div className="send-email__wrapper">
          <div className="send-email__header">
            <button className="btn-back" onClick={handleBack}>
              <i className="fa-solid fa-angle-left"></i>
              <span>Quay lại</span>
            </button>
            <h2>Gửi email cho ứng viên</h2>
          </div>

          <div className="send-email__body">
            {/* Danh sách ứng viên đã chọn */}
            <div className="send-email__candidates">
              <h3>Danh sách ứng viên đã chọn ({selectedCandidates.length})</h3>
              <div className="candidates-list">
                {selectedCandidates.map((candidate) => (
                  <div key={candidate.id} className="candidate-item">
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {candidate.avatarPic ? (
                          <img 
                            src={`${apiCv}${candidate.avatarPic}`} 
                            alt={candidate.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="avatar-placeholder"
                          style={{ display: candidate.avatarPic ? 'none' : 'flex' }}
                        >
                          <span className="avatar-initial">
                            {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="candidate-details">
                        <h4>{candidate.name}</h4>
                        <p>{candidate.email}</p>
                        {candidate.phone && <p>{candidate.phone}</p>}
                      </div>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveCandidate(candidate.id)}
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form gửi email */}
            <div className="send-email__form">
              <div className="form-group">
                <label htmlFor="subject">Tiêu đề email *</label>
                <input
                  type="text"
                  id="subject"
                  placeholder="Nhập tiêu đề email..."
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Nội dung email *</label>
                <textarea
                  id="content"
                  placeholder="Nhập nội dung email..."
                  rows="10"
                  value={emailContent.content}
                  onChange={(e) => setEmailContent(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn-send"
                  onClick={handleSendEmail}
                  disabled={loading || selectedCandidates.length === 0}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-paper-plane"></i>
                      <span>Gửi email ({selectedCandidates.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
