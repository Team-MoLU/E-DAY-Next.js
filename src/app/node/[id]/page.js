import Link from "next/link";

export default async function NodePage(props) {
  const response = await fetch("http://localhost:8080/node/" + props.params.id);
  const node = await response.json();
  const subNodes = node.subNodes;

  return (
    <div>
      {/* <h1>node의 경로 표시해줘야</h1> */}
      <h1>current node id: {node.id}</h1>
      <ul>
        {subNodes.map((node, index) => (
          <Link href={"/node/" + node.id} key={node.id}>
            <li className="node-item">{node.text}</li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
