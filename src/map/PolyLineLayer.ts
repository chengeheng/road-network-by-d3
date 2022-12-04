import * as d3 from "d3";
import Layer, { LayerOption, LayerType } from "./Layer";

type polyLineItem = {
	id: string | number;
	coordinates: [number, number][];
	[propName: string]: any;
};

enum StrokeLineType {
	dotted = "dotted",
	solid = "solid",
}

interface PolyLineLayerOption extends LayerOption {
	strokeColor?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
	strokeType?: StrokeLineType;
	strokeDashArray?: number[];
	selectColor?: string;
	selectable?: boolean;
	hoverColor?: string;
	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
}

interface PolyLineOption extends PolyLineLayerOption {
	strokeColor: string;
	strokeWidth: number;
	strokeOpacity: number;
	strokeType: StrokeLineType;
	strokeDashArray: number[];
	selectColor: string;
	selectable: boolean;
	hoverColor: string;
	stopPropagation: boolean;
	onClick: Function;
	onRightClick: Function;
	onDbClick: Function;
}

interface PolyLineDataSource {
	data: polyLineItem[];
	option?: PolyLineLayerOption;
}

const defaultOption: PolyLineOption = {
	strokeColor: "#333333",
	strokeWidth: 1,
	strokeOpacity: 1,
	strokeType: StrokeLineType.solid,
	strokeDashArray: [2, 3],
	selectColor: "yellow",
	selectable: false,
	hoverColor: "green",
	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
};

class PolyLineLayer extends Layer {
	data: PolyLineDataSource[];
	option: PolyLineOption;
	path!: d3.GeoPath<any, any>;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	selectLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	hoverLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private selectIndexs: Set<number>;

	constructor(dataSource: PolyLineDataSource[], option: PolyLineLayerOption = defaultOption) {
		super(LayerType.PolygonLayer, option);
		this.data = dataSource;
		this.option = { ...defaultOption, ...option };
		this.clickCount = 0;
		this.selectIndexs = new Set();
	}

	init(svg: SVGGElement, projection: d3.GeoProjection) {
		super.init(svg, projection);
		this.path = d3.geoPath<any, any>().projection(projection);
		this.container = d3.select(svg).append("g");
		this.container.selectAll("g").remove();

		this.baseLayer = this.container.append("g");
		this.selectLayer = this.container.append("g").style("pointer-events", "none");
		this.hoverLayer = this.container.append("g").style("pointer-events", "none");

		this.draw();
	}

	remove(): void {
		this.container.remove();
	}

	// TODO 显示当前图层
	show(): void {
		this.container.style("display", "inline");
	}

	// TODO 隐藏当前图层
	hide(): void {
		this.container.style("display", "none");
	}

	updateData(data: PolyLineDataSource[]) {
		this.data = data;
		this.baseLayer.selectAll("path").remove();
		this.selectLayer.selectAll("path").remove();
		this.hoverLayer.selectAll("path").remove();
		this.draw();
	}

	draw() {
		this.baseLayer
			.selectAll("path")
			.data(this.formatData(this.data))
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", d => d.properties.option.strokeColor)
			.attr("stroke-width", d => d.properties.option.strokeWidth)
			.attr("stroke-dasharray", d => {
				if (d.properties.option.strokeType === StrokeLineType.dotted) {
					return d.properties.option.strokeDashArray;
				} else {
					return null;
				}
			})
			.attr("fill", "none")
			.on("click", (e, d) => {
				if (d.properties.option.stopPropagation) {
					e.stopPropagation();
				}
				this.clickCount++;
				const originData = d.properties.originData;
				const index = d.geometry.coordinates.findIndex(i =>
					this.isPointInLine(
						i,
						d3.pointer(e, this.container.node())!,
						this.projection,
						d.properties.option.strokeWidth
					)
				);
				const originalParams = originData?.data[index];
				clearTimeout(this.clickTimer);
				this.clickTimer = setTimeout(() => {
					if (this.clickCount % 2 === 1) {
						this.clickCount--;
						const clickFn = d.properties.option.onClick;
						const selectable = d.properties.option.selectable;
						if (selectable) {
							if (this.selectIndexs.has(index)) {
								this.selectIndexs.delete(index);
							} else {
								this.selectIndexs.add(index);
							}
							this.selectLayer.select("path").remove();
							const selectedDatas = d.properties.originData.data.filter((_, index) =>
								this.selectIndexs.has(index)
							);
							const selectedPaths = selectedDatas.reduce((pre, cur) => {
								pre.push(cur.coordinates);
								return pre;
							}, [] as [number, number][][]);

							this.drawSelectLayer(selectedPaths, d.properties);
						}
						if (clickFn) {
							clickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index,
									data: originalParams,
									selected: this.selectIndexs.has(index),
								},
								originData,
							});
						}
					} else {
						this.clickCount = 0;
						const dblClickFn = d.properties.option.onDbClick;
						if (dblClickFn) {
							dblClickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index,
									data: originalParams,
									selected: this.selectIndexs.has(index),
								},
								originData,
							});
						}
					}
				}, 300);
			})
			.on("mousemove", (e, d) => {
				const { coordinates } = d.geometry;
				const hasHover = d.properties.option.hoverColor;
				if (hasHover) {
					const index = coordinates.findIndex(i =>
						this.isPointInLine(
							i,
							d3.pointer(e, this.container.node())!,
							this.projection,
							d.properties.option.strokeWidth
						)
					);

					if (index > -1) {
						this.hoverLayer.select("path").remove();
						const selectedData = d.properties.originData.data[index];
						const selectedPaths = [];
						selectedPaths.push(selectedData.coordinates);

						this.drawHoverLayer(selectedPaths, d.properties);
					}
				}
			})
			.on("mouseleave", () => {
				this.hoverLayer.select("path").remove();
			})
			.on("contextmenu", (e, d) => {
				const index = d.geometry.coordinates.findIndex(i =>
					this.isPointInLine(
						i,
						d3.pointer(e, this.container.node())!,
						this.projection,
						d.properties.option.strokeWidth
					)
				);
				const originalParams = d.properties.originData?.data[index];
				const rightClickFn = d.properties.option.onRightClick;
				if (rightClickFn) {
					rightClickFn({
						data: originalParams,
						PointerEvent: e,
						target: {
							index,
							data: originalParams,
							selected: this.selectIndexs.has(index),
						},
						originData: d.properties.originData,
					});
				}
			});
	}

	drawSelectLayer(
		coords: [number, number][][],
		properties: {
			[propName: string]: any;
			option: PolyLineOption;
			originData: PolyLineDataSource;
			ids: (string | number)[];
		}
	) {
		this.selectLayer
			.selectAll("path")
			.data([
				{
					type: "Feature",
					geometry: {
						type: "MultiLineString",
						coordinates: coords,
					},
					properties,
				},
			])
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", l => l.properties.option.selectColor)
			.attr("stroke-width", l => l.properties.option.strokeWidth)
			.attr("fill", "none")
			.attr("stroke-dasharray", l => {
				if (l.properties.option.strokeType === StrokeLineType.dotted) {
					return l.properties.option.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	drawHoverLayer(
		coords: [number, number][][],
		properties: {
			[propName: string]: any;
			option: PolyLineOption;
			ids: (string | number)[];
			originData: PolyLineDataSource;
		}
	) {
		this.hoverLayer
			.selectAll("path")
			.data([
				{
					type: "Feature",
					geometry: {
						type: "MultiLineString",
						coordinates: [...coords] ?? [],
					},
					properties,
				},
			])
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", d => d.properties.option.hoverColor)
			.attr("stroke-width", d => d.properties.option.strokeWidth)
			.attr("fill", "none")
			.attr("stroke-dasharray", l => {
				if (l.properties.option.strokeType === StrokeLineType.dotted) {
					return l.properties.option.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	formatData(data: PolyLineDataSource[]) {
		return data.reduce(
			(pre, cur) => {
				const { data = [], option = {} } = cur;
				const ids: (string | number)[] = [];
				const coordinates: [number, number][][] = [];
				data.forEach(j => {
					ids.push(j.id);
					coordinates.push(j.coordinates);
				});
				pre.push({
					type: "Feature",
					geometry: {
						type: "MultiLineString",
						coordinates: coordinates,
					},
					properties: {
						option: {
							...this.option,
							...option,
						},
						ids,
						originData: cur,
					},
				});

				return pre;
			},
			[] as Array<{
				type: string;
				geometry: {
					type: string;
					coordinates: [number, number][][];
				};
				properties: {
					option: PolyLineOption;
					ids: (string | number)[];
					originData: PolyLineDataSource;
					[propName: string]: any;
				};
			}>
		);
	}

	private isPointInLine(
		coordinates: [number, number][],
		point: [number, number],
		projection: d3.GeoProjection,
		lineWidth: number
	) {
		const halfWidth = lineWidth / 2;
		const lineAreas = coordinates.map(projection).reduce((pre, cur) => {
			pre.unshift([cur![0] + halfWidth, cur![1] + halfWidth]);
			pre.push([cur![0] - halfWidth, cur![1] - halfWidth]);
			return pre;
		}, [] as [number, number][]);
		return d3.polygonContains(lineAreas, point);
	}
}

export type { PolyLineDataSource };

export { PolyLineLayer as default, StrokeLineType };
