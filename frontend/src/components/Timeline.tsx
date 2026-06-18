"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Timeline({ events, onEventClick }: { events: any[], onEventClick: (e: any) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || events.length === 0) return;
    
    // Clear previous SVG
    d3.select(containerRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const margin = { top: 20, right: 30, bottom: 30, left: 30 };

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // X Scale: 0 to 90+ minutes
    const maxMinute = Math.max(90, d3.max(events, d => d.minute) || 90);
    const xScale = d3.scaleLinear()
      .domain([0, maxMinute + 5])
      .range([margin.left, width - margin.right]);

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d => `${d}'`);
    svg.append("g")
      .attr("transform", `translate(0,${height / 2})`)
      .attr("class", "text-gray-500 font-mono text-xs")
      .call(xAxis)
      .select(".domain")
      .attr("stroke", "#25303B");
    
    // Points
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#0B0F12")
      .style("border", "1px solid #00E5FF")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "10")
      .style("font-family", "var(--font-plus-jakarta)");

    svg.selectAll("circle")
      .data(events)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.minute))
      .attr("cy", height / 2)
      .attr("r", 8)
      .attr("fill", "#00E5FF")
      .attr("stroke", "#131A20")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .style("transition", "r 0.2s ease, fill 0.2s ease")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "#39FF14").attr("r", 12);
        tooltip.html(`<strong>${d.minute}'</strong><br/>${d.desc}`)
          .style("visibility", "visible")
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "#00E5FF").attr("r", 8);
        tooltip.style("visibility", "hidden");
      })
      .on("click", (event, d) => {
        onEventClick(d);
      });

  }, [events, onEventClick]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-gray-500">
          Loading timeline data...
        </div>
      )}
    </div>
  );
}
