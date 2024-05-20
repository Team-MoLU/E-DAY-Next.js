export default async function ApiTestPage() {
  const apiText = await fetch("http://spring-container:8080/test")
    .then((response) => response.text())
    .catch(() => "API Test fail");

  return (
    <div>
      <h1>This is API Test page</h1>
      <a>{apiText}</a>
    </div>
  );
}
