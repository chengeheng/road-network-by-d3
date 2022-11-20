import * as d3 from "d3";
import React, { useEffect } from "react";

const defaultPolygons = [];

const getConfig = (item = {}, params, key) => {
  const { properties = {} } = item;
  const { option = {} } = properties;
  return option[key] ?? params[key];
};

const PolygonLayer = (props) => {
  const {
    id,
    dataSource = defaultPolygons,
    projection,
    coordinate,
    options = {},
  } = props;
  useEffect(() => {
    if (projection) {
      const {
        onClick: layerClick,
        selectable = false,
        selectColor = "#fff",
        strokeColor = "#333",
        strokeWidth = 1,
        fillColor = "#fff",
      } = options;
      const optionParams = {
        selectable,
        selectColor,
        strokeColor,
        strokeWidth,
        fillColor,
      };

      const path = d3.geoPath().projection(projection);
      const base = d3.select(`.layer-${id}-bottom`);
      base
        .selectAll("path")
        .data(dataSource)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", (d) => getConfig(d, optionParams, "strokeColor"))
        .attr("stroke-width", (d) => getConfig(d, optionParams, "strokeWidth"))
        .attr("fill", (d) => getConfig(d, optionParams, "fillColor"))
        .on("click", (e, d) => {
          const { properties = {} } = d;
          const { option = {} } = properties;
          const { onClick } = option;
          if (onClick) {
            onClick(e, d);
          }
          if (layerClick) {
            layerClick(e, d);
          }
        })
        .on("mousemove", (e, d) => {
          const { geometry, properties = {} } = d;
          const { option = {} } = properties;
          const { coordinates = [] } = geometry;
          const currentParams = { ...optionParams, ...option };
          if (currentParams.selectable) {
            const item = coordinates.find((i) => {
              return d3.polygonContains(
                i,
                projection.invert(d3.pointer(e, coordinate))
              );
            });
            if (item) {
              d3.select(`.layer-${id}-top`).select("path").remove();
              d3.select(`.layer-${id}-top`)
                .selectAll("path")
                .data([
                  {
                    type: "Feature",
                    geometry: {
                      type: "Polygon",
                      coordinates: [item] ?? [],
                    },
                    properties,
                  },
                ])
                .enter()
                .append("path")
                .attr("d", path)
                .attr("stroke", (d) =>
                  getConfig(d, optionParams, "strokeColor")
                )
                .attr("stroke-width", (d) =>
                  getConfig(d, optionParams, "strokeWidth")
                )
                .attr("fill", (d) => getConfig(d, optionParams, "selectColor"));
            }
          }
        })
        .on("mouseleave", (e) => {
          const newPath = d3.select(`.layer-${id}-top`).select("path");
          if (newPath) newPath.remove();
        });
    }
  }, [dataSource, id, projection, coordinate, options]);

  return (
    <g className={`layer-${id}`}>
      <g className={`layer-${id}-bottom`}></g>
      <g
        className={`layer-${id}-top`}
        style={{
          pointerEvents: "none",
        }}
      ></g>
    </g>
  );
};

export default PolygonLayer;
