"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Provider, useSelector, useDispatch } from "react-redux";
import store from "../../redux/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Topbar from "@/components/tobbars/Topbar";
import { usePathname, useRouter } from "next/navigation";
import Icon from "../../components/Icon";
import ColorPicker from "@/components/menubar/ColorPicker";
import Profile from "@/components/menubar/Profile";
import styles from "./layout.module.css";

function Sidebar({ onOpenPopup }) {
  const pathname = usePathname();
  const primaryColor = useSelector((state) => state.theme.primaryColor);
  const [lastHomePath, setLastHomePath] = useState("/app");

  const menuItems = [
    {
      name: "홈",
      icon: "home",
      href: lastHomePath,
      isHome: true,
      homePaths: ["/app", "/app/task", "/app/tree-view"],
    },
    { name: "캘린더", icon: "calendar", href: "/app/calendar" },
    { name: "아카이브", icon: "archive", href: "/app/archive" },
    { name: "휴지통", icon: "trash", href: "/app/trash" },
  ];

  useEffect(() => {
    if (menuItems[0].homePaths.includes(pathname)) {
      setLastHomePath(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleHomeClick = (e) => {
    if (menuItems[0].homePaths.includes(pathname)) {
      e.preventDefault();
    }
  };

  return (
    <div className="sidebar">
      <Profile onOpenPopup={onOpenPopup} />
      <h2 className={styles.category}>일정 관리</h2>
      <ul className="menu">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`menuItem ${
              item.isHome
                ? menuItems[0].homePaths.includes(pathname)
                  ? "active"
                  : ""
                : pathname === item.href
                ? "active"
                : ""
            }`}
            style={
              (item.isHome && menuItems[0].homePaths.includes(pathname)) ||
              (!item.isHome && pathname === item.href)
                ? { backgroundColor: primaryColor }
                : {}
            }
          >
            <Link
              href={item.href}
              onClick={item.isHome ? handleHomeClick : undefined}
            >
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
    <div className={styles.layout}>
      <Sidebar onOpenPopup={() => setShowPopup(true)} />
      <div className={styles.topbar}>
        <Topbar />
      </div>
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>{children}</div>
      </main>

      {showPopup && (
        <div className={styles.overlay} onClick={() => setShowPopup(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h2 className={styles.name}>설정</h2>
              <button
                onClick={() => setShowPopup(false)}
                className={styles.closeButton}
              >
                <Icon name="close" size={24} />
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
  );
}
