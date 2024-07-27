"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function PrimaryColorSetter() {
  const primaryColor = useSelector((state) => state.theme.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColor);
  }, [primaryColor]);

  return null;
}
