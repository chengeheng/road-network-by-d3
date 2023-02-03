import * as d3 from "d3";
import Layer, { LayerOptionProps, LayerType } from ".";

type polyLineItem = {
	id: string | number;
	coordinates: [number, number][];
	[propName: string]: any;
};

enum StrokeLineType {
	dotted = "dotted",
	solid = "solid",
}

interface StyleProps {
	strokeColor?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
	strokeType?: StrokeLineType;
	strokeDashArray?: number[];
}

interface PolyLineLayerOptionProps extends LayerOptionProps {
	style?: StyleProps;
	selectStyle?: StyleProps;
	hoverStyle?: StyleProps;

	selectable: boolean;
	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
	selectType?: "link" | "path" | "all";
}

interface PolyLineDataSourceProps {
	data: polyLineItem[];
	option?: PolyLineLayerOptionProps;
}

interface _PolyLineOptionProps {
	style: {
		strokeColor: string;
		strokeWidth: number;
		strokeOpacity: number;
		strokeType: StrokeLineType;
		strokeDashArray: number[];
	};
	selectStyle: {
		strokeColor: string;
		strokeWidth: number;
		strokeOpacity: number;
		strokeType: StrokeLineType;
		strokeDashArray: number[];
	};
	hoverStyle: {
		strokeColor: string;
		strokeWidth: number;
		strokeOpacity: number;
		strokeType: StrokeLineType;
		strokeDashArray: number[];
	};
	hasHover: boolean;
	selectable: boolean;
	stopPropagation: boolean;
	onClick: Function;
	onRightClick: Function;
	onDbClick: Function;
	selectType: "link" | "path" | "all";
}

const defaultOption = {
	style: {
		strokeColor: "#333333",
		strokeWidth: 1,
		strokeOpacity: 1,
		strokeType: StrokeLineType.solid,
		strokeDashArray: [2, 3],
	},
	selectable: false,
	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
	selectType: "link" as "link" | "path" | "all",
};

class PolyLineLayer extends Layer {
	data: PolyLineDataSourceProps[];
	option: _PolyLineOptionProps;
	path!: d3.GeoPath<any, any>;
	length: number;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	selectLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	hoverLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private _clickCount: number;
	private _clickTimer: NodeJS.Timeout | undefined;
	private _selectIndex: Map<number, Set<number>>;
	private _hoverIndex: Map<number, Set<number>>;
	private _selectType: "link" | "path" | "all"; // 选中的类型
	private _allIndex: Map<number, Set<number>>; // 全部的index

	constructor(
		dataSource: PolyLineDataSourceProps[],
		option?: PolyLineLayerOptionProps
	) {
		super(LayerType.PolygonLayer, option);
		this.data = dataSource;
		this.option = this._combineOption(option);
		this._clickCount = 0;
		this._selectIndex = new Map();
		this._selectType = this.option.selectType;
		this._allIndex = new Map();
		this._hoverIndex = new Map();
		this.length = dataSource.length;
	}

	private _combineOption(
		option: PolyLineLayerOptionProps = defaultOption
	): _PolyLineOptionProps {
		const { style = {}, hoverStyle = {}, selectStyle = {}, ...rest } = option;

		return {
			...defaultOption,
			...rest,
			style: {
				...defaultOption.style,
				...style,
			},
			hoverStyle: {
				...defaultOption.style,
				...hoverStyle,
			},
			selectStyle: {
				...defaultOption.style,
				...selectStyle,
			},
			hasHover: !!hoverStyle.strokeColor,
		};
	}

	protected _draw() {
		this.baseLayer
			.selectAll("path")
			.data(
				this._formatData(this.data, (e, outerIndex, innerIndex) => {
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
			.attr("stroke", d => d.properties.option.style?.strokeColor!)
			.attr("stroke-width", d => d.properties.option.style?.strokeWidth!)
			.attr("stroke-dasharray", d => {
				if (d.properties.option.style.strokeType === StrokeLineType.dotted) {
					return d.properties.option.style.strokeDashArray;
				} else {
					return null;
				}
			})
			.attr("fill", "none")
			.on("click", (e, d) => {
				if (d.properties.option.stopPropagation) {
					e.stopPropagation();
				}
				this._clickCount++;
				const originData = d.properties.originData;
				const index = d.geometry.coordinates.findIndex(i =>
					this.isPointInLine(
						i,
						d3.pointer(e, this.container.node())!,
						this.projection,
						d.properties.option.style.strokeWidth
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
				clearTimeout(this._clickTimer);
				this._clickTimer = setTimeout(() => {
					if (this._clickCount % 2 === 1) {
						this._clickCount--;
						const clickFn = d.properties.option.onClick;
						const selectable = d.properties.option.selectable;
						if (selectable) {
							this._selectIndex = this.combineIndex(
								this._selectIndex,
								d.properties.index,
								index
							);
							this.selectLayer.select("*").remove();
							this._drawSelectLayer();
						}
						if (clickFn) {
							clickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index,
									data: originalParams,
									selected: this._selectIndex.get(d.properties.index)
										? this._selectIndex.get(d.properties.index)!.has(index)
										: false,
								},
								originData,
							});
						}
					} else {
						this._clickCount = 0;
						const dblClickFn = d.properties.option.onDbClick;
						if (dblClickFn) {
							dblClickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index,
									data: originalParams,
									selected: this._selectIndex.get(d.properties.index)
										? this._selectIndex.get(d.properties.index)!.has(index)
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
				const hasHover = d.properties.option.hasHover;

				if (hasHover) {
					const index = coordinates.findIndex(i =>
						this.isPointInLine(
							i,
							d3.pointer(e, this.container.node())!,
							this.projection,
							d.properties.option.style.strokeWidth
						)
					);

					this._hoverIndex = this.combineIndex(
						new Map(),
						d.properties.index,
						index
					);

					if (index > -1) {
						this._drawHoverLayer();
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
						d.properties.option.style.strokeWidth
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
							selected: this._selectIndex.get(d.properties.index)
								? this._selectIndex.get(d.properties.index)!.has(index)
								: false,
						},
						originData: d.properties.originData,
					});
				}
			});
	}

	private _drawSelectLayer() {
		this.selectLayer.selectAll("*").remove();
		const pathData = this._formatData(this.data, (e, idx, index) => {
			if (!this._selectIndex.get(idx)) {
				return false;
			} else {
				return this._selectIndex.get(idx)!.has(index);
			}
		});
		console.log(this._selectIndex, pathData);
		this.selectLayer
			.selectAll("path")
			.data(pathData)
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", l => l.properties.option.selectStyle.strokeColor)
			.attr("stroke-width", l => l.properties.option.selectStyle.strokeWidth)
			.attr("fill", "none")
			.attr("stroke-dasharray", l => {
				if (
					l.properties.option.selectStyle.strokeType === StrokeLineType.dotted
				) {
					return l.properties.option.selectStyle.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	private _drawHoverLayer() {
		this.hoverLayer.selectAll("*").remove();
		const pathData = this._formatData(this.data, (e, idx, index) => {
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
			.attr("stroke", l => l.properties.option.hoverStyle.strokeColor)
			.attr("stroke-width", l => l.properties.option.hoverStyle.strokeWidth)
			.attr("fill", "none")
			.attr("stroke-dasharray", l => {
				if (
					l.properties.option.hoverStyle.strokeType === StrokeLineType.dotted
				) {
					return l.properties.option.hoverStyle.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	private _formatData(
		data: PolyLineDataSourceProps[],
		dataFilter?: (e: polyLineItem, idx: number, index: number) => boolean
	) {
		return data.reduce(
			(pre, cur, idx) => {
				const { data = [], option } = cur;
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
				const { style = {}, hoverStyle = {}, selectStyle = {} } = option || {};
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
							style: {
								...this.option.style,
								...style,
							},
							hoverStyle: {
								...this.option.hoverStyle,
								...style,
								...hoverStyle,
							},
							selectStyle: {
								...this.option.selectStyle,
								...style,
								...selectStyle,
							},
							hasHover: !!hoverStyle?.strokeColor || this.option.hasHover,
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
					option: _PolyLineOptionProps;
					ids: (string | number)[];
					originData: PolyLineDataSourceProps;
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

		this._draw();
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

	updateData(data: PolyLineDataSourceProps[]) {
		this.data = data;
		this._selectIndex = new Map();
		this.baseLayer.selectAll("path").remove();
		this.selectLayer.selectAll("path").remove();
		this.hoverLayer.selectAll("path").remove();
		this._draw();
	}

	setSelectType(type: "link" | "path" | "all"): void {
		this._selectType = type;
	}
}

export type { PolyLineDataSourceProps };

export { PolyLineLayer as default, StrokeLineType };
