"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

export default function RootPage() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
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
    if (accessToken === null || refreshToken === null) {
      // cookie 에 accessToken 또는 refreshToken 정보가 없으면 login으로 리다이렉트
      redirect("/login");
    } else {
      redirect("/app");
    }
  }, []);

  // 이 페이지는 실제로 렌더링되지 않습니다.
  return null;
}
