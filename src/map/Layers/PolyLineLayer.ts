import * as d3 from "d3";
import Layer, { LayerOptionProps, LayerType } from ".";
import { InitConfigProps } from "../Map";
import { debounce } from "lodash";

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

	selectable?: boolean;
	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
	onHover?: Function;
	onLeave?: Function;
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
	onHover: Function;
	onLeave: Function;
	selectType: "link" | "path" | "all";
}

interface _DrawParameterProps {
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
	onHover: () => {},
	onLeave: () => {},
	selectType: "link" as "link" | "path" | "all",
};

class PolyLineLayer extends Layer {
	data: PolyLineDataSourceProps[];
	option: _PolyLineOptionProps;
	path!: d3.GeoPath<any, any>;
	length: number;

	private _baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	private _selectLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	private _hoverLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private _clickCount: number;
	private _clickTimer: NodeJS.Timeout | undefined;
	private _selectIndex: Map<number, Set<number>>;
	private _hoverIndex: Map<number, Set<number>>;
	private _selectType: "link" | "path" | "all"; // 选中的类型
	private _allIndex: Map<number, Set<number>>; // 全部的index
	private _hover: boolean;

	constructor(dataSource: PolyLineDataSourceProps[], option?: PolyLineLayerOptionProps) {
		super(LayerType.PolygonLayer, option);
		this.data = dataSource;
		this.option = this._combineOption(option);
		this._clickCount = 0;
		this._selectIndex = new Map();
		this._selectType = this.option.selectType;
		this._allIndex = new Map();
		this._hoverIndex = new Map();
		this.length = dataSource.length;
		this._hover = false;
	}

	private _combineOption(option: PolyLineLayerOptionProps = defaultOption): _PolyLineOptionProps {
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
		this._baseLayer
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
				const [data, index] = this._formatReturnedData(e, d);
				clearTimeout(this._clickTimer);
				this._clickTimer = setTimeout(() => {
					if (this._clickCount % 2 === 1) {
						this._clickCount--;
						const selectable = d.properties.option.selectable;
						if (selectable) {
							this._selectIndex = this.combineIndex(this._selectIndex, d.properties.index, index);
							this._drawSelectLayer();
						}
						d.properties.option.onClick(data);
					} else {
						this._clickCount = 0;
						d.properties.option.onDbClick(data);
					}
				}, 300);
			})
			.on("mousemove", (e, d) => {
				this._hover = true;
				const hasHover = d.properties.option.hasHover;
				if (hasHover) {
					const [data, index] = this._formatReturnedData(e, d);
					this._hoverIndex = this.combineIndex(new Map(), d.properties.index, index as number);
					if ((index as number) > -1) {
						this._drawHoverLayer();
						d.properties.option.onHover(data);
					}
				}
			})
			.on("mouseleave", (e, d) => {
				this._hover = false;
				this._hoverLayer.selectAll("*").remove();
				if (d.properties.option.onLeave) {
					const [data] = this._formatReturnedData(e, d);
					d.properties.option.onLeave(data);
				}
			})
			.on("contextmenu", (e, d) => {
				const [data] = this._formatReturnedData(e, d);
				d.properties.option.onRightClick(data);
			});
	}

	private _formatReturnedData(e: any, d: _DrawParameterProps): [any, number] {
		let index: number = -1;
		let startIndex = -1;
		let endIndex = -1;
		const coordinates = d.geometry.coordinates;
		const lineWidth = d.properties.option.style.strokeWidth;
		const targetCoord = d3.pointer(e, this.container.node())!;
		for (let i = 0; i < coordinates.length; i++) {
			const [inPoint, start, end] = this._isPointInLine(
				coordinates[i],
				targetCoord,
				this.projection,
				lineWidth
			);
			if (inPoint) {
				index = i;
				startIndex = start;
				endIndex = end;
				break;
			}
		}
		let originalParams: any;
		if (this._selectType === "all") {
			originalParams = this.data;
		} else if (this._selectType === "path") {
			originalParams = d.properties.originData;
		} else {
			originalParams = d.properties.originData?.data[index];
		}

		return [
			{
				data: originalParams,
				PointerEvent: e,
				target: {
					index,
					data: originalParams,
					selected: this._selectIndex.get(d.properties.index)
						? this._selectIndex.get(d.properties.index)!.has(index)
						: false,
					startIndex,
					endIndex,
					coordinate: targetCoord,
				},
				originData: d.properties.originData,
			},
			index,
		];
	}

	private _drawSelectLayer() {
		this._selectLayer.selectAll("*").remove();
		const pathData = this._formatData(this.data, (e, idx, index) => {
			if (!this._selectIndex.get(idx)) {
				return false;
			} else {
				return this._selectIndex.get(idx)!.has(index);
			}
		});
		this._selectLayer
			.selectAll("path")
			.data(pathData)
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", l => l.properties.option.selectStyle.strokeColor)
			.attr("stroke-width", l => l.properties.option.selectStyle.strokeWidth)
			.attr("fill", "none")
			.attr("stroke-dasharray", l => {
				if (l.properties.option.selectStyle.strokeType === StrokeLineType.dotted) {
					return l.properties.option.selectStyle.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	private _drawHoverLayer() {
		this._hoverLayer.selectAll("*").remove();
		const pathData = this._formatData(this.data, (e, idx, index) => {
			if (!this._hoverIndex.get(idx)) {
				return false;
			} else {
				return this._hoverIndex.get(idx)!.has(index);
			}
		});

		this._hoverLayer
			.selectAll("path")
			.data(pathData)
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", l => l.properties.option.hoverStyle.strokeColor)
			.attr("stroke-width", l => l.properties.option.hoverStyle.strokeWidth)
			.attr("fill", "none")
			.attr("stroke-dasharray", l => {
				if (l.properties.option.hoverStyle.strokeType === StrokeLineType.dotted) {
					return l.properties.option.hoverStyle.strokeDashArray;
				} else {
					return null;
				}
			});
	}

	private _formatData(
		data: PolyLineDataSourceProps[],
		dataFilter?: (e: polyLineItem, idx: number, index: number) => boolean
	): _DrawParameterProps[] {
		return data.reduce((pre, cur, idx) => {
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
			const onHover = option?.onHover || this.option.onHover;
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
						onHover: debounce((...e) => {
							if (this._hover) {
								onHover(...e);
							}
						}, 500),
					},

					ids,
					originData: cur,
					index: idx,
				},
			});

			return pre;
		}, [] as Array<_DrawParameterProps>);
	}

	private combineIndex<T extends Map<number, Set<number>>>(
		idxs: T,
		index: number, // 外部index，pathIndex
		idx: number // 内部index，linkIndex
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
			return this._insideInStandardRect([x1, y1 - height], [x2, y1 + height], [x, y]);
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

		return this._insideInStandardRect([x1r, y1r - height], [x2r, y2r + height], [xr, yr]);
	}

	private _isPointInLine(
		coordinates: [number, number][],
		point: [number, number],
		projection: d3.GeoProjection,
		lineWidth: number
	): [boolean, number, number] {
		if (coordinates.length <= 1) return [false, -1, -1];
		const lineArr = coordinates.map(projection) as [number, number][];
		for (let i = 1; i < lineArr.length; i++) {
			if (this._insideInRect(lineArr[i], lineArr[i - 1], point, lineWidth / 2)) {
				return [true, i - 1, i];
			}
		}

		return [false, -1, -1];
	}

	init(g: SVGGElement, projection: d3.GeoProjection, option: InitConfigProps) {
		super.init(g, projection, option);
		this.path = d3.geoPath<any, any>().projection(projection);
		this.container = d3.select(g).append("g").attr("id", `polyline-layer-${this.makeRandomId()}`);
		this.container.selectAll("g").remove();

		this._baseLayer = this.container.append("g");
		this._selectLayer = this.container.append("g").style("pointer-events", "none");
		this._hoverLayer = this.container.append("g").style("pointer-events", "none");

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
		this._baseLayer.selectAll("path").remove();
		this._selectLayer.selectAll("path").remove();
		this._hoverLayer.selectAll("path").remove();
		this._draw();
	}

	setSelectType(type: "link" | "path" | "all"): void {
		this._selectType = type;
	}
}

export type { PolyLineDataSourceProps };

export { PolyLineLayer as default, StrokeLineType };
