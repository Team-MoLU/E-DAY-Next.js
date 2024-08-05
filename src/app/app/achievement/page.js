"use client";
import { useEffect } from "react";
import { setMenu } from "@/redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

export default function AchievementPage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setMenu("achievement"));
  }, []);

  return (
    <div>
      <h1>This is Achievement page</h1>
    </div>
  );
}
