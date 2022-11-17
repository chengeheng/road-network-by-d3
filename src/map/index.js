import { useEffect, useMemo, useReducer, useRef } from "react";
import * as d3 from "d3";

import "./index.css";

const data = {
  point: [
    {
      type: "Point",
      coordinates: [118.349298, 31.366987],
    },
    {
      type: "Point",
      coordinates: [118.459035, 31.366185],
    },
    {
      type: "Point",
      coordinates: [118.458101, 31.320973],
    },
    {
      type: "Point",
      coordinates: [118.343836, 31.322577],
    },
  ],
  path: [],
};

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

const Map = () => {
  const ref = useRef();
  const dataRef = useRef({});
  const [store, dispatch] = useReducer(reducer, defaultState);

  const { width, height } = store;
  const projection = useMemo(() => {
    if (width > 0 && height > 0) {
      return d3
        .geoMercator()
        .scale(450000)
        .center([118.399531, 31.343613])
        .translate([1920 / 2, 1080 / 2]);
    }
    return null;
  }, [width, height]);

  useEffect(() => {
    if (ref.current) {
      let svg = d3.select(ref.current).select("svg");
      if (svg) svg.remove();
      const dom = ref.current;
      const rect = dom.getBoundingClientRect();
      svg = d3.select(dom).append("svg");
      dataRef.current.width = rect.width;
      dataRef.current.height = rect.height;
      svg.attr("width", rect.width);
      svg.attr("height", rect.height);
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
      const g = svg.append("g");
      const zoomed = () => {
        g.attr("transform", d3.event.transform);
      };
      g.selectAll("circle")
        .data(data.point)
        .enter()
        .append("circle")
        .attr("cx", (d) => projection(d.coordinates)[0])
        .attr("cy", (d) => projection(d.coordinates)[1])
        .attr("r", 2)
        .attr("fill", "#000");

      svg.call(
        d3
          .zoom()
          .scaleExtent([1 / 2, 8])
          .on("zoom", zoomed)
      );

      svg.on("click", (...e) => {
        console.log(d3.mouse(g.node()));
      });
    }
  }, [projection, ref]);

  return <div className="map" ref={ref}></div>;
};

export default Map;
