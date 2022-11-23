import React, { useEffect, useMemo, useReducer, useRef } from "react";
import * as d3 from "d3";

import "./index.css";

window.d3 = d3;

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

const Map = props => {
	const [store, dispatch] = useReducer(reducer, defaultState);
	const { children, center, onClick } = props;
	const ref = useRef();
	const dataRef = useRef({});
	const { width, height } = store;
	const projection = useMemo(() => {
		if (width > 0 && height > 0) {
			return (
				d3
					.geoMercator()
					// .scale(50000000)
					.scale(20000000)
					.center(center)
					.translate([width / 2, height / 2])
			);
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
			const dom = ref.current;
			const rect = dom.getBoundingClientRect();
			const svg = d3.select(ref.current).select("svg");
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
			const g = d3.select(".container");
			const zoom = d3
				.zoom()
				.scaleExtent([1 / 5, 5])
				.on("zoom", e => {
					g.attr("transform", e.transform);
				});
			zoom.scaleBy(g, 1);
			svg
				.call(zoom)
				.on("click", e => {
					if (onClick) {
						onClick(e, projection.invert(d3.pointer(e, g.node())));
					}
				})
				.on("dblclick.zoom", null);
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
