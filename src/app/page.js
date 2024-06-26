import { redirect } from "next/navigation";

export default function RootPage() {
  // 클라이언트 사이드에서 리다이렉션을 처리합니다.
  redirect("/app");
  // 이 페이지는 실제로 렌더링되지 않습니다.
  return null;
}
