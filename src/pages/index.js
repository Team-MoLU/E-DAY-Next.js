import Counter from "../components/Counter";

const HomePage = ({ apiText }) => {
  return (
    <div>
      <h1>Welcome to Next.js with Redux</h1>
      <Counter />
      <h1>FetchTest</h1>
      <p>{apiText}</p>
    </div>
  );
};

export default HomePage;

export async function getServerSideProps() {
  try {
    // 여기서 서버 측 API 요청을 보냄
    const response = await fetch("http://spring-container:8080/test");
    const apiText = await response.text(); // 문자열로 변환

    return {
      props: {
        apiText,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        apiText: "error", // 에러 발생 시 빈 문자열 전달 또는 다른 처리 방법 선택
      },
    };
  }
}
