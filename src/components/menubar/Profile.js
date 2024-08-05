import React from "react";
import Image from "next/image";
import styles from "./Profile.module.css";

const Profile = ({ onOpenPopup }) => {
  return (
    <div className={styles.profile} onClick={onOpenPopup}>
      <Image
        src="/Logo.svg"
        alt="Logo"
        width={40}
        height={40}
        className={styles.logo}
      />
      <div className={styles.info}>
        <h2 className={styles.name}>삐약이</h2>
        <p className={styles.email}>B_yacc2@naver.com</p>
      </div>
      <Image
        src="/icon/setting.svg"
        alt="Settings"
        width={20}
        height={20}
        className={styles.settingsIcon}
      />
    </div>
  );
};

export default Profile;
