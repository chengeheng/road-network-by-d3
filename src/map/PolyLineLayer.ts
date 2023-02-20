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
	selectType?: "link" | "path" | "all";
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
	selectType: "link" | "path" | "all";
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
	selectType: "link",
};

class PolyLineLayer extends Layer {
	data: PolyLineDataSource[];
	option: PolyLineOption;
	path!: d3.GeoPath<any, any>;
	length: number;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	selectLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	hoverLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private selectIndex: Map<number, Set<number>>;
	private _hoverIndex: Map<number, Set<number>>;
	private _selectType: "link" | "path" | "all"; // 选中的类型
	private _allIndex: Map<number, Set<number>>; // 全部的index

	constructor(
		dataSource: PolyLineDataSource[],
		option: PolyLineLayerOption = defaultOption
	) {
		super(LayerType.PolygonLayer, option);
		this.data = dataSource;
		this.option = { ...defaultOption, ...option };
		this.clickCount = 0;
		this.selectIndex = new Map();
		this._selectType = this.option.selectType;
		this._allIndex = new Map();
		this._hoverIndex = new Map();
		this.length = dataSource.length;
	}

	init(g: SVGGElement, projection: d3.GeoProjection) {
		super.init(g, projection);
		this.path = d3.geoPath<any, any>().projection(projection);
		this.container = d3
			.select(g)
			.append("g")
			.attr("id", `polyline-layer-${this.makeRandomId()}`);
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

	updateData(data: PolyLineDataSource[]) {
		this.data = data;
		this.selectIndex = new Map();
		this.baseLayer.selectAll("path").remove();
		this.selectLayer.selectAll("path").remove();
		this.hoverLayer.selectAll("path").remove();
		this.draw();
	}

	setSelectType(type: "link" | "path" | "all"): void {
		this._selectType = type;
	}

	protected draw() {
		this.baseLayer
			.selectAll("path")
			.data(
				this.formatData(this.data, (e, outerIndex, innerIndex) => {
					if (this._allIndex.has(outerIndex)) {
						this._allIndex.get(outerIndex)?.add(innerIndex);
					} else {
						this._allIndex.set(outerIndex, new Set<number>([innerIndex]));
					}
					return true;
				})
			)
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
					this._isPointInLine(
						i,
						d3.pointer(e, this.container.node())!,
						this.projection,
						d.properties.option.strokeWidth
					)
				);
				let originalParams: any;
				if (this._selectType === "all") {
					originalParams = this.data;
				} else if (this._selectType === "path") {
					originalParams = d.properties.originData;
				} else {
					originalParams = originData?.data[index];
				}
				clearTimeout(this.clickTimer);
				this.clickTimer = setTimeout(() => {
					if (this.clickCount % 2 === 1) {
						this.clickCount--;
						const clickFn = d.properties.option.onClick;
						const selectable = d.properties.option.selectable;
						if (selectable) {
							this.selectIndex = this.combineIndex(
								this.selectIndex,
								d.properties.index,
								index
							);
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
					const index = coordinates.findIndex(i =>
						this._isPointInLine(
							i,
							d3.pointer(e, this.container.node())!,
							this.projection,
							d.properties.option.strokeWidth
						)
					);

					this._hoverIndex = this.combineIndex(
						new Map(),
						d.properties.index,
						index
					);

					if (index > -1) {
						this.drawHoverLayer();
					}
				}
			})
			.on("mouseleave", () => {
				this.hoverLayer.selectAll("*").remove();
			})
			.on("contextmenu", (e, d) => {
				const index = d.geometry.coordinates.findIndex(i =>
					this._isPointInLine(
						i,
						d3.pointer(e, this.container.node())!,
						this.projection,
						d.properties.option.strokeWidth
					)
				);
				let originalParams: any;
				if (this._selectType === "all") {
					originalParams = this.data;
				} else if (this._selectType === "path") {
					originalParams = d.properties.originData;
				} else {
					originalParams = d.properties.originData?.data[index];
				}
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
	}

	drawSelectLayer() {
		this.selectLayer.selectAll("*").remove();
		const pathData = this.formatData(this.data, (e, idx, index) => {
			if (!this.selectIndex.get(idx)) {
				return false;
			} else {
				return this.selectIndex.get(idx)!.has(index);
			}
		});
		this.selectLayer
			.selectAll("path")
			.data(pathData)
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

	private drawHoverLayer() {
		this.hoverLayer.selectAll("*").remove();
		const pathData = this.formatData(this.data, (e, idx, index) => {
			if (!this._hoverIndex.get(idx)) {
				return false;
			} else {
				return this._hoverIndex.get(idx)!.has(index);
			}
		});
		this.hoverLayer
			.selectAll("path")
			.data(pathData)
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", l => l.properties.option.hoverColor)
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

	private formatData(
		data: PolyLineDataSource[],
		dataFilter?: (e: polyLineItem, idx: number, index: number) => boolean
	) {
		return data.reduce(
			(pre, cur, idx) => {
				const { data = [], option = {} } = cur;
				const ids: (string | number)[] = [];
				const coordinates: [number, number][][] = [];
				data.forEach((j, innerIndex) => {
					if (dataFilter) {
						if (!dataFilter(j, idx, innerIndex)) {
							return;
						}
					}
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
						index: idx,
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

	private combineIndex<T extends Map<number, Set<number>>>(
		idxs: T,
		index: number, // 外部index
		idx: number // 内部index
	): T {
		switch (this._selectType) {
			case "all": {
				if (idxs.size === this.length) {
					idxs = new Map<number, Set<number>>() as T;
				} else {
					idxs = this._allIndex as T;
				}
				return idxs;
			}
			case "path": {
				if (idxs.has(index)) {
					idxs.delete(index);
				} else {
					idxs.set(index, new Set(this._allIndex.get(index)));
				}
				return idxs;
			}
			case "link": {
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
			default: {
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
		}
	}

	// private _PointToLine(
	// 	point: [number, number],
	// 	lines: [[number, number], [number, number]]
	// ): number {
	// 	const [x, y] = point;
	// 	const [x1, y1] = lines[0];
	// 	const [x2, y2] = lines[1];
	// 	const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	// 	const areas = Math.abs((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x));
	// 	return areas / length;
	// }

	private _insideInStandardRect(
		[x1, y1]: [number, number],
		[x2, y2]: [number, number],
		[x, y]: [number, number]
	): boolean {
		if (y < y1 || y > y2) return false;
		if (x1 < x2) {
			if (x < x1 || x > x2) return false;
		} else {
			if (x > x1 || x < x2) return false;
		}
		return true;
	}

	private _insideInRect(
		[x1, y1]: [number, number],
		[x2, y2]: [number, number],
		[x, y]: [number, number],
		height: number
	): boolean {
		if (y1 === y2) {
			return this._insideInStandardRect(
				[x1, y1 - height],
				[x2, y1 + height],
				[x, y]
			);
		}

		const l = y2 - y1;
		const r = x2 - x1;
		const s = Math.sqrt(l * l + r * r);
		const sin = l / s;
		const cos = r / s;

		const x1r = x1 * cos + y1 * sin;
		const y1r = y1 * cos - x1 * sin;
		const x2r = x2 * cos + y2 * sin;
		const y2r = y2 * cos - x2 * sin;
		const xr = x * cos + y * sin;
		const yr = y * cos - x * sin;

		return this._insideInStandardRect(
			[x1r, y1r - height],
			[x2r, y2r + height],
			[xr, yr]
		);
	}

	private _isPointInLine(
		coordinates: [number, number][],
		point: [number, number],
		projection: d3.GeoProjection,
		lineWidth: number
	): boolean {
		if (coordinates.length <= 1) return false;
		const lineArr = coordinates.map(projection) as [number, number][];
		for (let i = 1; i < lineArr.length; i++) {
			if (
				this._insideInRect(lineArr[i], lineArr[i - 1], point, lineWidth / 2)
			) {
				return true;
			}
		}

		return false;
	}
}

export type { PolyLineDataSource };

export { PolyLineLayer as default, StrokeLineType };