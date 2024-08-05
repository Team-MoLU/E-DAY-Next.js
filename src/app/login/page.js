"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import styles from "./login.module.css";

export default function LoginPage() {
  const DOMAIN_URI = process.env.NEXT_PUBLIC_DOMAIN_URI;
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    console.log("useEffect is running");

    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    }

    const accessCookie = getCookie("access");
    const refreshCookie = getCookie("refresh");

    setAccessToken(accessCookie);
    setRefreshToken(refreshCookie);
  }, []);

  useEffect(() => {
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
  }, [accessToken, refreshToken]);

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <Image
          src="/Logo.svg"
          alt="Logo"
          width={100}
          height={100}
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
        <Link href={DOMAIN_URI + "/api/v1/login"}>
          <Image
            src="/oauth/web_neutral_rd_ctn.svg"
            alt="Google Login"
            width={191}
            height={46}
            className={styles.googleButton}
            onContextMenu={(e) => e.preventDefault()}
          />
        </Link>
      </div>
      <div className={styles.backgroundAnimation}>
        <Image
          src="/background.svg"
          alt="background"
          layout="fill"
          objectFit="cover"
          quality={100}
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
      </div>
    </div>
  );
}
