"use client";
import { useEffect } from "react";
import { setMenu } from "@/redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

export default function NotificationPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMenu("notification"));
  }, []);
  return (
    <div>
      <h1>This is Notification page</h1>
    </div>
  );
}
