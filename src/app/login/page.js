"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
    <div>
      <Link href={DOMAIN_URI + "/login/oauth2/code/google"}>
        <button>회원가입</button>
      </Link>
      <br></br>
      <br></br>
      <Link href={DOMAIN_URI + "/api/v1/login"}>
        <button>로그인</button>
      </Link>
    </div>
  );
}
