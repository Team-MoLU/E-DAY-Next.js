import Link from "next/link";

export default async function RootNodePage(props) {
  const nodeId = props.params.id;
  const response = await fetch("http://localhost:8080/root");
  const node = await response.json();
  const subNodes = node.subNodes;

  return (
    <div>
      <h1>user</h1>
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
