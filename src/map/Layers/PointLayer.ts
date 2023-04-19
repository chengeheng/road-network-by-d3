import * as d3 from "d3";
import { debounce } from "lodash";
import PointSvg from "../images/point.svg";
import { zooms } from "../constants/config";
import NavigationSvg from "../images/navigation.svg";
import Layer, { LayerOptionProps, LayerType } from ".";

import { InitConfigProps } from "../Map";

interface PointLayerOption extends LayerOptionProps {
	icon?: string;
	width?: number;
	height?: number;
	offset?: [number, number];
	rotate?: number;
	hoverColor?: string;
	imageShrink?: boolean;

	tinyIcon?: string;
	useTinyIcon?: boolean;
	tinyIconStyle?: {
		width?: number;
		height?: number;
		offset?: [number, number];
	};

	stopPropagation?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	onDbClick?: Function;
	onHover?: Function;
}

interface PointOption extends PointLayerOption {
	icon: string;
	width: number;
	height: number;
	offset: [number, number];
	rotate: number;

	tinyIcon: string;
	useTinyIcon: boolean;
	tinyIconStyle: {
		width: number;
		height: number;
		offset: [number, number];
	};

	stopPropagation: boolean;
	onClick: Function;
	onRightClick: Function;
	onDbClick: Function;
	onHover: Function;
}

interface PointDataSourceProps {
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

	tinyIcon: NavigationSvg,
	useTinyIcon: false,
	tinyIconStyle: {
		width: 36,
		height: 36,
		offset: [0, 0],
	},

	stopPropagation: false,
	onClick: () => {},
	onRightClick: () => {},
	onDbClick: () => {},
	onHover: () => {},
};

class PointLayer extends Layer {
	data: PointDataSourceProps[];
	option: PointOption;
	isHided: boolean;

	baseLayer!: d3.Selection<SVGGElement, unknown, null, undefined>;

	private clickCount: number;
	private clickTimer: NodeJS.Timeout | undefined;
	private filterIds: string[];
	private _mapConfig!: InitConfigProps;
	private _imageShrink: boolean;
	private _hover: boolean;

	constructor(dataSource: PointDataSourceProps[], option: PointLayerOption = defaultOption) {
		super(LayerType.PointLayer, option);
		this.data = dataSource;
		this.option = this._combineOption(option);
		this._imageShrink = option.imageShrink === undefined ? true : option.imageShrink;
		this.clickCount = 0;
		this.isHided = false;
		this.filterIds = [];
		this._hover = false;
	}

	private _initState() {
		this.clickCount = 0;
		this.isHided = false;
		this.filterIds = [];
	}

	private _combineOption(option: PointLayerOption) {
		const { tinyIconStyle = {}, ...rest } = option;
		const { tinyIconStyle: defaultTinyIconStyle, ...restOption } = defaultOption;
		return {
			...restOption,
			...rest,
			tinyIconStyle: {
				...defaultTinyIconStyle,
				...tinyIconStyle,
			},
		};
	}

	private _drawWithHoverColor() {
		const g = this.baseLayer.selectAll("g").data(this._formatData(this.data)).enter().append("g");
		const hoverColor = this.option.hoverColor!;
		const filterMatrix = this._makeFilterMatrix(hoverColor);
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
				d => `rotate(${d.option.rotate}, ${d.imageCenter[0]}, ${d.imageCenter[1]})`
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
			.on("mousemove", (e, d) => {
				if (d.option.onHover) {
					d.option.onHover(d._originData);
				}
			})
			.on("mouseover", (e, d) => {
				this._hover = true;
				const image = d3.select(e.target);
				image.attr("filter", `url(#${id})`);
			})
			.on("mouseout", (e, d) => {
				this._hover = false;
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
			.attr("transform", d => `translate(${0},${d.option.offset[1] - d.option.height})`)
			.style("text-anchor", "middle")
			.attr("font-size", d => d.option.fontSize)
			.text(d => d.name!);
	}

	private _drawWithOutHoverColor() {
		const g = this.baseLayer.selectAll("g").data(this._formatData(this.data)).enter().append("g");

		g.append("image")
			.attr("xlink:href", d => d.icon)
			.attr("x", d => d.imageLeftTop[0])
			.attr("y", d => d.imageLeftTop[1])
			.attr("width", d => d.option.width)
			.attr("height", d => d.option.height)
			.attr(
				"transform",
				d => `rotate(${d.option.rotate}, ${d.imageCenter[0]}, ${d.imageCenter[1]})`
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

		// g.append("circle")
		// 	.attr("cx", d => d.coordinate[0])
		// 	.attr("cy", d => d.coordinate[1])
		// 	.attr("r", 5)
		// 	.attr("fill", "black");

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
			.attr("transform", d => `translate(${0},${d.option.offset[1] - d.option.height})`)
			.attr("font-size", d => d.option.fontSize)
			.text(d => d.name!);
	}

	private _formatData(data: PointDataSourceProps[]) {
		return data.map(i => {
			const option = { ...this.option, ...i.option };
			let { offset } = option;
			const coordinate = this.projection(i.coordinate)!;
			let width = option.width;
			let height = option.height;
			let fontSize = 12;
			const useTinyIcon = i.option?.useTinyIcon ?? option.useTinyIcon;
			let icon = i.icon ?? i.option?.icon ?? this.option.icon;
			if (useTinyIcon && this._mapConfig.level > 6) {
				icon = i.option?.tinyIcon ?? option.tinyIcon;
				width = option.tinyIconStyle.width ?? this.option.tinyIconStyle.width;
				height = option.tinyIconStyle.height ?? this.option.tinyIconStyle.height;
				offset = option.tinyIconStyle.offset ?? this.option.tinyIconStyle.offset;
				// rotate = rotate - 143;
			}
			if (this._imageShrink === false) {
				const scale = 1 / zooms[this._mapConfig.level - 1];
				width = width * scale;
				height = height * scale;
				offset = [offset[0] * scale, offset[1] * scale];
				fontSize = fontSize * scale;
			}

			const imageCenter: [number, number] = [
				coordinate[0] + offset[0],
				coordinate[1] + offset[1] - height / 2,
			];
			const imageLeftTop: [number, number] = [
				coordinate[0] + offset[0] - width / 2,
				coordinate[1] + offset[1] - height,
			];

			return {
				...i,
				coordinate: coordinate,
				icon: icon,
				useTinyIcon,
				option: {
					...option,
					width,
					height,
					offset,
					fontSize,
					onHover: debounce(e => {
						if (this._hover) {
							option.onHover(e);
						}
					}, 2000),
				},
				imageCenter,
				imageLeftTop,
				_originData: i,
			};
		});
	}

	private _makeFilterMatrix(color: string) {
		const [r, g, b] = this._hexToRgb(color);
		return `
		0 0 0 0 ${r / 255} 
		0 0 0 0 ${g / 255} 
		0 0 0 0 ${b / 255}  
		0 0 0 1 0
	`;
	}

	private _hexToRgb(color: string): [number, number, number] {
		// 16进制颜色值的正则
		const reg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/;
		const testColor = color.toLowerCase();
		if (reg.test(testColor)) {
			let newColor: string;
			if (testColor.length === 4) {
				newColor = "#";
				for (let i = 1; i < 4; i++) {
					newColor += testColor.slice(i, i + 1).concat(testColor.slice(i, i + 1));
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

	protected _draw() {
		if (this.option.hoverColor) {
			this._drawWithHoverColor();
		} else {
			this._drawWithOutHoverColor();
		}
	}

	init(g: SVGGElement, projection: d3.GeoProjection, config: InitConfigProps) {
		super.init(g, projection, config);
		this._mapConfig = config;
		this.container = d3.select(g).append("g").attr("id", `point-layer-${this.makeRandomId()}`);
		this.container.selectAll("g").remove();

		this.baseLayer = this.container.append("g");

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

	updateData(data: PointDataSourceProps[]) {
		this.data = data;
		// 初始化数据
		this.baseLayer.selectAll("*").remove();
		this._initState();
		this.container.style("display", "inline");
		// 绘制
		this._draw();
	}

	updateMapConfig(config: InitConfigProps) {
		this._mapConfig = config;
		if (this._imageShrink === false) {
			this.baseLayer.selectAll("*").remove();
			this._draw();
		}
	}
}

export type { PointDataSourceProps };

export default PointLayer;
