import FetchTestComponent from "@/components/FetchTestComponent";
import Counter from "../components/Counter";

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Next.js with Redux</h1>
      <Counter />
      <h1>FetchTestComponent</h1>
      <FetchTestComponent />
    </div>
  );
};

export default HomePage;
