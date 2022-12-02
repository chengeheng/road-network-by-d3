import * as d3 from "d3";
import Layer, { LayerOption, LayerType } from "./Layer";

type polygonItem = {
	id: string | number;
	coordinates: [number, number][];
	reverseCoords?: [number, number][];
	[propName: string]: any;
};

enum StrokeLineType {
	dotted = "dotted",
	solid = "solid",
}

interface PolygonLayerOption extends LayerOption {
	strokeColor?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
	strokeType?: StrokeLineType;
	strokeDashArray?: number[];
	fillColor?: string;
	fillOpacity?: number;
	selectColor?: string;
	selectable?: boolean;
	hoverColor?: string;
	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
}

interface PolygonOption extends PolygonLayerOption {
	strokeColor: string;
	strokeWidth: number;
	strokeOpacity: number;
	strokeType: StrokeLineType;
	strokeDashArray: number[];
	fillColor: string;
	fillOpacity: number;
	selectColor: string;
	selectable: boolean;
	hoverColor: string;
	stopPropagation: boolean;
	onClick: Function;
	onRightClick: Function;
	onDbClick: Function;
}

interface PolygonDataSource {
	data: polygonItem[];
	option?: PolygonLayerOption;
}

const defaultOption: PolygonOption = {
	strokeColor: "#333333",
	strokeWidth: 1,
	strokeOpacity: 1,
	strokeType: StrokeLineType.solid,
	strokeDashArray: [2, 3],
	fillColor: "transparent",
	fillOpacity: 1,
	selectColor: "yellow",
	selectable: false,
	hoverColor: "green",
	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
};

class PolygonLayer extends Layer {
	data: PolygonDataSource[];
	option: PolygonOption;
	path!: d3.GeoPath<any, any>;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	selectLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	hoverLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private selectIndexs: Set<number>;

	constructor(dataSource: PolygonDataSource[], option: PolygonLayerOption = defaultOption) {
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

	updateData(data: PolygonDataSource[]) {
		this.data = data;
		this.draw();
	}

	draw() {
		const base = this.container;
		this.baseLayer = base.append("g");
		this.selectLayer = base.append("g").style("pointer-events", "none");
		this.hoverLayer = base.append("g").style("pointer-events", "none");
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
			.attr("stroke-opacity", d => d.properties.option.strokeOpacity)
			.attr("fill", d => d.properties.option.fillColor)
			.attr("fill-opacity", d => d.properties.option.fillOpacity)
			.on("click", (e, d) => {
				if (d.properties.option.stopPropagation) {
					e.stopPropagation();
				}
				this.clickCount++;
				const { coordinates } = d.geometry;
				const originData = d.properties.originData;

				const targetCoord = this.projection.invert!(d3.pointer(e, this.container.node()));
				const index = coordinates.findIndex(i => d3.polygonContains(i, targetCoord!));
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
								if (cur.reverseCoords) {
									pre.push(cur.reverseCoords);
								}
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
					const targetCoord = this.projection.invert!(d3.pointer(e, this.container.node()));
					const index = coordinates.findIndex(i => {
						return d3.polygonContains(i, targetCoord!);
					});
					if (index > -1) {
						this.hoverLayer.select("path").remove();
						const selectedData = d.properties.originData.data[index];
						const selectedPaths = [];
						selectedPaths.push(selectedData.coordinates);
						if (selectedData.reverseCoords) {
							selectedPaths.push(selectedData.reverseCoords);
						}
						this.drawHoverLayer(selectedPaths, d.properties);
					}
				}
			})
			.on("mouseleave", () => {
				this.hoverLayer.select("path").remove();
			})
			.on("contextmenu", (e, d) => {
				const targetCoord = this.projection.invert!(d3.pointer(e, this.container.node()));
				const index = d.geometry.coordinates.findIndex(i => d3.polygonContains(i, targetCoord!));

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
			option: PolygonOption;
			originData: PolygonDataSource;
			ids: (string | number)[];
		}
	) {
		this.selectLayer
			.selectAll("path")
			.data([
				{
					type: "Feature",
					geometry: {
						type: "Polygon",
						coordinates: coords,
					},
					properties,
				},
			])
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", l => l.properties.option.strokeColor)
			.attr("stroke-width", l => l.properties.option.strokeWidth)
			.attr("stroke-opacity", d => d.properties.option.strokeOpacity)
			.attr("fill", l => l.properties.option.selectColor)
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
			option: PolygonOption;
			ids: (string | number)[];
			originData: PolygonDataSource;
		}
	) {
		this.hoverLayer
			.selectAll("path")
			.data([
				{
					type: "Feature",
					geometry: {
						type: "Polygon",
						coordinates: [...coords] ?? [],
					},
					properties,
				},
			])
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", d => d.properties.option.strokeColor)
			.attr("stroke-width", d => d.properties.option.strokeWidth)
			.attr("stroke-opacity", d => d.properties.option.strokeOpacity)
			.attr("fill", d => d.properties.option.hoverColor)
			.attr("fill-opacity", d => d.properties.option.fillOpacity)
			.attr("stroke-dasharray", l => {
				if (l.properties.option.strokeType === StrokeLineType.dotted) {
					return l.properties.option.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	formatData(data: PolygonDataSource[]) {
		return data.reduce(
			(pre, cur) => {
				const { data = [], option = {} } = cur;
				const ids: (string | number)[] = [];
				const coordinates: [number, number][][] = [];
				const reverseCoords: [number, number][][] = [];
				data.forEach(j => {
					ids.push(j.id);
					coordinates.push(j.coordinates);
					if (j.reverseCoords) {
						reverseCoords.push(j.reverseCoords);
					}
				});
				pre.push({
					type: "Feature",
					geometry: {
						type: "Polygon",
						coordinates: [...coordinates, ...reverseCoords],
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
					option: PolygonOption;
					ids: (string | number)[];
					originData: PolygonDataSource;
					[propName: string]: any;
				};
			}>
		);
	}
}

export type { PolygonDataSource };

export { PolygonLayer as default, StrokeLineType };
