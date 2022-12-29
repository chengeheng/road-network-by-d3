import * as d3 from "d3";
import PointSvg from "../images/point.svg";
import Layer, { LayerOption, LayerType } from "./Layer";

interface PointItemOption extends LayerOption {
	rotate?: number;
	offset?: [number, number];
	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
}

interface PointOption extends PointItemOption {
	rotate: number;
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
	offset: [0, 0],
	rotate: 0,

	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
};

class LabelLayer extends Layer {
	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private filterIds: string[];

	data: PointDataSource[];
	option: PointOption;
	isHided: boolean;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	constructor(
		dataSource: PointDataSource[],
		option: PointLayerOption = defaultOption
	) {
		super(LayerType.PointLayer, option);
		this.data = dataSource;
		this.option = { ...defaultOption, ...option };
		this.clickCount = 0;
		this.isHided = false;
		this.filterIds = [];
	}

	private initState() {
		this.clickCount = 0;
		this.isHided = false;
		this.filterIds = [];
	}

	protected init(g: SVGGElement, projection: d3.GeoProjection) {
		super.init(g, projection);
		this.container = d3
			.select(g)
			.append("g")
			.attr("id", `point-layer-${this.makeRandomId()}`);
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

	enableLayerFunc(): void {
		this.container.style("pointer-events", "inherit");
	}

	disableLayerFunc(): void {
		this.container.style("pointer-events", "none");
	}

	updateData(data: PointDataSource[]) {
		this.data = data;
		// 初始化数据
		this.baseLayer.selectAll("*").remove();
		this.initState();
		this.container.style("display", "inline");
		// 绘制
		this.draw();
	}

	protected draw() {
		if (this.option.hoverColor) {
			this.drawWithHoverColor();
		} else {
			this.drawWithOutHoverColor();
		}
	}

	private drawWithHoverColor() {
		const g = this.baseLayer
			.selectAll("g")
			.data(this.formatData(this.data))
			.enter()
			.append("g");
		const hoverColor = this.option.hoverColor!;
		const filterMatrix = this.makeFilterMatrix(hoverColor);
		const id = this.makeRandomId();

		this.baseLayer
			.append("defs")
			.append("filter")
			.attr("id", id)
			.append("feColorMatrix")
			.attr("type", "matrix")
			.attr("values", filterMatrix);
		this.filterIds.push(id);

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
			.attr(
				"transform",
				d => `translate(${0},${d.option.offset[1] - d.option.height})`
			)
			.style("text-anchor", "middle")
			.attr("font-size", 12)
			.text(d => d.name!);
	}

	private drawWithOutHoverColor() {
		const g = this.baseLayer
			.selectAll("g")
			.data(this.formatData(this.data))
			.enter()
			.append("g");

		g.append("image")
			.attr("xlink:href", d => d.icon)
			.attr("x", d => d.imageLeftTop[0])
			.attr("y", d => d.imageLeftTop[1])
			.attr("width", d => d.option.width)
			.attr("height", d => d.option.height)
			.attr(
				"transform",
				d =>
					`rotate(${d.option.rotate}, ${d.imageCenter[0]}, ${d.imageCenter[1]}) translate(${d.option.offset[0]},${d.option.offset[1]})`
			)
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
			.style("text-anchor", "middle")
			.attr(
				"transform",
				d => `translate(${0},${d.option.offset[1] - d.option.height})`
			)
			.attr("font-size", 12)
			.text(d => d.name!);
	}

	private formatData(data: PointDataSource[]) {
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

export type { PointDataSource };

export default LabelLayer;
