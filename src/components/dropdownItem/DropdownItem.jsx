import React, { useEffect, useRef, useState } from "react";
import "./dropdownItem.scss";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import formatStr from "../../config/formatStr";
import queryString from "query-string";
import PropTypes from "prop-types";

export default function DropdownItem(props) {
  const {
    icon,
    title = "Lựa chọn",
    option,
    salary,
    optionActive,
    setOptionActive,
    setSalaryFilter,
    salaryFilter,
    search = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const params = queryString.parse(location.search);
  const dropdownRef = useRef();

  const handleClickOption = (name) => {
    if (optionActive.includes(name)) {
      const newFilter = [...optionActive];
      newFilter.splice(optionActive.indexOf(name), 1);
      setOptionActive(newFilter);
    } else {
      setOptionActive((current) => [...current, name]);
    }

    if (params.field || params.province) {
      navigate("/tim-kiem");
    }
  };

  useEffect(() => {
    const handleMousedown = (e) => {
      if (!dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMousedown);
    return () => document.removeEventListener("mousedown", handleMousedown);
  });

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div
        className={`dropdown__toggle ${
          (optionActive?.length > 0 && "active") || salaryFilter?.length > 0 ? "active" : ""
        }`}
        onClick={() => setOpen(!open)}
      >
        <div className="dropdown__toggle__title">
          {icon && icon}
          <span className="text">{title}</span>
        </div>
        <i className={`fa-solid fa-angle-down icon-down ${open ? "open" : ""}`}></i>
      </div>
      {open && (
        <div className="dropdown__menu">
          {search && (
            <div className="dropdown__menu__search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              {value.length > 0 && (
                <button className="btn-clear" onClick={() => setValue("")}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          )}
          {option && (
            <div className="dropdown__menu__list">
              {option
                ?.filter((asd) => formatStr(asd.name).includes(formatStr(value)))
                .map((option, i) => (
                  <div key={i} className="dropdown__menu__list__item">
                    <label htmlFor={`list__item__${i}`}>
                      <input
                       // defaultChecked={optionActive.includes(option?.name)}
                        type="checkbox"
                        checked={optionActive.includes(option?.name)}
                        name=""
                        id={`list__item__${i}`}
                        onChange={() => handleClickOption(option?.name)}
                      />
                      <span>{option?.name}</span>
                    </label>
                  </div>
                ))}
            </div>
          )}
          {salary && (
            <DropdownMenuSalary setSalaryFilter={setSalaryFilter} salaryFilter={salaryFilter} />
          )}
        </div>
      )}
    </div>
  );
}

function DropdownMenuSalary({ setSalaryFilter, salaryFilter }) {
  const minGap = 1;
  const min = 1;
  const max = 9999;

  const [minVal, setMinVal] = useState(salaryFilter[0] || min);
  const [maxVal, setMaxVal] = useState(salaryFilter[1] || max);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value) || min;
    if (value >= min && value <= max) {
      setMinVal(value);
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value) || max;
    if (value >= min && value <= max) {
      setMaxVal(value);
    }
  };

  const handleClickSubmit = () => {
    // Đảm bảo min không lớn hơn max
    const finalMin = Math.min(minVal, maxVal);
    const finalMax = Math.max(minVal, maxVal);
    setSalaryFilter([finalMin, finalMax]);
  };

  const handleClickRemove = () => {
    setSalaryFilter([]);
    setMinVal(min);
    setMaxVal(max);
  };

  return (
    <div className="dropdown__menu__salary">
      <h4>Mức lương trên tháng (triệu VNĐ)</h4>
      <div className="dropdown__menu__salary__inputs">
        <div className="salary-input-group">
          <label htmlFor="min-salary">Từ:</label>
          <input
            type="number"
            id="min-salary"
            min={min}
            max={max}
            value={minVal}
            onChange={handleMinChange}
            placeholder="1"
          />
          <span>triệu</span>
        </div>
        <div className="salary-input-group">
          <label htmlFor="max-salary">Đến:</label>
          <input
            type="number"
            id="max-salary"
            min={min}
            max={max}
            value={maxVal}
            onChange={handleMaxChange}
            placeholder="9999"
          />
          <span>triệu</span>
        </div>
      </div>
      <div className="dropdown__menu__salary__button">
        <button className="btn-submit" onClick={handleClickSubmit}>
          Áp dụng
        </button>
        <button className="btn-remove" onClick={handleClickRemove}>
          <i className="fa-regular fa-trash-can"></i>
          <span>Xóa lọc</span>
        </button>
      </div>
    </div>
  );
}

DropdownItem.propTypes = {
  icon: PropTypes.object,
  title: PropTypes.string,
  option: PropTypes.array,
  salary: PropTypes.bool,
  optionActive: PropTypes.array,
  setOptionActive: PropTypes.func,
  setSalaryFilter: PropTypes.func,
  salaryFilter: PropTypes.array,
  search: PropTypes.bool,
};
