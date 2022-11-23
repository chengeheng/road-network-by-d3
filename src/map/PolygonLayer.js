import * as d3 from "d3";
import React, { useEffect, useMemo, useRef } from "react";

const defaultPolygons = [];

const getConfig = (item = {}, params, key) => {
	const { properties = {} } = item;
	const { option = {} } = properties;
	return option[key] ?? params[key];
};

const PolygonLayer = props => {
	const { id, dataSource = defaultPolygons, projection, coordinate, options = {} } = props;
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
					type: "Polygon",
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
			} = options;
			const optionParams = {
				selectable,
				selectColor,
				strokeColor,
				strokeWidth,
				fillColor,
				hoverColor,
			};
			const stateRefData = stateRef.current;

			const path = d3.geoPath().projection(projection);
			const base = d3.select(`.layer-${id}-bottom`);
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
					stateRefData.clickCount++;
					const { geometry, properties = {} } = d;
					const { originData = {} } = properties;
					const { coordinates = [] } = geometry;

					const index = coordinates.findIndex(i =>
						d3.polygonContains(i, projection.invert(d3.pointer(e, coordinate)))
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
								d3.select(`.layer-${id}-middle`).select("path").remove();
								const selectedPaths = coordinates.filter((_, index) =>
									stateRefData.selectedIndexs.has(index)
								);

								d3.select(`.layer-${id}-middle`)
									.selectAll("path")
									.data([
										{
											type: "Feature",
											geometry: {
												type: "Polygon",
												coordinates: selectedPaths,
											},
											properties,
										},
									])
									.enter()
									.append("path")
									.attr("d", path)
									.attr("stroke", d => getConfig(d, optionParams, "strokeColor"))
									.attr("stroke-width", d => getConfig(d, optionParams, "strokeWidth"))
									.attr("fill", d => getConfig(d, optionParams, "selectColor"));
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
						const item = coordinates.find(i => {
							return d3.polygonContains(i, projection.invert(d3.pointer(e, coordinate)));
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
								.attr("stroke", d => getConfig(d, optionParams, "strokeColor"))
								.attr("stroke-width", d => getConfig(d, optionParams, "strokeWidth"))
								.attr("fill", d => getConfig(d, optionParams, "hoverColor"));
						}
					}
				})
				.on("mouseleave", e => {
					d3.select(`.layer-${id}-top`).select("path").remove();
				})
				.on("contextmenu", (e, d) => {
					const { geometry, properties = {} } = d;
					const { originData = {} } = properties;
					const { coordinates = [] } = geometry;
					const index = coordinates.findIndex(i =>
						d3.polygonContains(i, projection.invert(d3.pointer(e, coordinate)))
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
	}, [formatData, id, projection, coordinate, options, stateRef]);

	return (
		<g className={`layer-${id}`}>
			<g className={`layer-${id}-bottom`}></g>
			<g
				className={`layer-${id}-middle`}
				style={{
					pointerEvents: "none",
				}}
			></g>
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
