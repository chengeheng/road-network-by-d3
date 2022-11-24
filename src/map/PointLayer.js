import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import DefaultPointSvg from "../images/point.png";

const defaultPolygons = [];

const getConfig = (item = {}, params, key) => {
	const { option = {} } = item;
	return option[key] ?? params[key];
};

const PointLayer = props => {
	const { id, dataSource = defaultPolygons, projection, coordinate, option = {} } = props;
	const stateRef = useRef({
		selectedPaths: {},
		selectedIndexs: new Set(),
		clickCount: 0,
		clickTimer: null,
	});

	useEffect(() => {
		if (projection) {
			const {
				icon = DefaultPointSvg,
				width = 36,
				height = 36,
				offset = [-18, -36],
				stopPropagation = false,

				clickFn = () => {},
				onDbClick = () => {},
				onRightClick = () => {},
			} = option;
			const optionParams = {
				icon,
				width,
				height,
				offset,
				clickFn,
				onDbClick,
				onRightClick,
				stopPropagation,
			};
			const stateRefData = stateRef.current;

			const base = d3.select(`.point-layer-${id}-bottom`);
			base
				.selectAll("image")
				.data(dataSource)
				.enter()
				.append("image")
				.attr("x", d => projection(d.coordinate)[0])
				.attr("y", d => projection(d.coordinate)[1])
				.attr("width", d => getConfig(d, optionParams, "width"))
				.attr("height", d => getConfig(d, optionParams, "height"))
				.style("cursor", "pointer")
				.attr(
					"transform",
					d =>
						`translate(${getConfig(d, optionParams, "offset")[0]},${
							getConfig(d, optionParams, "offset")[1]
						})`
				)
				.attr("xlink:href", d => getConfig(d, optionParams, "icon"))
				.on("click", (e, d) => {
					if (getConfig(d, optionParams, "stopPropagation")) {
						e.stopPropagation();
					}
					stateRefData.clickCount++;
					const index = dataSource.findIndex(i => i.id === d.id);
					clearTimeout(stateRefData.clickTimer);
					stateRefData.clickTimer = setTimeout(() => {
						if (stateRefData.clickCount % 2 === 1) {
							stateRefData.clickCount--;
							const clickFn = getConfig(d, optionParams, "onClick");
							if (clickFn) {
								clickFn({
									data: d,
									PointerEvent: e,
									target: {
										index,
										data: d,
									},
								});
							}
						} else {
							stateRefData.clickCount = 0;
							const dblClickFn = getConfig(d, optionParams, "onDbClick");
							if (dblClickFn) {
								dblClickFn({
									data: d,
									PointerEvent: e,
									target: {
										index,
										data: d,
									},
								});
							}
						}
					}, 300);
				})
				.on("contextmenu", (e, d) => {
					if (getConfig(d, optionParams, "stopPropagation")) {
						e.stopPropagation();
					}
					const index = dataSource.findIndex(i => i.id === d.id);
					const rightClickFn = getConfig(d, optionParams, "onRightClick");
					if (rightClickFn) {
						rightClickFn({
							data: d,
							PointerEvent: e,
							target: {
								index,
								data: d,
							},
						});
					}
				});
		}
	}, [dataSource, id, projection, coordinate, option, stateRef]);

	return (
		<g className={`point-layer-${id}`}>
			<g className={`point-layer-${id}-bottom`}></g>
			<g
				className={`point-layer-${id}-middle`}
				style={{
					pointerEvents: "none",
				}}
			></g>
			<g
				className={`point-layer-${id}-top`}
				style={{
					pointerEvents: "none",
				}}
			></g>
		</g>
	);
};

export default PointLayer;
