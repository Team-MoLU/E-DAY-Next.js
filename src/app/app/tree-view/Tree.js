"use client";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const Tree = ({ data }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const [root, setRoot] = useState(null);

  useEffect(() => {
    if (!data) return;

    const width = 800;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = d3.select(gRef.current).attr("transform", "translate(40,0)");

    const tree = d3.tree().size([height, width - 160]);
    const root = d3.hierarchy(data);
    tree(root);

    setRoot(root);

    return () => {
      // Cleanup
    };
  }, [data]);

  useEffect(() => {
    if (!root) return;

    const updateTree = () => {
      const tree = d3.tree().size([600, 760]);
      tree(root);

      const nodes = root.descendants();
      const links = root.links();

      // Links
      const link = d3
        .select(gRef.current)
        .selectAll(".link")
        .data(links, (d) => d.target.id);

      link
        .enter()
        .append("path")
        .attr("class", "link")
        .merge(link)
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        )
        .style("fill", "none")
        .style("stroke", "#555")
        .style("stroke-opacity", 0.4)
        .style("stroke-width", "1.5px");

      link.exit().remove();

      // Nodes
      const node = d3
        .select(gRef.current)
        .selectAll(".node")
        .data(nodes, (d) => d.id);

      const nodeEnter = node
        .enter()
        .append("g")
        .attr(
          "class",
          (d) => `node${d.children ? " node--internal" : " node--leaf"}`
        )
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .call(
          d3
            .drag()
            .subject((event, d) => ({ x: d.y, y: d.x }))
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded)
        );

      nodeEnter
        .append("circle")
        .attr("r", 10)
        .style("fill", "#999")
        .style("stroke", "steelblue")
        .style("stroke-width", "1.5px")
        .on("click", (event, d) => {
          alert(`Node ${d.data.name} clicked!`);
        });

      nodeEnter
        .append("text")
        .attr("dy", 3)
        .attr("x", (d) => (d.children ? -12 : 12))
        .style("text-anchor", (d) => (d.children ? "end" : "start"))
        .text((d) => d.data.name)
        .style("font", "12px sans-serif");

      node
        .merge(nodeEnter)
        .transition()
        .duration(500)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      node.exit().remove();
    };

    let draggedNode = null;
    let tempLink = null;

    function dragStarted(event, d) {
      draggedNode = d;
      // Hide the link to the parent
      d3.select(gRef.current)
        .selectAll(".link")
        .filter((l) => l.target === d)
        .style("opacity", 0);
    }

    function dragged(event, d) {
      const [x, y] = d3.pointer(event, gRef.current);
      d.x = y;
      d.y = x;
      d3.select(event.sourceEvent.target.closest(".node")).attr(
        "transform",
        `translate(${x},${y})`
      );

      const closestNode = findClosestNode(event);

      // Remove previous temp link if exists
      if (tempLink) tempLink.remove();

      // Create new temp link if a close node is found
      if (closestNode && closestNode !== d && !isDescendant(d, closestNode)) {
        tempLink = d3
          .select(gRef.current)
          .append("path")
          .attr("class", "temp-link")
          .attr(
            "d",
            d3
              .linkHorizontal()
              .x((n) => (n === d ? x : closestNode.y))
              .y((n) => (n === d ? y : closestNode.x))({
              source: closestNode,
              target: d,
            })
          )
          .style("fill", "none")
          .style("stroke", "#555")
          .style("stroke-opacity", 0.4)
          .style("stroke-width", "1.5px")
          .style("stroke-dasharray", "5,5");
      }
    }

    function dragEnded(event, d) {
      const closestNode = findClosestNode(event);

      if (closestNode && closestNode !== d && !isDescendant(d, closestNode)) {
        // Remove the node and its children from its current parent
        if (d.parent) {
          d.parent.children = d.parent.children.filter((child) => child !== d);
          if (d.parent.children.length === 0) {
            delete d.parent.children;
          }
        }

        // Add the node and its children to the new parent
        if (!closestNode.children) closestNode.children = [];
        closestNode.children.push(d);
        d.parent = closestNode;

        // Update the tree
        updateTree();
      } else {
        // If no valid new parent, revert the position
        updateTree();
      }

      // Remove temp link
      if (tempLink) tempLink.remove();

      // Show all links again
      d3.select(gRef.current).selectAll(".link").style("opacity", 1);

      draggedNode = null;
    }

    function findClosestNode(event) {
      const [x, y] = d3.pointer(event, gRef.current);
      const nodes = root.descendants();
      const threshold = 30; // Adjust this value to change the "close enough" distance

      return nodes.find((node) => {
        const dx = node.y - x;
        const dy = node.x - y;
        return Math.sqrt(dx * dx + dy * dy) < threshold && node !== draggedNode;
      });
    }

    function isDescendant(parent, child) {
      if (parent === child) return true;
      if (!parent.children) return false;
      return parent.children.some((d) => isDescendant(d, child));
    }

    updateTree();
  }, [root]);

  return (
    <svg ref={svgRef}>
      <g ref={gRef}></g>
    </svg>
  );
};

export default Tree;
