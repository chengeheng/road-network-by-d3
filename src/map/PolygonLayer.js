import * as d3 from "d3";
import { useEffect } from "react";

const defaultPolygons = [];

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
      const { onClick: svgClick } = options;
      const path = d3.geoPath().projection(projection);
      const base = d3.select(`.layer-${id}-bottom`);
      base
        .selectAll("path")
        .data(dataSource)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#AC9980")
        .attr("stoke-width", 0.5)
        .attr("fill", (d) =>
          d.geometry.type === "Polygon" ? "#FDBE6E" : "transparent"
        )
        .on("click", (e, d) => {
          const { properties = {} } = d;
          const { option = {} } = properties;
          const { onClick } = option;
          if (onClick) {
            onClick(e, d);
          }
          if (svgClick) {
            svgClick(e, d);
          }
        })
        .on("mousemove", (e, d) => {
          const { geometry } = d;
          const { coordinates = [] } = geometry;
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
                },
              ])
              .enter()
              .append("path")
              .attr("d", path)
              .attr("stroke", "#AC9980")
              .attr("stoke-width", 0.5)
              .attr("fill", (d) => "red");
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
