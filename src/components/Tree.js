import React, { useRef, useEffect, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { updateTask } from "../redux/reducers/taskSlice";

const Tree = React.memo(({ width, height, onNodeClick }) => {
  const data = useSelector((state) => state.tasks.root);
  const dispatch = useDispatch();
  const svgRef = useRef(null);
  const scaleRef = useRef(d3.zoomIdentity);
  const simulationRef = useRef(null);

  const memoizedData = useMemo(() => {
    // root의 children을 최상위 그룹으로 사용
    return data.children || [];
  }, [data]);

  const drag = useCallback(() => {
    function dragstarted(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }, []);

  const renderTree = useCallback(() => {
    if (!memoizedData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    const g = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        const duration = 250;
        const ease = d3.easeCubicOut;

        scaleRef.current = event.transform;

        g.transition()
          .duration(duration)
          .ease(ease)
          .attr("transform", scaleRef.current);

        updateLabelVisibility();
      });

    svg.call(zoom);
    svg.on("dblclick.zoom", null);

    // 각 그룹(원래 root의 children)을 독립적인 트리로 취급
    const roots = memoizedData.map((d) => d3.hierarchy(d));

    const links = roots.flatMap((root) => root.links());
    const nodes = roots.flatMap((root) => root.descendants());

    const radius = Math.min(width, height) / 2 - 100;
    const radialScale = d3
      .scaleLinear()
      .domain([0, d3.max(nodes, (d) => d.depth)])
      .range([0, radius]);

    // 초기 노드 위치 설정
    const groupAngle = (2 * Math.PI) / roots.length;
    roots.forEach((root, i) => {
      const centerX = radius * Math.cos(i * groupAngle);
      const centerY = radius * Math.sin(i * groupAngle);
      root.x = centerX;
      root.y = centerY;
      root.descendants().forEach((node, j) => {
        if (node !== root) {
          const angle = (j / (root.children?.length || 1)) * 2 * Math.PI;
          const nodeRadius = radialScale(node.depth - root.depth);
          node.x = centerX + nodeRadius * Math.cos(angle);
          node.y = centerY + nodeRadius * Math.sin(angle);
        }
      });
    });

    if (!simulationRef.current) {
      simulationRef.current = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(50)
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force(
          "radial",
          d3.forceRadial((d) => radialScale(d.depth)).strength(0.8)
        )
        .force("center", d3.forceCenter(0, 0))
        .force("collision", d3.forceCollide().radius(30));
    } else {
      simulationRef.current.nodes(nodes);
      simulationRef.current.force("link").links(links);
      simulationRef.current.force("radial").radius((d) => radialScale(d.depth));
    }

    simulationRef.current.alpha(0.1).restart();

    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");

    function getRandomColor() {
      const colors = [
        "red",
        "green",
        "yellow",
        "purple",
        "orange",
        "pink",
        "cyan",
        "magenta",
        "blue",
        "skyblue",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag())
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d.data);
      });

    node
      .append("circle")
      .attr("fill", (d) => (d.depth === 0 ? getRandomColor() : "gray"))
      .attr("stroke-width", 1.5)
      .attr("r", (d) => (d.depth === 0 ? 7 : 5));

    const labels = node
      .append("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("font-size", "10px")
      .style("fill", "black")
      .style("opacity", 0);

    // 노드 이름 보이기/안보이기(호버링 시)
    const updateLabelVisibility = () => {
      labels
        .transition()
        .duration(250)
        .ease(d3.easeCubicOut)
        .style("opacity", (d) => {
          return scaleRef.current.k > 1.5 || d.isHovered ? 1 : 0;
        });
    };

    // 호버링 시 연결된 노드 강조 및 나머지 반투명화 함수
    const highlightConnectedNodes = (d, opacity) => {
      const t = d3.transition().duration(250).ease(d3.easeCubicOut);

      node.transition(t).style("opacity", opacity);
      link.transition(t).style("opacity", opacity);
      labels.transition(t).style("opacity", 0);

      const connectedNodes = [d, ...d.descendants()];

      node
        .filter((n) => connectedNodes.includes(n))
        .transition(t)
        .style("opacity", 1);

      link
        .filter(
          (l) =>
            connectedNodes.includes(l.source) &&
            connectedNodes.includes(l.target)
        )
        .transition(t)
        .style("opacity", 1);

      labels
        .filter((n) => n === d || n.parent === d)
        .transition(t)
        .style("opacity", 1);
    };

    node
      .on("mouseover", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.depth === 0 ? 9 : 7));
        highlightConnectedNodes(d, 0.2);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.depth === 0 ? 7 : 5));

        const t = d3.transition().duration(250).ease(d3.easeCubicOut);
        node.transition(t).style("opacity", 1);
        link.transition(t).style("opacity", 1);
        updateLabelVisibility();
      });

    simulationRef.current.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    updateLabelVisibility();

    return () => {
      simulationRef.current.stop();
    };
  }, [memoizedData, width, height, onNodeClick, drag]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
});

Tree.displayName = "Tree";

export default Tree;
