import * as d3 from "d3";
import Layer, { LayerOption, LayerType } from "./Layer";

interface NameStyleProps {
	color?: string;
	fontWeight?: string | number;
	fontSize?: number;
}

type polygonItem = {
	id: string | number;
	coordinates: [number, number][];
	reverseCoords?: [number, number][];
	name?: string;
	nameStyle?: NameStyleProps;
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

interface NameStyleProps {
	color?: string;
	fontWeight?: string | number;
	fontSize?: number;
}

interface DefaultNameDataProps extends NameStyleProps {
	color: string;
	fontWeight: string | number;
	fontSize: number;
}
interface NameDataProps extends DefaultNameDataProps {
	name: string;
	coordinate: [number, number];
}
interface FormatDataProps {
	type: string;
	geometry: {
		type: string;
		coordinates: [number, number][][];
	};
	properties: {
		option: PolygonOption;
		ids: (string | number)[];
		originData: PolygonDataSource;
		index: number;
		[propName: string]: any;
	};
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

const defaultNameStyle: DefaultNameDataProps = {
	fontSize: 14,
	fontWeight: 400,
	color: "#333333",
};

class PolygonLayer extends Layer {
	data: PolygonDataSource[];
	option: PolygonOption;
	path!: d3.GeoPath<any, any>;
	isHided: boolean;
	nameData: NameDataProps[];

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	selectLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	hoverLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private selectIndex: Map<number, Set<number>>; // 选中的pathIndex

	constructor(
		dataSource: PolygonDataSource[],
		option: PolygonLayerOption = defaultOption
	) {
		super(LayerType.PolygonLayer, option);
		this.data = dataSource;
		this.option = { ...defaultOption, ...option };
		this.clickCount = 0;
		this.selectIndex = new Map();
		this.isHided = false;
		this.nameData = [];
	}

	init(g: SVGGElement, projection: d3.GeoProjection) {
		super.init(g, projection);
		this.path = d3.geoPath<any, any>().projection(projection);
		this.container = d3
			.select(g)
			.append("g")
			.attr("id", `polygon-layer-${this.makeRandomId()}`);
		this.container.selectAll("g").remove();

		this.baseLayer = this.container.append("g");
		this.selectLayer = this.container
			.append("g")
			.style("pointer-events", "none");
		this.hoverLayer = this.container
			.append("g")
			.style("pointer-events", "none");

		this.draw();
	}

	remove(): void {
		this.container.remove();
	}

	/**
	 * 显示当前图层
	 */
	show(): void {
		this.container.style("display", "inline");
	}

	/**
	 * 隐藏当前图层
	 */
	hide(): void {
		this.container.style("display", "none");
	}

	enableLayerFunc(): void {
		this.container.style("pointer-events", "inherit");
	}

	disableLayerFunc(): void {
		this.container.style("pointer-events", "none");
	}

	updateData(data: PolygonDataSource[]) {
		this.data = data;

		this.baseLayer.selectAll("path").remove();
		this.selectLayer.selectAll("*").remove();
		this.hoverLayer.selectAll("*").remove();

		this.selectIndex = new Map();

		this.draw();
	}

	protected draw() {
		const [pathData, nameData] = this.formatData(this.data);
		const pathGroup = this.baseLayer.append("g");
		const nameGroup = this.baseLayer
			.append("g")
			.style("pointer-events", "none");

		pathGroup
			.selectAll("path")
			.data(pathData)
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
			.on("click", (e, d, ...args: any) => {
				if (d.properties.option.stopPropagation) {
					e.stopPropagation();
				}
				this.clickCount++;
				const { coordinates } = d.geometry;
				const originData = d.properties.originData;

				const targetCoord = this.projection.invert!(d3.pointer(e, this.map));
				const index = coordinates.findIndex(i =>
					d3.polygonContains(i, targetCoord!)
				);
				const originalParams = originData?.data[index];
				clearTimeout(this.clickTimer);
				this.clickTimer = setTimeout(() => {
					if (this.clickCount % 2 === 1) {
						this.clickCount--;
						const clickFn = d.properties.option.onClick;
						const selectable = d.properties.option.selectable;
						if (selectable) {
							this.combineIndex(this.selectIndex, d.properties.index, index);
							this.selectLayer.select("*").remove();
							this.drawSelectLayer();
						}
						if (clickFn) {
							clickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index,
									data: originalParams,
									selected: this.selectIndex.get(d.properties.index)
										? this.selectIndex.get(d.properties.index)!.has(index)
										: false,
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
									selected: this.selectIndex.get(d.properties.index)
										? this.selectIndex.get(d.properties.index)!.has(index)
										: false,
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
					const targetCoord = this.projection.invert!(
						d3.pointer(e, this.container.node())
					);
					const index = coordinates.findIndex(i => {
						return d3.polygonContains(i, targetCoord!);
					});
					if (index > -1) {
						const hoverData = this.formatData(
							this.data,
							(e, outerIndex, innerIndex) => {
								if (outerIndex === d.properties.index && innerIndex === index) {
									return true;
								}
								return false;
							}
						);
						this.drawHoverLayer(hoverData);
					}
				}
			})
			.on("mouseleave", () => {
				this.hoverLayer.select("*").remove();
			})
			.on("contextmenu", (e, d) => {
				const targetCoord = this.projection.invert!(
					d3.pointer(e, this.container.node())
				);
				const index = d.geometry.coordinates.findIndex(i =>
					d3.polygonContains(i, targetCoord!)
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
							selected: this.selectIndex.get(d.properties.index)
								? this.selectIndex.get(d.properties.index)!.has(index)
								: false,
						},
						originData: d.properties.originData,
					});
				}
			});
		nameGroup
			.selectAll("text")
			.data(nameData)
			.enter()
			.append("text")
			.attr("x", d => d.coordinate[0])
			.attr("y", d => d.coordinate[1])
			.attr("font-size", d => d.fontSize)
			.attr("fill", d => d.color)
			.attr("font-weight", d => d.fontWeight)
			.attr("dx", d => {
				const width = this.calcuteTextWidth(d.name);
				return -width / 2;
			})
			.text(d => d.name);
	}

	private combineIndex<T extends Map<number, Set<number>>>(
		idxs: T,
		index: number,
		idx: number
	): T {
		if (idxs.has(index)) {
			const temp = idxs.get(index)!;
			if (temp.has(idx)) {
				temp.delete(idx);
				if (temp.size <= 0) {
					idxs.delete(index);
				}
			} else {
				idxs.get(index)?.add(idx);
			}
		} else {
			idxs.set(index, new Set([idx]) as Set<number>);
		}
		return idxs;
	}

	private drawSelectLayer() {
		this.selectLayer.selectAll("*").remove();
		const pathGroup = this.selectLayer.append("g");
		const nameGroup = this.selectLayer.append("g");
		const [pathData, nameData] = this.formatData(this.data, (e, idx, index) => {
			if (!this.selectIndex.get(idx)) {
				return false;
			} else {
				return this.selectIndex.get(idx)!.has(index);
			}
		});

		pathGroup
			.selectAll("path")
			.data(pathData)
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

		nameGroup
			.selectAll("text")
			.data(nameData)
			.enter()
			.append("text")
			.attr("x", d => d.coordinate[0])
			.attr("y", d => d.coordinate[1])
			.attr("font-size", d => d.fontSize)
			.attr("fill", d => d.color)
			.attr("font-weight", d => d.fontWeight)
			.attr("dx", d => {
				const width = this.calcuteTextWidth(d.name);
				return -width / 2;
			})
			.text(d => d.name);
	}

	private drawHoverLayer(data: [FormatDataProps[], NameDataProps[]]) {
		this.hoverLayer.selectAll("*").remove();
		const pathGroup = this.hoverLayer.append("g");
		const nameGroup = this.hoverLayer.append("g");
		const [pathData, nameData] = data;

		pathGroup
			.selectAll("path")
			.data(pathData)
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

		nameGroup
			.selectAll("text")
			.data(nameData)
			.enter()
			.append("text")
			.attr("x", d => d.coordinate[0])
			.attr("y", d => d.coordinate[1])
			.attr("font-size", d => d.fontSize)
			.attr("fill", d => d.color)
			.attr("font-weight", d => d.fontWeight)
			.attr("dx", d => {
				const width = this.calcuteTextWidth(d.name);
				return -width / 2;
			})
			.text(d => d.name);
	}

	protected formatData(
		data: PolygonDataSource[],
		dataFilter?: (e: polygonItem, idx: number, index: number) => boolean
	): [FormatDataProps[], NameDataProps[]] {
		const nameData: NameDataProps[] = [];
		const pathData = data.reduce((pre, cur, idx) => {
			const { data = [], option = {} } = cur;
			const ids: (string | number)[] = [];
			const coordinates: [number, number][][] = [];
			const reverseCoords: [number, number][][] = [];
			data.forEach((j, innerIndex) => {
				if (dataFilter) {
					if (!dataFilter(j, idx, innerIndex)) {
						return;
					}
				}
				ids.push(j.id);
				coordinates.push(j.coordinates);
				if (j.name) {
					const nameStyle = {
						...j.nameStyle,
						...defaultNameStyle,
					};
					nameData.push({
						name: j.name,
						fontSize: nameStyle.fontSize,
						fontWeight: nameStyle.fontWeight,
						color: nameStyle.color,
						coordinate: this.projection(d3.polygonCentroid(j.coordinates))!,
					});
				}
				if (j.reverseCoords) {
					reverseCoords.push(j.reverseCoords);
				}
			});
			if (coordinates.length === 0) return pre;
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
					index: idx,
				},
			});

			return pre;
		}, [] as FormatDataProps[]);
		return [pathData, nameData];
	}
}

export type { PolygonDataSource };

export { PolygonLayer as default, StrokeLineType };
