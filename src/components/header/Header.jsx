import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/images/logoSDU-JobQuest.png";
import { Link } from "react-router-dom";
import "./header.scss";
import { useMode } from "../../context/ModeContext";
import { useAuth } from "../../context/authContext";

import DropdownUser from "../dropdownUser/DropdownUser";
import DropdownCompany from "../dropdownCompany/DropdownCompany";
import NotificationPopup from "../notification/NotificationPopup";
import { useFirebaseNotifications } from "../../hooks/useFirebaseNotifications";
import useUnreadMessages from "../../hooks/useUnreadMessages";
import useNotifications from "../../hooks/useNotifications";
import MessageButton from "../chat/MessageButton";

import { useNavigate, useLocation } from "react-router-dom";

const hedearItem = [
  {
    display: "Trang chủ",
    icon: <i className="fa-solid fa-house"></i>,
    path: "/",
  },
  {
    display: "Tìm kiếm",
    icon: <i className="fa-solid fa-magnifying-glass"></i>,
    path: "/tim-kiem",
    hasDropdown: true,
    submenu: [
      {
        display: "Tìm kiếm",
        icon: <i className="fa-solid fa-magnifying-glass"></i>,
        path: "/tim-kiem",
      },
      {
        display: "Ngành nghề/Địa điểm",
        icon: <i className="fa-solid fa-briefcase"></i>,
        path: "/tim-viec-lam-nhanh",
      },
    ]
  },
  {
    display: "Công ty",
    icon: <i className="fa-solid fa-building"></i>,
    path: "/nha-tuyen-dung",
  },
  {
    display: "Cẩm nang",
    icon: <i className="fa-solid fa-book"></i>,
    path: "/cam-nang-nghe-nghiep",
  },
  {
    display: "Tạo CV",
    icon: <i className="fa-solid fa-file-pen"></i>,
    path: process.env.REACT_APP_CV_URL ,
    external: true,
  },
];

export default function Header() {
  const { darkMode, toggleDarkMode } = useMode();
  const { currentUser, logoutUser } = useAuth();
  const { currentCompany, logoutCompany } = useAuth();

  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const headerRef = useRef();
  const sideBarMobile = useRef();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Firebase notifications hook (legacy)
  const { notificationCount, isVisible, hidePopup, showPopup } = useFirebaseNotifications();
  
  // New notifications hook
  const { unreadCount: newNotificationCount } = useNotifications();
  
  // Unread messages hook
  const { totalUnreadCount, refetch: refetchUnreadCount } = useUnreadMessages();

  // Xử lý khi click "Xem ngay"
  const handleViewNotifications = () => {
    navigate('/thong-bao');
  };

  const handleReloadPage = () => {
    navigate("/");
    window.location.reload();
    window.scroll(0, 0);
  };

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleDropdownClose = () => {
    setActiveDropdown(null);
  };

  let lastScrollTop = 0;

  useEffect(() => {
    const handleScrollHeader = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop == 0) {
        headerRef.current.style.top = "0";
        headerRef.current.classList.remove("shrink");
      } else {
        if (scrollTop > lastScrollTop) {
          headerRef.current.style.top = "-500px";
          headerRef.current.classList.remove("shrink");
        } else {
          headerRef.current.style.top = "0px";
          headerRef.current.classList.add("shrink");
        }
      }
      lastScrollTop = scrollTop;
    };

    window.addEventListener("scroll", handleScrollHeader);

    return () => window.removeEventListener("scroll", handleScrollHeader);
  });

  useEffect(() => {
    const handleClick = (e) => {
      if (!sideBarMobile.current.contains(e.target)) {
        setOpen(false);
      }
      // Close dropdown when clicking outside
      if (!e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Load số lượng thông báo chưa đọc


  return (
    <>
      <div className="header">
        <div className={`header__wrapper ${pathname != "/" ? "bg" : ""}`} ref={headerRef}>
          <div className="container">
            <div className="header__wrapper__btn-mobile">
              <button onClick={() => setOpen(!open)}>
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>
            <div className="header__wrapper__logo" onClick={handleReloadPage}>
              <img src={img} alt="" />
              <h2>SDU-JobQuest</h2>
            </div>
            <div className="header__wrapper__control">
              <ul>
                {hedearItem.map((item, i) => (
                  <li key={i} className={item.hasDropdown ? "dropdown-container" : ""}>
                    {item.hasDropdown ? (
                      <div className="dropdown-wrapper">
                        <div 
                          className={`dropdown-trigger ${pathname === item.path || item.submenu.some(sub => pathname === sub.path) ? "active" : ""}`}
                          onClick={() => handleDropdownToggle(i)}
                        >
                          {item.icon}
                          <span>{item.display}</span>
                          <i className={`fa-solid fa-chevron-down ${activeDropdown === i ? "rotated" : ""}`}></i>
                        </div>
                        {activeDropdown === i && (
                          <div className="dropdown-menu">
                            {item.submenu.map((subItem, subIndex) => (
                              <div key={subIndex} className="dropdown-item">
                                {pathname === subItem.path ? (
                                  <h4 className="active">
                                    {subItem.icon}
                                    <span>{subItem.display}</span>
                                  </h4>
                                ) : (
                                  <Link to={subItem.path} onClick={handleDropdownClose}>
                                    {subItem.icon}
                                    <span>{subItem.display}</span>
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : item.external ? (
                      <a href={item.path} target="_blank" rel="noopener noreferrer">
                        {item.icon}
                        <span>{item.display}</span>
                      </a>
                    ) : pathname === item.path ? (
                      <h4 className={pathname === item.path ? "active" : ""}>
                        {item.icon}
                        <span>{item.display}</span>
                      </h4>
                    ) : (
                      <Link to={pathname === item.path ? "" : item.path}>
                        {item.icon}
                        <span>{item.display}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="header__wrapper__auth">
              {currentUser || currentCompany ? (
                <>
                  <div className="header__wrapper__auth__notification" onClick={() => navigate("/thong-bao")}>
                    <i className="fa-solid fa-bell"></i>
                    {(notificationCount > 0 || newNotificationCount > 0) && (
                      <span className="notification__badge">
                        {Math.max(notificationCount, newNotificationCount)}
                      </span>
                    )}
                  </div>
                  <div className="header__wrapper__auth__messages" onClick={() => {
                    navigate("/tin-nhan");
                    // Refresh unread count khi click vào messages
                    setTimeout(() => refetchUnreadCount(), 500);
                  }}>
                    <i className="fa-solid fa-comments"></i>
                    {totalUnreadCount > 0 && (
                      <span className="messages__badge">
                        {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <button className="header__wrapper__auth__darkMode">
                </button>
              )}
              <button className="header__wrapper__auth__darkMode" onClick={() => toggleDarkMode()}>
                {darkMode ? (
                  <i className="fa-regular fa-sun"></i>
                ) : (
                  <i className="fa-solid fa-moon"></i>
                )}
              </button>
              {currentUser ? (
                <DropdownUser />
              ) : (
                <Link to={"/dang-nhap/nguoi-dung"}>
                  <button className="header__wrapper__auth__user">
                    {currentCompany ? "Ứng tuyển" : "Đăng nhập"}
                  </button>
                </Link>
              )}
              <hr className="hr-col" />
              {currentCompany ? (
                <DropdownCompany />
              ) : (
                <Link to={"/dang-nhap/nha-tuyen-dung"}>
                  <button className="header__wrapper__auth__company">Nhà tuyển dụng</button>
                </Link>
              )}
            </div>
            <div
              className={`header__wrapper__control-mobile ${open ? "open" : ""}`}
              ref={sideBarMobile}
            >
              <ul>
                {currentUser && (
                  <>
                    <DropdownUser />
                    <hr />
                  </>
                )}
                {currentCompany && (
                  <>
                    <DropdownCompany />
                    <hr />
                  </>
                )}

                {hedearItem.map((item, i) => (
                  <li key={i}>
                    {item.hasDropdown ? (
                      <div className="mobile-dropdown">
                        <div className="mobile-dropdown-trigger">
                          {item.icon}
                          <span>{item.display}</span>
                        </div>
                        <div className="mobile-dropdown-content">
                          {item.submenu.map((subItem, subIndex) => (
                            <div key={subIndex} className="mobile-dropdown-item">
                              {item.external ? (
                                <a href={subItem.path} target="_blank" rel="noopener noreferrer">
                                  {subItem.icon}
                                  <span>{subItem.display}</span>
                                </a>
                              ) : pathname === subItem.path ? (
                                <h4 className="active">
                                  {subItem.icon}
                                  <span>{subItem.display}</span>
                                </h4>
                              ) : (
                                <Link className={pathname === subItem.path ? "active" : ""} to={subItem.path}>
                                  {subItem.icon}
                                  <span>{subItem.display}</span>
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : item.external ? (
                      <a href={item.path} target="_blank" rel="noopener noreferrer">
                        {item.icon}
                        <span>{item.display}</span>
                      </a>
                    ) : pathname === item.path ? (
                      <h4 className={pathname === item.path ? "active" : ""}>
                        {item.icon}
                        <span>{item.display}</span>
                      </h4>
                    ) : (
                      <Link className={pathname === item.path ? "active" : ""} to={item.path}>
                        {item.icon}
                        <span>{item.display}</span>
                      </Link>
                    )}
                  </li>
                ))}

                {(currentUser || currentCompany) && (
                  <>
                    <li>
                      <Link to="/thong-bao">
                        <i className="fa-solid fa-bell"></i>
                        <span>Thông báo</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/tin-nhan">
                        <i className="fa-solid fa-comments"></i>
                        <span>Tin nhắn</span>
                      </Link>
                    </li>
                  </>
                )}

                <hr />

                <li>
                  <button onClick={() => toggleDarkMode()}>
                    {darkMode ? (
                      <>
                        <i className="fa-regular fa-sun"></i>
                        <span>Chế độ sáng</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-moon"></i>
                        <span>Chế độ tối</span>
                      </>
                    )}
                  </button>
                </li>

                {!currentUser && (
                  <li>
                    <button className="">
                      <Link to={"/dang-nhap/nguoi-dung"}>Người tìm việc</Link>
                    </button>
                  </li>
                )}

                {!currentCompany && (
                  <li>
                    <button className="">
                      <Link to={"/dang-nhap/nha-tuyen-dung"}>Nhà tuyển dụng</Link>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup
        isVisible={isVisible}
        onClose={hidePopup}
        notificationCount={notificationCount}
        onViewNotifications={handleViewNotifications}
      />
    </>
  );
}
