import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import "./infoUser.scss";
import Select from "../../../components/select/Select";
import { useAuth } from "../../../context/authContext";
import { useParams } from "react-router-dom";
import { makeRequest } from "../../../axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function InfoUser() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState();
  const [provinces, setProvinces] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    name: "",
    birthDay: "",
    sex: "",
    email: "",
    phone: "",
    idProvince: "",
    linkSocial: "",
  });

  const handleChange = (e) => {
    e.preventDefault();
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const getProvinces = async () => {
      try {
        const res = await makeRequest("/provinces");
        setProvinces(res.data);
      } catch (error) {}
    };
    getProvinces();
  }, []);

  useEffect(() => {
    if (parseInt(currentUser?.id) !== parseInt(id)) return navigate("/dang-nhap/nguoi-dung");
  }, []);

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery(["user", id], async () => {
    await makeRequest.get("/user/owner").then((res) => {
      setInputs({
        name: res.data.name,
        birthDay: res.data.birthDay,
        sex: res.data.sex,
        email: res.data.email,
        phone: res.data.phone,
        idProvince: res.data.idProvince,
        linkSocial: res.data.linkSocial,
      });
      setUser(res.data);
      return res.data;
    });
  });

  const mutation = useMutation(
    (updatedData) => {
      return makeRequest.put("/user/update", updatedData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["user", id]);
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin");
      },
    }
  );

  const handleSave = () => {
    console.log('🔍 Frontend sending data:', inputs);
    mutation.mutate(inputs);
  };

  const handleCancel = () => {
    setInputs({
      name: user?.name || "",
      birthDay: user?.birthDay || "",
      sex: user?.sex || "",
      email: user?.email || "",
      phone: user?.phone || "",
      idProvince: user?.idProvince || "",
      linkSocial: user?.linkSocial || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="infoUser">
      <div className="infoUser__header">
        <h3>Thông tin cá nhân</h3>
        <div className="infoUser__actions">
          {!isEditing ? (
            <button className="btn-edit-all" onClick={() => setIsEditing(true)}>
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="infoUser__action-buttons">
              <button 
                className="btn-save-all" 
                onClick={handleSave} 
                disabled={mutation.isLoading}
                style={{
                  padding: '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                {mutation.isLoading ? "Đang lưu..." : "Lưu"}
              </button>
              <button 
                className="btn-cancel-all" 
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="infoUser__wrapper">
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          handleChange={handleChange}
          name="name"
          title={"Tên"}
          desc={user?.name}
        />
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          name="birthDay"
          handleChange={handleChange}
          title={"Ngày sinh :"}
          desc={user?.birthDay ? moment(user?.birthDay).format("DD/MM/YYYY") : null}
          type={"input-date"}
        />
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          name="sex"
          setInputs={setInputs}
          handleChange={handleChange}
          title={"Giới tính :"}
          desc={user?.sex}
          type={"input-radio"}
        />
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          name="email"
          handleChange={handleChange}
          title={"Email :"}
          desc={user?.email}
        />
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          name="linkSocial"
          handleChange={handleChange}
          title={"Liên kết facebook :"}
          desc={user?.linkSocial}
        />
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          name="phone"
          handleChange={handleChange}
          title={"Số điện thoại :"}
          desc={user?.phone}
        />
        <ItemInfo
          isEditing={isEditing}
          inputs={inputs}
          name="idProvince"
          setInputs={setInputs}
          title={"Địa chỉ :"}
          options={provinces}
          desc={user?.province}
          type={"select"}
        />
      </div>
    </div>
  );
}

function ItemInfo({
  title,
  desc,
  name,
  inputs,
  handleChange,
  setInputs,
  type = "input",
  options,
  isEditing,
}) {
  const [selectedOption, setSelectedOption] = useState();

  // Khởi tạo selectedOption từ dữ liệu hiện có
  useEffect(() => {
    if (type === "select" && options && inputs?.[name]) {
      const currentOption = options.find(option => 
        (option.pId || option.id) === inputs[name]
      );
      if (currentOption) {
        setSelectedOption(currentOption);
      }
    }
  }, [options, inputs, name, type]);

  const handleSelectChange = (option) => {
    console.log('🔍 Selected option:', option);
    setSelectedOption(option);
    setInputs((prev) => {
      const newInputs = { ...prev, [name]: option.pId || option.id };
      console.log('🔍 Updated inputs:', newInputs);
      return newInputs;
    });
  };

  return (
    <div className="personalInformation__wrapper__item">
      <div className="personalInformation__wrapper__item__left">
        <h6>{title}</h6>
        {!isEditing ? (
          <span>{desc || "..."}</span>
        ) : (
          <>
            {type === "input" && (
              <input 
                name={name} 
                type="text" 
                value={inputs?.[name] || ""} 
                onChange={handleChange}
                placeholder={desc || "Nhập thông tin..."}
              />
            )}
            {type === "input-date" && (
              <input 
                name={name} 
                type="date" 
                value={inputs?.[name] || ""} 
                onChange={handleChange}
              />
            )}
            {type === "input-radio" && (
              <InputRadio
                inputs={inputs}
                setInputs={setInputs}
                desc={desc}
                value={["Nam", "Nữ"]}
                onChange={handleChange}
              />
            )}
            {type === "select" && (
              <Select
                name={name}
                options={options}
                selectedOption={selectedOption}
                setSelectedOption={handleSelectChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InputRadio({ inputs, setInputs, value, name, desc, onChange, disabled }) {
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="input-radio">
      <div className="input-radio-item">
        <input
          name="sex"
          type="radio"
          checked={inputs?.sex === value[0]}
          onChange={handleChange}
          value={value[0]}
          disabled={disabled}
        />
        <label htmlFor="">{value[0]}</label>
      </div>
      <div className="input-radio-item">
        <input
          name="sex"
          type="radio"
          checked={inputs?.sex === value[1]}
          onChange={handleChange}
          value={value[1]}
          disabled={disabled}
        />
        <label htmlFor="">{value[1]}</label>
      </div>
    </div>
  );
}
