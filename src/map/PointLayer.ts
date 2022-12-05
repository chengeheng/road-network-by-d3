import * as d3 from "d3";
import PointSvg from "../images/point.svg";
import Layer, { LayerOption, LayerType } from "./Layer";

interface PointLayerOption extends LayerOption {
	icon?: string;
	width?: number;
	height?: number;
	offset?: [number, number];

	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
}

interface PointOption extends PointLayerOption {
	icon: string;
	width: number;
	height: number;
	offset: [number, number];

	stopPropagation: boolean;
	onClick: Function;
	onRightClick: Function;
	onDbClick: Function;
}

interface PointDataSource {
	id: string | number;
	coordinate: [number, number];
	name?: string;
	icon?: string;
	option?: PointLayerOption;
}

const defaultOption: PointOption = {
	icon: PointSvg,
	width: 36,
	height: 36,
	offset: [-18, -36],

	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
};

class PointLayer extends Layer {
	data: PointDataSource[];
	option: PointOption;
	isHided: boolean;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;

	constructor(dataSource: PointDataSource[], option: PointLayerOption = defaultOption) {
		super(LayerType.PointLayer, option);
		this.data = dataSource;
		this.option = { ...defaultOption, ...option };
		this.clickCount = 0;
		this.isHided = false;
	}

	init(svg: SVGGElement, projection: d3.GeoProjection) {
		super.init(svg, projection);
		this.container = d3.select(svg).append("g");
		this.container.selectAll("g").remove();

		this.baseLayer = this.container.append("g");

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

	updateData(data: PointDataSource[]) {
		this.data = data;
		this.baseLayer.selectAll("*").remove();

		this.draw();
	}

	protected draw() {
		const g = this.baseLayer.selectAll("g").data(this.formatData(this.data)).enter().append("g");

		g.append("image")
			.attr("xlink:href", d => d.icon)
			.attr("x", d => d.coordinate[0])
			.attr("y", d => d.coordinate[1])
			.attr("width", d => d.option.width)
			.attr("height", d => d.option.height)
			.attr("transform", d => `translate(${d.option.offset[0]},${d.option.offset[1]})`)
			.on("click", (e, d) => {
				if (d.option.stopPropagation) {
					e.stopPropagation();
				}
				this.clickCount++;
				const index = this.data.findIndex(i => i.id === d.id);
				clearTimeout(this.clickTimer);
				this.clickTimer = setTimeout(() => {
					if (this.clickCount % 2 === 1) {
						this.clickCount--;
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
						this.clickCount = 0;
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
			.attr("transform", d => `translate(${0},${d.option.offset[1]})`)
			.attr("font-size", 12)
			.attr("dx", d => {
				const width = this.calcuteTextWidth(d.name!);
				return -width / 2;
			})
			.text(d => d.name!);
	}

	formatData(data: PointDataSource[]) {
		return data.map(i => {
			return {
				...i,
				coordinate: this.projection(i.coordinate)!,
				icon: i.icon ?? this.option.icon,
				option: {
					...this.option,
					...i.option,
				},
			};
		});
	}

	private calcuteTextWidth(text: string, fontSize = "12px") {
		let span = document.getElementById("__getwidth");
		if (!span) {
			span = document.createElement("span");
		}
		span.id = "__getwidth";
		span.style.visibility = "hidden";
		span.style.fontSize = fontSize;
		span.style.whiteSpace = "nowrap";
		span.innerText = text;
		document.body.appendChild(span);
		const width = span.offsetWidth;
		document.body.removeChild(span);
		return width;
	}
}

export type { PointDataSource };

export default PointLayer;
