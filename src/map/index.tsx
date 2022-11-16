import React, { useEffect, useReducer, useRef } from "react";

import * as d3 from "d3";

import "./index.css";

interface PointProps {
  dataSource: Object;
}

const PointLayer: React.FC<PointProps> = ({ dataSource }) => {
  return (
    <>
      <g></g>
      <g></g>
    </>
  );
};

type State = {};

type Action = {
  type?: string;
  value: object;
};

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "add": {
      return { ...state };
    }
    default: {
      return { ...state };
    }
  }
};

const Map: React.FunctionComponent = () => {
  const [store, dispatch] = useReducer(reducer, {});
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current) {
      const svgDom = ref.current;
      const rect = svgDom.getBoundingClientRect();
      console.log(rect);
      const svg = d3.select(ref.current);
      svg.attr("width", rect.width);
      svg.attr("height", rect.height);

      console.log(d3, svg, document.getElementsByTagName("svg"));
    }
  }, [ref]);

  return <svg className="map" ref={ref}></svg>;
};

export { Map as default, PointLayer };
