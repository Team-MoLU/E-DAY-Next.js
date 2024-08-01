"use client";
import { useEffect } from "react";
import { setMenu } from "@/redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

export default function SettingPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMenu("setting"));
  }, []);
  return (
    <div>
      <h1>This is Setting page</h1>
    </div>
  );
}
