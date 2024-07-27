"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Provider, useSelector, useDispatch } from "react-redux";
import store from "../../redux/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { usePathname } from "next/navigation";
import Icon from "../../components/Icon";
import ColorPicker from "@/components/menubar/ColorPicker";
import Profile from "@/components/menubar/Profile";
import styles from "./layout.module.css";

function Sidebar({ onOpenPopup }) {
  const pathname = usePathname();
  const primaryColor = useSelector((state) => state.theme.primaryColor);

  const menuItems = [
    { name: "홈", icon: "home", href: "/app" },
    { name: "캘린더", icon: "calendar", href: "/app/calendar" },
    { name: "아카이브", icon: "archive", href: "/app/archive" },
    { name: "휴지통", icon: "trash", href: "/app/trash" },
  ];

  return (
    <div className="sidebar">
      <Profile onOpenPopup={onOpenPopup} />
      <ul className="menu">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`menuItem ${pathname === item.href ? "active" : ""}`}
            style={
              pathname === item.href ? { backgroundColor: primaryColor } : {}
            }
          >
            <Link href={item.href}>
              <Icon name={item.icon} size={24} />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AppLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.layout}>
          <Sidebar onOpenPopup={() => setShowPopup(true)} />
          <div className="main-content">{children}</div>
          {showPopup && (
            <div className={styles.overlay} onClick={() => setShowPopup(false)}>
              <div
                className={styles.popup}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.popupHeader}>
                  <h2 className={styles.name}>설정</h2>
                  <button
                    onClick={() => setShowPopup(false)}
                    className={styles.closeButton}
                  >
                    <Image
                      src="/icon/close.svg"
                      alt="Close"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>
                <div className={styles.popupContent}>
                  <ul className="menu">
                    <li className={styles.settingItem}>
                      <h2 className={styles.subName}>대표 색상 변경</h2>
                      <ColorPicker />
                    </li>
                    <li className={styles.settingItem}>
                      <h2 className={styles.subName}>다른 설정 속성들...</h2>
                    </li>
                    {/* 더 많은 설정 항목들... */}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </Provider>
  );
}
