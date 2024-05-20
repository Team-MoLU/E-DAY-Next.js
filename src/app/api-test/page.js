export default async function ApiTestPage() {
  const response = await fetch("http://localhost:8080/test");
  const apiText = response.text();

  return (
    <div>
      <h1>This is API Test page</h1>
      <a>{apiText}</a>
    </div>
  );
}
