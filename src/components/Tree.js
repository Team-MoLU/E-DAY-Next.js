import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";

const Tree = ({ width, height }) => {
  const data = useSelector((state) => state.tasks.root);
  const svgRef = useRef(null);
  const scaleRef = useRef(1);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!data) return;

    // SVG 초기화
    d3.select(svgRef.current).selectAll("*").remove();

    // SVG 생성
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // 확대를 위한 그룹 생성
    const g = svg.append("g");

    // 트리구조 D3 생성
    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    // 노드 간 동작(force)
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => (d.source.depth === 0 ? 10 : 50))
          .strength(1)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter())
      .force(
        "radial",
        d3.forceRadial((d) => d.depth * 100, 0, 0)
      );

    // 링크 생성
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .style("opacity", (d) => (d.source.depth === 0 ? 0 : 1)); // 루트 노드는 숨기기

    // 노드 그룹 생성
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation))
      .style("opacity", (d) => (d.depth === 0 ? 0 : 1)); // // 루트 노드는 숨기기

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

    // 개별 노드 스타일 지정
    node
      .append("circle")
      .attr("fill", (d) => (d.depth === 1 ? getRandomColor() : "gray"))
      .attr("stroke-width", 1.5)
      .attr("r", (d) => (d.depth === 1 ? 7 : 5));

    // 노드 이름 라벨 지정
    const labels = node
      .append("text")
      .attr("dx", 8)
      .attr("dy", ".35em")
      .text((d) => (d.depth === 0 ? "" : d.data.name))
      .style("font-size", "10px")
      .style("fill", "black")
      .style("opacity", 0);

    // 노드 이름 보이기/안보이기(호버링 시)
    const updateLabelVisibility = () => {
      labels.style("opacity", (d) => {
        if (d.depth === 0) return 0; // Always hide root label
        return scaleRef.current > 1.5 || d.isHovered ? 1 : 0;
      });
    };

    // 마우스 호버링 이벤트
    node
      .on("mouseover", function (event, d) {
        if (d.depth === 0) return;
        d.isHovered = true;
        updateLabelVisibility();
      })
      .on("mouseout", function (event, d) {
        if (d.depth === 0) return;
        d.isHovered = false;
        updateLabelVisibility();
      });

    // 시뮬레이션 업데이트
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // 확대 함수
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        scaleRef.current = event.transform.k;
        updateLabelVisibility();
        forceUpdate({}); // Force a re-render to update any components that depend on scale
      });

    svg.call(zoom);

    // 마우스 휠로 확대/축소
    svg.on("wheel", (event) => {
      event.preventDefault();
      const delta = event.deltaY;
      const currentTransform = d3.zoomTransform(svg.node());
      const newScale =
        delta > 0 ? currentTransform.k * 0.95 : currentTransform.k * 1.05;
      const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(newScale);
      svg.call(zoom.transform, newTransform);
    });

    // 드래그
    function drag(simulation) {
      function dragstarted(event, d) {
        if (d.depth === 0) return; // 루트는 드래그 안되게 막기
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        if (d.depth === 0) return; // 루트는 드래그 안되게 막기
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (d.depth === 0) return; // 루트는 드래그 안되게 막기
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // 노드 이름 라벨 초기화
    updateLabelVisibility();

    // 시뮬레이션 중지
    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default Tree;
