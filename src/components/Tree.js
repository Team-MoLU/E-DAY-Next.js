import React, { useRef, useEffect, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import common from "@/lib/common/common_fn";

// 트리 컴포넌트
const Tree = React.memo(({ width, height, onNodeClick }) => {
  const data = useSelector((state) => state.tasks.root);
  const filter = useSelector((state) => state.ui.treeFilter);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const scaleRef = useRef(d3.zoomIdentity);
  const simulationRef = useRef(null);
  const primaryColor = useSelector((state) => state.theme.primaryColor);

  const memoizedData = useMemo(() => data.children || [], [data]);

  const filteredData = useMemo(() => {
    if (filter.selectedRoots.length === 0) {
      return memoizedData;
    }
    return memoizedData.filter((root) =>
      filter.selectedRoots.includes(root.id)
    );
  }, [memoizedData, filter.selectedRoots]);

  const filterNode = useCallback(
    (node, isRoot = false) => {
      // 검색어 필터링
      if (
        filter.searchTerm &&
        !node.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(filter.searchTerm.toLowerCase().replace(/\s+/g, ""))
      ) {
        return false;
      }

      // 선택된 루트 필터링
      if (
        filter.selectedRoots.length > 0 &&
        isRoot &&
        !filter.selectedRoots.includes(node.id)
      ) {
        return false;
      }

      // 루트 노드 필터링
      if (isRoot) {
        if (
          filter.showRootsWithChildren &&
          (!node.children || node.children.length === 0)
        ) {
          return false;
        }
      }

      // 완료된 할 일 필터링
      if (
        !filter.showCompletedTasks &&
        node.check &&
        allChildrenCompleted(node)
      ) {
        return false;
      }

      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter]
  );

  const allChildrenCompleted = useCallback((node) => {
    if (!node.children || node.children.length === 0) {
      return true;
    }
    return node.children.every(
      (child) => child.check && allChildrenCompleted(child)
    );
  }, []);

  const processedData = useMemo(() => {
    const processTree = (node, isRoot = false) => {
      if (!node) return null;

      const nodeMatches = filterNode(node, isRoot);
      let filteredChildren = [];

      if (node.children) {
        filteredChildren = node.children
          .map((child) => processTree(child, false))
          .filter(Boolean);
      }

      if (nodeMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          _matches:
            nodeMatches || filteredChildren.some((child) => child._matches),
        };
      }

      return null;
    };

    return filteredData.map((root) => processTree(root, true)).filter(Boolean);
  }, [filteredData, filterNode]);

  // 노드 드래그 기능 구현
  const drag = useCallback(() => {
    const dragstarted = (event, d) => {
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event, d) => {
      if (!event.active) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }, []);

  // 줌 기능 설정
  const setupZoom = useCallback(() => {
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        scaleRef.current = event.transform;
        svg.select("g").attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);
  }, []);

  // 트리 렌더링 함수
  const renderTree = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!processedData.length) {
      return;
    }

    // SVG 설정
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    const g = svg.append("g");

    // 데이터 계층 구조 생성
    const roots = processedData.map((d) => d3.hierarchy(d));
    const links = roots.flatMap((root) => root.links());
    const nodes = roots.flatMap((root) => root.descendants());

    // 레이아웃 설정
    const minRadius = 200; // 최소 반지름
    const maxRadius = Math.min(width, height) / 2 - 100; // 최대 반지름
    const rootCount = roots.length;
    const dynamicRadius = Math.min(maxRadius, minRadius + rootCount * 30);

    const radialScale = d3
      .scaleLinear()
      .domain([0, d3.max(nodes, (d) => d.depth)])
      .range([dynamicRadius * 0.2, dynamicRadius * 0.9]);

    // 노드 초기 위치 설정
    const groupAngle = (2 * Math.PI) / roots.length;
    roots.forEach((root, i) => {
      const rootAngle = i * groupAngle;
      const centerX = dynamicRadius * Math.cos(rootAngle);
      const centerY = dynamicRadius * Math.sin(rootAngle);
      root.x = centerX;
      root.y = centerY;
      root.initialAngle = rootAngle; // 루트 노드의 초기 각도 저장

      root.descendants().forEach((node, j) => {
        if (node !== root) {
          const depthRadius = radialScale(node.depth);
          const siblingAngle =
            node.parent.children.length > 1
              ? (j / (node.parent.children.length - 1) - 0.5) * (Math.PI / 8)
              : 0;
          const nodeAngle = rootAngle + siblingAngle;
          node.x = depthRadius * Math.cos(nodeAngle);
          node.y = depthRadius * Math.sin(nodeAngle);
          node.initialAngle = nodeAngle; // 하위 노드의 초기 각도 저장
        }
      });
    });

    // 시뮬레이션 설정
    if (!simulationRef.current) {
      simulationRef.current = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.data.id)
            .distance(
              (d) => radialScale(d.target.depth) - radialScale(d.source.depth)
            )
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(-100)) // 척력 증가
        .force(
          "radial",
          d3.forceRadial((d) => radialScale(d.depth), 0, 0).strength(1) // radial force 강도 증가
        )
        .force("center", d3.forceCenter(0, 0))
        .force("collision", d3.forceCollide().radius(10)) // 충돌 반지름 증가
        .on("tick", () => {
          nodes.forEach((node) => {
            if (node.depth === 0) {
              // 루트 노드들은 초기 각도를 유지하도록 함
              const rootAngle = node.initialAngle;
              node.x = dynamicRadius * Math.cos(rootAngle);
              node.y = dynamicRadius * Math.sin(rootAngle);
            } else {
              // 하위 노드들은 루트 노드의 각도를 유지하면서 바깥쪽으로 위치하도록 함
              const depthRadius = radialScale(node.depth);
              node.x = depthRadius * Math.cos(node.initialAngle);
              node.y = depthRadius * Math.sin(node.initialAngle);
            }
          });
        });
    } else {
      simulationRef.current.nodes(nodes);
      simulationRef.current.force("link").links(links);
      simulationRef.current.force("radial").radius((d) => radialScale(d.depth));
    }

    simulationRef.current.alpha(0.3).restart();

    // 노드의 경로를 구하는 함수
    const findNodePathById = (nodeId, tree = data, path = []) => {
      if (tree.id === nodeId) {
        return path;
      }
      if (tree.children) {
        for (let i = 0; i < tree.children.length; i++) {
          const result = findNodePathById(nodeId, tree.children[i], [
            ...path,
            i,
          ]);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    // 최상위 노드의 id 반환 함수
    function findTopLevelParentId(tree, targetId, currentPath = []) {
      if (tree.id === targetId) {
        return currentPath.length > 0 ? currentPath[0] : tree.id;
      }

      if (tree.children && tree.children.length > 0) {
        for (let i = 0; i < tree.children.length; i++) {
          const result = findTopLevelParentId(
            tree.children[i],
            targetId,
            currentPath.length === 0 ? [tree.children[i].id] : currentPath
          );
          if (result) return result;
        }
      }

      return null;
    }

    // 링크 렌더링
    const link = g
      .append("g")
      .attr("stroke-opacity", 0.7)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => {
        // 타겟 노드의 상태를 기준으로 색상 결정
        if (d.target.data.check) {
          // const topLevelParentId = findTopLevelParentId(data, d.target.data.id);
          // return common.getLighterColorFromUuid(topLevelParentId, 15);
          return common.getLighterColor(primaryColor, 15);
        } else {
          return "#383A41";
        }
      });

    // 노드 렌더링
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag())
      .on("click", (event, d) => {
        event.stopPropagation();
        const path = findNodePathById(d.data.id);
        onNodeClick(data, path);
      });

    node
      .append("circle")
      .attr("fill", (d) =>
        d.depth === 0
          ? primaryColor
          : d.data.check
          ? common.getLighterColor(primaryColor, 15)
          : "#383A41"
      )
      .attr("stroke-width", 1.5)
      .attr("r", (d) => (d.depth === 0 ? 12 : 10))
      .style("cursor", "pointer");

    // 검색어와 일치하는 노드 강조
    node
      .filter(
        (d) =>
          filter.searchTerm &&
          d.data.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(filter.searchTerm.toLowerCase().replace(/\s+/g, "")) &&
          d.data._matches
      )
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? 16 : 14))
      .attr("fill", "none")
      .attr("stroke", (d) => common.getLighterColor(primaryColor, 5))
      .attr("stroke-width", 2);

    // 레이블 렌더링
    const labels = node
      .append("text")
      .attr("dy", 24)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("font-size", "10px")
      .style("fill", "#EAEDF3")
      .style("opacity", 0);

    // 레이블 가시성 업데이트 함수
    const updateLabelVisibility = () => {
      labels
        .transition()
        .duration(250)
        .ease(d3.easeCubicOut)
        .style("opacity", (d) =>
          scaleRef.current.k > 1.5 || d.isHovered ? 1 : 0
        );
    };

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        scaleRef.current = event.transform;
        g.transition()
          .duration(250)
          .ease(d3.easeCubicOut)
          .attr("transform", scaleRef.current);
        updateLabelVisibility();
      });

    // 저장된 줌 상태 적용
    if (zoomRef.current) {
      svg.call(zoomRef.current.transform, scaleRef.current);
    }
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

    // 연결된 노드 강조 함수
    const highlightConnectedNodes = (d, opacity) => {
      const t = d3.transition().duration(250).ease(d3.easeCubicOut);
      const connectedNodes = [d, ...d.descendants()];

      node.transition(t).style("opacity", opacity);
      link.transition(t).style("opacity", opacity);
      labels.transition(t).style("opacity", 0);

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

    // 노드 호버 이벤트 처리
    node
      .on("mouseover", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.depth === 0 ? 14 : 12));
        highlightConnectedNodes(d, 0.2);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.depth === 0 ? 12 : 10));

        const t = d3.transition().duration(250).ease(d3.easeCubicOut);
        node.transition(t).style("opacity", 1);
        link.transition(t).style("opacity", 1);
        updateLabelVisibility();
      });

    // 시뮬레이션 틱 이벤트 처리
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
  }, [
    primaryColor,
    data,
    filter.searchTerm,
    processedData,
    width,
    height,
    onNodeClick,
    drag,
  ]);

  // 줌 초기 설정
  useEffect(() => {
    setupZoom();
  }, [setupZoom]);

  // 트리 렌더링 효과
  useEffect(() => {
    renderTree();
  }, [renderTree]);

  // 빈 상태 메시지 컴포넌트
  const EmptyStateMessage = () => (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "#666",
        fontSize: "1.2rem",
      }}
    >
      할 일이 존재하지 않습니다
    </div>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {!processedData.length && <EmptyStateMessage />}
    </div>
  );
});
Tree.displayName = "Tree";
export default Tree;
