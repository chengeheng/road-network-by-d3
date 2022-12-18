import * as d3 from "d3";
import PointSvg from "../images/point.svg";
import Layer, { LayerOption, LayerType } from "./Layer";

interface PointLayerOption extends LayerOption {
	icon?: string;
	width?: number;
	height?: number;
	offset?: [number, number];
	rotate?: number;
	hoverColor?: string;

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
	rotate: number;

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

class PointLayer extends Layer {
	data: PointDataSource[];
	option: PointOption;
	isHided: boolean;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private filterIds: string[];

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

	init(g: SVGGElement, projection: d3.GeoProjection) {
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
			})
			.on("mouseover", (e, d) => {
				const image = d3.select(e.target);
				image.attr("filter", `url(#${id})`);
			})
			.on("mouseout", (e, d) => {
				const image = d3.select(e.target);
				image.attr("filter", `none`);
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
			const width = option.width;
			const height = option.height;
			const imageCenter: [number, number] = [
				coordinate[0],
				coordinate[1] - height / 2,
			];
			const imageLeftTop: [number, number] = [
				coordinate[0] - width / 2,
				coordinate[1] - height,
			];
			return {
				...i,
				coordinate: coordinate,
				icon: i.icon ?? i.option?.icon ?? this.option.icon,
				option: option,
				imageCenter,
				imageLeftTop,
			};
		});
	}

	private makeFilterMatrix(color: string) {
		const [r, g, b] = this.hexToRgb(color);
		return `
		0 0 0 0 ${r / 255} 
		0 0 0 0 ${g / 255} 
		0 0 0 0 ${b / 255}  
		0 0 0 1 0
	`;
	}

	private hexToRgb(color: string): [number, number, number] {
		// 16进制颜色值的正则
		const reg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/;
		const testColor = color.toLowerCase();
		if (reg.test(testColor)) {
			let newColor: string;
			if (testColor.length === 4) {
				newColor = "#";
				for (let i = 1; i < 4; i++) {
					newColor += testColor
						.slice(i, i + 1)
						.concat(testColor.slice(i, i + 1));
				}
			} else {
				newColor = testColor;
			}
			const colorChange = [];
			for (let i = 1; i < 7; i += 2) {
				colorChange.push(parseInt("0x" + newColor.slice(i, i + 2)));
			}
			return colorChange as [number, number, number];
		} else {
			throw new Error("输入的颜色值必须是合法的16进制颜色");
		}
	}
}

export type { PointDataSource };

export default PointLayer;
