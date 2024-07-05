import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { updateTask } from "../redux/reducers/taskSlice";

// 컨텍스트 메뉴 컴포넌트
const ContextMenu = React.memo(({ x, y, node, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef(null);

  // 컴포넌트 마운트 시 메뉴를 보이게 함
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 외부 클릭 감지 및 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsVisible(false);
        setTimeout(onClose, 200); // 페이드아웃 애니메이션 완료 후 메뉴 닫기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 메뉴 옵션 클릭 처리
  const handleOptionClick = (option) => {
    console.log(`${option} clicked`, node);
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  // 메뉴 옵션 렌더링
  const renderMenuOptions = () => {
    return ["생성", "삭제", "이동"].map((option) => (
      <div
        key={option}
        onClick={() => handleOptionClick(option)}
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          transition: "background-color 150ms ease-in-out",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        {option}
      </div>
    ));
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: "absolute",
        top: y,
        left: x,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px 0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "scale(1) translateY(0)"
          : "scale(0.95) translateY(-20px)",
        transition: "opacity 200ms ease-in-out, transform 200ms ease-in-out",
      }}
    >
      <div
        style={{
          padding: "8px 16px",
          fontWeight: "bold",
        }}
      >
        {node.data.name}
      </div>
      {renderMenuOptions()}
    </div>
  );
});

ContextMenu.displayName = "ContextMenu";

// 트리 컴포넌트
const Tree = React.memo(({ width, height, onNodeClick }) => {
  const data = useSelector((state) => state.tasks.root);
  const dispatch = useDispatch();
  const svgRef = useRef(null);
  const scaleRef = useRef(d3.zoomIdentity);
  const simulationRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  const memoizedData = useMemo(() => data.children || [], [data]);

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

  // 노드 우클릭 시 컨텍스트 메뉴 표시
  const handleNodeContextMenu = useCallback(
    (event, d) => {
      event.preventDefault();
      event.stopPropagation();
      const [x, y] = d3.pointer(event, svgRef.current);
      // 새로운 노드를 우클릭할 때 컨텍스트 메뉴 위치 업데이트
      setContextMenu({
        x: x + width / 2,
        y: y + height / 2,
        node: d,
      });
    },
    [width, height]
  );

  const handleSvgContextMenu = useCallback((event) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      setContextMenu(null);
    }
  }, []);

  // 컨텍스트 메뉴 닫기
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // SVG 배경 클릭 시 컨텍스트 메뉴 닫기
  const handleSvgClick = useCallback(
    (event) => {
      if (event.target.tagName === "svg") {
        closeContextMenu();
      }
    },
    [closeContextMenu]
  );

  // 트리 렌더링 함수
  const renderTree = useCallback(() => {
    if (!memoizedData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // SVG 설정
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .on("contextmenu", handleSvgContextMenu)
      .on("click", handleSvgClick);

    const g = svg.append("g");

    // 줌 기능 설정
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

    svg.call(zoom);
    svg.on("dblclick.zoom", null);
    svg.on("contextmenu", handleSvgContextMenu);

    // 데이터 계층 구조 생성
    const roots = memoizedData.map((d) => d3.hierarchy(d));
    const links = roots.flatMap((root) => root.links());
    const nodes = roots.flatMap((root) => root.descendants());

    // 레이아웃 설정
    const radius = Math.min(width, height) / 2 - 100;
    const radialScale = d3
      .scaleLinear()
      .domain([0, d3.max(nodes, (d) => d.depth)])
      .range([0, radius]);

    // 노드 초기 위치 설정
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

    // 시뮬레이션 설정
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

    // 링크 렌더링
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");

    // 랜덤 색상 생성 함수
    const getRandomColor = () => {
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
    };

    // 노드 렌더링
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag())
      .on("click", (event, d) => {
        event.stopPropagation();
        closeContextMenu();
        onNodeClick(d.data);
      })
      .on("contextmenu", handleNodeContextMenu);

    node
      .append("circle")
      .attr("fill", (d) => (d.depth === 0 ? getRandomColor() : "gray"))
      .attr("stroke-width", 1.5)
      .attr("r", (d) => (d.depth === 0 ? 7 : 5))
      .style("cursor", "pointer");

    // 레이블 렌더링
    const labels = node
      .append("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("font-size", "10px")
      .style("fill", "black")
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
    memoizedData,
    width,
    height,
    onNodeClick,
    drag,
    handleNodeContextMenu,
    handleSvgContextMenu,
    closeContextMenu,
    handleSvgClick,
  ]);
  // 트리 렌더링 효과
  useEffect(() => {
    renderTree();
  }, [renderTree]);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
});
Tree.displayName = "Tree";
export default Tree;
