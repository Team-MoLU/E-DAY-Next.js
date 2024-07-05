import React, { useRef, useEffect, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { updateTask } from "../redux/reducers/taskSlice";

const Tree = React.memo(({ width, height, onNodeClick }) => {
  const data = useSelector((state) => state.tasks.root);
  const dispatch = useDispatch();
  const svgRef = useRef(null);
  const scaleRef = useRef(1);
  const simulationRef = useRef(null);

  const memoizedData = useMemo(() => data, [data]);

  const drag = useCallback(() => {
    function dragstarted(event, d) {
      if (d.depth < 1) return;
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      if (d.depth < 1) return;
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (d.depth < 1) return;
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
    if (!memoizedData) return;

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
        const duration = 250; // 애니메이션 지속 시간
        const ease = d3.easeCubicOut; // 애니메이션 easing 함수

        scaleRef.current = event.transform;

        g.transition()
          .duration(duration)
          .ease(ease)
          .attr("transform", scaleRef.current);

        // 줌 레벨에 따른 라벨 opacity 업데이트
        labels
          .transition()
          .duration(duration)
          .ease(ease)
          .style("opacity", (d) => {
            if (d.depth === 0) return 0;
            return event.transform.k > 1.5 || d.isHovered ? 1 : 0;
          });
      });

    svg.call(zoom);
    svg.on("dblclick.zoom", null);

    const root = d3.hierarchy(memoizedData);
    const links = root.links();
    const nodes = root.descendants();

    if (!simulationRef.current) {
      simulationRef.current = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance((d) => (d.source.depth === 0 ? 10 : 50))
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter());
    } else {
      simulationRef.current.nodes(nodes);
      simulationRef.current.force("link").links(links);
      simulationRef.current.alpha(1).restart();
    }

    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .style("opacity", (d) => (d.source.depth === 0 ? 0 : 1));

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
        if (d.depth > 0) {
          event.stopPropagation();
          onNodeClick(d.data);
        }
      })
      .style("opacity", (d) => (d.depth === 0 ? 0 : 1));

    node
      .append("circle")
      .attr("fill", (d) => (d.depth === 1 ? getRandomColor() : "gray"))
      .attr("stroke-width", 1.5)
      .attr("r", (d) => (d.depth === 1 ? 7 : 5));

    const labels = node
      .append("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .text((d) => (d.depth === 0 ? "" : d.data.name))
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
          if (d.depth === 0) return 0;
          return scaleRef.current.k > 1.5 || d.isHovered ? 1 : 0;
        });
    };

    // 호버링 시 연결된 노드 강조 및 나머지 반투명화 함수
    const highlightConnectedNodes = (d, opacity) => {
      const t = d3.transition().duration(250).ease(d3.easeCubicOut);

      // 모든 노드와 엣지를 반투명하게 (root 노드 제외)
      node.transition(t).style("opacity", (n) => (n.depth === 0 ? 0 : opacity));
      link
        .transition(t)
        .style("opacity", (l) => (l.source.depth === 0 ? 0 : opacity));
      labels.transition(t).style("opacity", 0); // 라벨을 완전히 투명하게

      // 호버된 노드와 그 자식 노드들의 배열
      const connectedNodes = [d, ...d.descendants()];

      // 연결된 노드와 엣지 강조
      node
        .filter((n) => connectedNodes.includes(n) && n.depth !== 0)
        .transition(t)
        .style("opacity", 1);
      link
        .filter(
          (l) =>
            connectedNodes.includes(l.source) &&
            connectedNodes.includes(l.target) &&
            l.source.depth !== 0
        )
        .transition(t)
        .style("opacity", 1);

      // 호버된 노드와 직접 연결된 노드의 라벨만 표시
      labels
        .filter((n) => (n === d || n.parent === d) && n.depth !== 0)
        .transition(t)
        .style("opacity", 1);
    };

    // 마우스 호버링 이벤트
    node
      .on("mouseover", function (event, d) {
        if (d.depth === 0) return;
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.depth === 1 ? 9 : 7));
        highlightConnectedNodes(d, 0.2);
      })
      .on("mouseout", function (event, d) {
        if (d.depth === 0) return;
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.depth === 1 ? 7 : 5));

        // 트랜지션 설정
        const t = d3.transition().duration(250).ease(d3.easeCubicOut);

        // root를 제외한 모든 노드와 엣지의 opacity를 1로 복원
        node.transition(t).style("opacity", (n) => (n.depth === 0 ? 0 : 1));
        link
          .transition(t)
          .style("opacity", (l) => (l.source.depth === 0 ? 0 : 1));

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

    // 노드 이름 라벨 초기화
    updateLabelVisibility();

    return () => {
      simulation.stop();
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
