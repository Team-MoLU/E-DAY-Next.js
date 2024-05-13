import { useEffect, useState } from "react";

const FetchTestComponent = () => {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://spring-container:8080/test");
        const responseData = await response.text();
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <p>{data}</p>
    </div>
  );
};

export default FetchTestComponent;
