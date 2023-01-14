import * as d3 from "d3";
import Layer, { LayerOptionProps, LayerType } from ".";

interface LabelItemOptionProps extends LayerOptionProps {
	rotate?: number;
	offset?: [number, number];
	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
}

interface LabelOptionProps extends LabelItemOptionProps {
	rotate: number;
	offset: [number, number];
	stopPropagation: boolean;
	onClick: Function;
	onRightClick: Function;
	onDbClick: Function;
}

interface StyleProps {
	color?: string;
	fontWeight?: string;
	fontSize?: number;
	strokeColor?: string;
	strokeWidth?: number;
}

interface LabelDataSourceProps {
	name: string;
	coordinate: [number, number];
	id: string | number;
	option?: LabelItemOptionProps;
	style?: StyleProps;
	hoverStyle?: StyleProps;
	selectStyle?: StyleProps;
}

const defaultOption: LabelOptionProps = {
	rotate: 0,
	offset: [0, 0],
	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
};

const defaultTextStyle = {
	fontSize: 12,
	fontWeight: "normal",
	color: "#333333",
	strokeColor: "transparent",
	strokeWidth: 2,
};

class LabelLayer extends Layer {
	private _clickCount: number;
	private _clickTimer: NodeJS.Timeout | undefined;
	private _filterIds: string[];
	private _baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	data: LabelDataSourceProps[];
	option: LabelOptionProps;
	isHided: boolean;

	constructor(
		dataSource: LabelDataSourceProps[],
		option: LabelItemOptionProps = defaultOption
	) {
		super(LayerType.PointLayer, option);
		this.data = dataSource;
		this.option = { ...defaultOption, ...option };

		this._clickCount = 0;
		this.isHided = false;
		this._filterIds = [];
	}

	private initState() {
		this._clickCount = 0;
		this._filterIds = [];
		this.isHided = false;
	}

	init(g: SVGGElement, projection: d3.GeoProjection) {
		super.init(g, projection);
		this.container = d3
			.select(g)
			.append("g")
			.attr("id", `point-layer-${this.makeRandomId()}`);
		this.container.selectAll("g").remove();

		this._baseLayer = this.container.append("g");

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

	updateData(data: LabelDataSourceProps[]) {
		this.data = data;
		// 初始化数据
		this._baseLayer.selectAll("*").remove();
		this.initState();
		this.container.style("display", "inline");
		// 绘制
		this._draw();
	}

	protected _draw() {
		const g = this._baseLayer
			.selectAll("g")
			.data(this.formatData(this.data))
			.enter()
			.append("g");

		g.filter(i => {
			if (i.name) {
				return true;
			} else {
				return false;
			}
		})
			.append("text")
			.attr("x", d => d.coordinate[0])
			.attr("y", d => d.coordinate[1])
			.style("text-anchor", "middle")
			.attr(
				"transform",
				d =>
					`rotate(${d.option.rotate}, ${d.coordinate[0]}, ${d.coordinate[1]}) translate(${d.option.offset[0]},${d.option.offset[1]})`
			)
			.attr("fill", d => d.style?.color || defaultTextStyle.color)
			.attr("font-size", d => d.style?.fontSize || defaultTextStyle.fontSize)
			.attr(
				"font-weight",
				d => d.style?.fontWeight || defaultTextStyle.fontWeight
			)
			.attr("stroke", d => d.style?.strokeColor || defaultTextStyle.strokeColor)
			.attr(
				"stroke-width",
				d => d.style?.strokeWidth || defaultTextStyle.strokeWidth
			)
			.attr("paint-order", "stroke")
			.style("text-anchor", "middle")
			.attr("dominant-baseline", "central")
			.text(d => d.name!)
			.on("click", (e, d) => {
				if (d.option.stopPropagation) {
					e.stopPropagation();
				}
				this._clickCount++;
				const index = this.data.findIndex(i => i.id === d.id);
				clearTimeout(this._clickTimer);
				this._clickTimer = setTimeout(() => {
					if (this._clickCount % 2 === 1) {
						this._clickCount--;
						const clickFn = d.option.onClick;
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
						this._clickCount = 0;
						const dblClickFn = d.option.onDbClick;
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
				if (d.option.stopPropagation) {
					e.stopPropagation();
				}
				const index = this.data.findIndex(i => i.id === d.id);
				const rightClickFn = d.option.onRightClick;
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

	private formatData(data: LabelDataSourceProps[]) {
		return data.map(i => {
			const option = { ...this.option, ...i.option };
			const coordinate = this.projection(i.coordinate)!;
			return {
				...i,
				coordinate: coordinate,
				option: option,
			};
		});
	}
}

export type { LabelDataSourceProps };

export default LabelLayer;
