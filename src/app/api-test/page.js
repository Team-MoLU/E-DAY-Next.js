export default async function ApiTestPage() {
  //const response = await fetch("http://3.38.4.187:8080/test");
  const response = await fetch("http://spring-container:8080/test");
  const apiText = await response.text(); // 문자열로 변환

  return (
    <div>
      <h1>This is API Test page</h1>
      <a>{apiText}</a>
    </div>
  );
}
