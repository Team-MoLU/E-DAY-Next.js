"use client";
import { useEffect } from "react";
import { setMenu } from "@/redux/reducers/menuSlice";
import { useDispatch } from "react-redux";

export default function RetrospectPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMenu("retrospect"));
  }, []);

  return (
    <div>
      <h1>This is Retrospect page</h1>
    </div>
  );
}
