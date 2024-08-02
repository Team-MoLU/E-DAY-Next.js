"use client";
import { useEffect } from "react";
import { setMenu } from "@/redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

export default function CalendarPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMenu("calendar"));
  }, []);

  return (
    <div>
      <h1>This is Calendar page</h1>
    </div>
  );
}
