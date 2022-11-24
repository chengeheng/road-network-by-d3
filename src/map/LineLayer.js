import * as d3 from "d3";
import React, { useEffect, useMemo, useRef } from "react";

const defaultPolygons = [];

const getConfig = (item = {}, params, key) => {
	const { properties = {} } = item;
	const { option = {} } = properties;
	return option[key] ?? params[key];
};

const isPointInLine = (coordinates, point, projection, lineWidth) => {
	const halfWidth = lineWidth / 2;
	const lineAreas = coordinates.map(projection).reduce((pre, cur) => {
		pre.unshift([cur[0] + halfWidth, cur[1] + halfWidth]);
		pre.push([cur[0] - halfWidth, cur[1] - halfWidth]);
		return pre;
	}, []);
	return d3.polygonContains(lineAreas, point);
};

const PolygonLayer = props => {
	const { id, dataSource = defaultPolygons, projection, coordinate, option = {} } = props;
	const stateRef = useRef({
		selectedPaths: {},
		selectedIndexs: new Set(),
		clickCount: 0,
		clickTimer: null,
	});

	const formatData = useMemo(() => {
		return dataSource.map(i => {
			const { data = [], option = {} } = i;
			const ids = [];
			const coordinates = [];
			data.forEach(j => {
				ids.push(j.id);
				coordinates.push(j.coordinates);
			});
			return {
				type: "Feature",
				geometry: {
					type: "MultiLineString",
					coordinates: coordinates,
				},
				properties: {
					option,
					ids,
					originData: i,
				},
			};
		});
	}, [dataSource]);

	useEffect(() => {
		if (projection) {
			const {
				selectable = false,
				selectColor = "#fff",
				strokeColor = "#333",
				strokeWidth = 1,
				fillColor = "#fff",
				hoverColor,
				stopPropagation,
			} = option;
			const optionParams = {
				selectable,
				selectColor,
				strokeColor,
				strokeWidth,
				fillColor,
				stopPropagation,
				hoverColor,
			};
			const stateRefData = stateRef.current;

			const path = d3.geoPath().projection(projection);
			const base = d3.select(`.line-layer-${id}-bottom`);
			base
				.selectAll("path")
				.data(formatData)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("stroke", d => getConfig(d, optionParams, "strokeColor"))
				.attr("stroke-width", d => getConfig(d, optionParams, "strokeWidth"))
				.attr("fill", d => getConfig(d, optionParams, "fillColor"))
				.on("click", (e, d) => {
					if (getConfig(d, optionParams, "stopPropagation")) {
						e.stopPropagation();
					}
					stateRefData.clickCount++;
					const { geometry, properties = {} } = d;
					const { originData = {} } = properties;
					const { coordinates = [] } = geometry;

					const index = coordinates.findIndex(i =>
						isPointInLine(
							i,
							d3.pointer(e, coordinate),
							projection,
							getConfig(d, optionParams, "strokeWidth")
						)
					);
					const originalParams = originData?.data[index];
					clearTimeout(stateRefData.clickTimer);
					stateRefData.clickTimer = setTimeout(() => {
						if (stateRefData.clickCount % 2 === 1) {
							stateRefData.clickCount--;
							const clickFn = getConfig(d, optionParams, "onClick");

							const selectable = getConfig(d, optionParams, "selectable");
							if (selectable) {
								if (stateRefData.selectedIndexs.has(index)) {
									stateRefData.selectedIndexs.delete(index);
								} else {
									stateRefData.selectedIndexs.add(index);
								}
								d3.select(`.line-layer-${id}-middle`).select("path").remove();
								const selectedPaths = coordinates.filter((_, index) =>
									stateRefData.selectedIndexs.has(index)
								);

								d3.select(`.line-layer-${id}-middle`)
									.selectAll("path")
									.data([
										{
											type: "Feature",
											geometry: {
												type: "MultiLineString",
												coordinates: selectedPaths,
											},
											properties,
										},
									])
									.enter()
									.append("path")
									.attr("d", path)
									.attr("stroke", d => getConfig(d, optionParams, "selectColor"))
									.attr("stroke-width", d => getConfig(d, optionParams, "strokeWidth"));
							}
							if (clickFn) {
								clickFn({
									data: originalParams,
									PointerEvent: e,
									target: {
										index,
										data: originalParams,
										selected: stateRefData.selectedIndexs.has(index),
									},
									originData,
								});
							}
						} else {
							stateRefData.clickCount = 0;
							const dblClickFn = getConfig(d, optionParams, "onDbClick");
							if (dblClickFn) {
								dblClickFn({
									data: originalParams,
									PointerEvent: e,
									target: {
										index,
										data: originalParams,
										selected: stateRefData.selectedIndexs.has(index),
									},
									originData,
								});
							}
						}
					}, 300);
				})
				.on("mousemove", (e, d) => {
					const { geometry, properties = {} } = d;
					const { coordinates = [] } = geometry;
					const hasHover = getConfig(d, optionParams, "hoverColor");
					if (hasHover) {
						const item = coordinates.find(i =>
							isPointInLine(
								i,
								d3.pointer(e, coordinate),
								projection,
								getConfig(d, optionParams, "strokeWidth")
							)
						);
						if (item) {
							d3.select(`.line-layer-${id}-top`).select("path").remove();
							d3.select(`.line-layer-${id}-top`)
								.selectAll("path")
								.data([
									{
										type: "Feature",
										geometry: {
											type: "MultiLineString",
											coordinates: [item] ?? [],
										},
										properties,
									},
								])
								.enter()
								.append("path")
								.attr("d", path)
								.attr("stroke", d => getConfig(d, optionParams, "hoverColor"))
								.attr("stroke-width", d => getConfig(d, optionParams, "strokeWidth"));
						}
					}
				})
				.on("mouseleave", e => {
					d3.select(`.line-layer-${id}-top`).select("path").remove();
				})
				.on("contextmenu", (e, d) => {
					const { geometry, properties = {} } = d;
					const { originData = {} } = properties;
					const { coordinates = [] } = geometry;
					const index = coordinates.findIndex(i =>
						isPointInLine(
							i,
							d3.pointer(e, coordinate),
							projection,
							getConfig(d, optionParams, "strokeWidth")
						)
					);
					const originalParams = originData?.data[index];
					const rightClickFn = getConfig(d, optionParams, "onRightClick");
					if (rightClickFn) {
						rightClickFn({
							data: originalParams,
							PointerEvent: e,
							target: {
								index,
								data: originalParams,
								selected: stateRefData.selectedIndexs.has(index),
							},
							originData,
						});
					}
				});
		}
	}, [formatData, id, projection, coordinate, option, stateRef]);

	return (
		<g className={`line-layer-${id}`}>
			<g className={`line-layer-${id}-bottom`}></g>
			<g
				className={`line-layer-${id}-middle`}
				style={{
					pointerEvents: "none",
				}}
			></g>
			<g
				className={`line-layer-${id}-top`}
				style={{
					pointerEvents: "none",
				}}
			></g>
		</g>
	);
};

export default PolygonLayer;
