import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import "./infoCompany.scss";
import Select from "../../../components/select/Select";
import { scale } from "../../../config/data";
import { useParams } from "react-router-dom";
import { makeRequest } from "../../../axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Loader from "../../../components/loader/Loader";

export default function InfoCompany() {
  const [company, setCompany] = useState();
  const [editAll, setEditAll] = useState(false); // Chế độ chỉnh sửa tất cả
  const [provinces, setProvinces] = useState();
  const { id } = useParams();
  const [inputs, setInputs] = useState();
  const [selectedProvince, setSelectedProvince] = useState();
  const [selectedScale, setSelectedScale] = useState();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    e.preventDefault();
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const getProvinces = async () => {
      try {
        const res = await makeRequest("/provinces");
        setProvinces(res.data);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    getProvinces();
  }, []);

  const getInfo = async () => {
    try {
      await makeRequest.get("/company/owner/").then((res) => {
        setInputs(res.data);
        setCompany(res.data);
        
        // Set selected options cho dropdown
        if (res.data.idProvince && provinces) {
          const province = provinces.find(p => p.pId === res.data.idProvince);
          if (province) setSelectedProvince(province);
        }
        if (res.data.scale) {
          const scaleOption = scale.find(s => s.name === res.data.scale);
          if (scaleOption) setSelectedScale(scaleOption);
        }
        
        return res.data;
      });
    } catch (error) {
      toast.error("Lỗi! Vui lòng đăng nhập lại.");
    }
  };

  const { isLoading, error, data } = useQuery(["company", id], () => {
    return getInfo();
  });

  // Hàm lưu tất cả thay đổi
  const putAllInfo = async () => {
    try {
      const updateData = { ...inputs };
      if (selectedProvince) updateData.idProvince = selectedProvince.pId;
      if (selectedScale) updateData.scale = selectedScale.name;
      
      await makeRequest.put("/company/update", updateData);
      toast.success("Cập nhật thông tin thành công.");
      setEditAll(false);
      queryClient.invalidateQueries(["company", id]);
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi cập nhật thông tin.");
    }
  };

  const mutationAll = useMutation(putAllInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries(["company", id]);
    }
  });

  const handleSaveAll = () => {
    mutationAll.mutate();
  };

  const handleCancelAll = () => {
    setEditAll(false);
    setInputs(company); // Reset về dữ liệu gốc
    if (company?.idProvince && provinces) {
      const province = provinces.find(p => p.pId === company.idProvince);
      if (province) setSelectedProvince(province);
    }
    if (company?.scale) {
      const scaleOption = scale.find(s => s.name === company.scale);
      if (scaleOption) setSelectedScale(scaleOption);
    }
  };

  return (
    <div className="infoCompany">
      <div className="infoCompany__wrapper">
        <div className="infoCompany__wrapper__header">
          {!editAll ? (
            <button 
              className="btn-edit-all" 
              onClick={() => setEditAll(true)}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fa-solid fa-edit" style={{ marginRight: '8px' }}></i>
              Chỉnh sửa thông tin
            </button>
          ) : (
            <div className="edit-controls" style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '20px',
              alignItems: 'center'
            }}>
              <button 
                className="btn-save-all" 
                onClick={handleSaveAll}
                disabled={mutationAll.isLoading}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: mutationAll.isLoading ? 0.7 : 1
                }}
              >
                {mutationAll.isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-save" style={{ marginRight: '8px' }}></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
              <button 
                className="btn-cancel-all" 
                onClick={handleCancelAll}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fa-solid fa-times" style={{ marginRight: '8px' }}></i>
                Hủy
              </button>
            </div>
          )}
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="infoCompany__wrapper__body">
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"nameCompany"}
              title={"Tên công ty"}
              desc={company?.nameCompany}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"nameAdmin"}
              title={"Tên người đại diện"}
              desc={company?.nameAdmin}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"email"}
              title={"Email"}
              desc={company?.email}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"phone"}
              title={"Điện thoại"}
              desc={company?.phone}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"web"}
              title={"Web"}
              desc={company?.web}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"idProvince"}
              title={"Địa chỉ"}
              desc={company?.province}
              select={"province"}
              options={provinces}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
            <ItemInfoCompany
              editAll={editAll}
              inputs={inputs}
              handleChange={handleChange}
              name={"scale"}
              title={"Quy mô"}
              desc={company?.scale}
              select={"scale"}
              options={scale}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ItemInfoCompany({
  title,
  desc,
  type = "text",
  select,
  options,
  inputs,
  handleChange,
  name,
  editAll,
  selectedProvince,
  setSelectedProvince,
  selectedScale,
  setSelectedScale,
}) {
  const [selectedOption, setSelectedOption] = useState();

  // Chỉ hiển thị input khi ở chế độ editAll
  const showInput = editAll;

  return (
    <div className="infoCompany__wrapper__body__item">
      <div className="infoCompany__wrapper__body__item__left">
        <h6>{title}</h6>
        {!showInput ? (
          <span>{desc || "..."}</span>
        ) : select ? (
          <Select
            name={name}
            options={options}
            selectedOption={
              select === "province" ? selectedProvince : 
              select === "scale" ? selectedScale : 
              selectedOption
            }
            setSelectedOption={
              select === "province" ? setSelectedProvince : 
              select === "scale" ? setSelectedScale : 
              setSelectedOption
            }
          />
        ) : (
          <input 
            type={type} 
            value={inputs?.[name] || ""} 
            name={name} 
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        )}
      </div>
      <div className="infoCompany__wrapper__body__item__right">
        {/* Không hiển thị nút nào khi không ở chế độ editAll */}
      </div>
    </div>
  );
}
