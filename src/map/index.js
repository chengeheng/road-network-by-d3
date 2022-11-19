import React, { useEffect, useMemo, useReducer, useRef } from "react";
import * as d3 from "d3";

import "./index.css";

const defaultState = {
  width: 0,
  height: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "updateWidthAndHeight": {
      const { width, height } = action.value;
      return {
        ...state,
        width,
        height,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const Map = (props) => {
  const [store, dispatch] = useReducer(reducer, defaultState);
  const { children, center, onClick } = props;
  const ref = useRef();
  const dataRef = useRef({});
  const { width, height } = store;
  const projection = useMemo(() => {
    if (width > 0 && height > 0) {
      return d3
        .geoMercator()
        .scale(50000000)
        .center(center)
        .translate([width / 2, height / 2]);
    }
    return null;
  }, [width, height, center]);

  const content = useMemo(() => {
    if (projection && children) {
      if (Object.prototype.toString.call(children) === "[object Object]") {
        return React.cloneElement(children, {
          projection,
          id: 1,
          coordinate: d3.select(".container").node(),
        });
      } else {
        return children.map((i, index) =>
          React.cloneElement(i, {
            key: index + 1,
            projection,
            id: index + 1,
            coordinate: d3.select(".container").node(),
          })
        );
      }
    }
  }, [children, projection]);

  useEffect(() => {
    if (ref.current) {
      const g = d3.select(".container");
      // if (g) g.remove();
      const dom = ref.current;
      const rect = dom.getBoundingClientRect();
      const svg = d3.select(ref.current).select("svg");
      // svg.append("g")
      dataRef.current.width = rect.width;
      dataRef.current.height = rect.height;
      svg.attr("width", rect.width);
      svg.attr("height", rect.height);
      g.attr("width", rect.width);
      g.attr("height", rect.height);
      dispatch({
        type: "updateWidthAndHeight",
        value: {
          width: rect.width,
          height: rect.height,
        },
      });
    }
  }, [ref, dispatch]);

  useEffect(() => {
    if (projection) {
      const svg = d3.select(ref.current).select("svg");
      const g = d3.select(".container");
      // const base1 = svg.append("g").attr("class", "base-1");
      // base1
      //   .selectAll("circle")
      //   .data(data.point)
      //   .enter()
      //   .append("circle")
      //   .attr("cx", (d) => projection(d.coordinates)[0])
      //   .attr("cy", (d) => projection(d.coordinates)[1])
      //   .attr("r", 2)
      //   .attr("fill", "#000");

      // const base2 = g.append("g").attr("class", "base-2");
      // base2
      //   .selectAll("path")
      //   .data(data.polygons)
      //   .enter()
      //   .append("path")
      //   .attr("d", path)
      //   .attr("stroke", "#AC9980")
      //   .attr("stoke-width", 0.5)
      //   .attr("fill", (d) =>
      //     d.geometry.type === "Polygon" ? "#FDBE6E" : "transparent"
      //   )
      //   .on("click", (e) => {
      //     console.log(e);
      //     e.preventDefault();
      //     e.stopPropagation();
      //   });

      const zoomed = (e) => {
        g.attr("transform", e.transform);
      };

      svg.call(
        d3
          .zoom()
          .scaleExtent([1 / 10, 15])
          .on("zoom", zoomed)
      );
      svg.on("click", (e) => {
        if (onClick) {
          onClick(projection.invert(d3.pointer(e, g.node())), e);
        }
      });
    }
  }, [projection, ref, onClick]);

  return (
    <div className="map" ref={ref}>
      <svg>
        <g className="container">{content}</g>
      </svg>
    </div>
  );
};

export default Map;
