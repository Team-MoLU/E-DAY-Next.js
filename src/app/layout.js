import "./globals.css";
import StoreProvider from "./StoreProvider";
import DndProvider from "./DndProvider";
import PrimaryColorSetter from "../components/PrimaryColorSetter";

export const metadata = {
  title: "E-day",
  description:
    "성장하는 나를 위한 할 일 관리 Cross Platform, Planner 어플리케이션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-pretendard">
        <StoreProvider>
          <DndProvider>
            <PrimaryColorSetter />
            {children}
          </DndProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
