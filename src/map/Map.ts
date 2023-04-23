import * as d3 from "d3";

import { zooms } from "./constants/config";
import Layer from "./Layers";
import EditPolygon from "./Elements/EditPolygon";
import EditPolyline from "./Elements/EditPolyline";

interface MapOption {
	center?: [number, number];
	class?: string;
	level?: number;
	onClick?: Function;
	[propName: string]: any;
}

const defaultOptions = {
	center: [118.39067530252157, 31.343146080447582] as [number, number],
	onClick: () => {},
	level: 2,
};

export interface InitConfigProps {
	level: number;
}
class Map {
	id: string;
	width: number;
	height: number;
	projection: d3.GeoProjection;
	options: MapOption;

	private _level: number;
	private _lastLevel: number;
	private _layers: Layer[];
	private _container: HTMLElement;

	private _svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	private _mapContainer!: d3.Selection<SVGGElement, unknown, null, undefined>;
	private _layerContainer!: SVGGElement;
	private _extraContainer!: SVGGElement;
	private _toolContainer!: SVGGElement;
	private _modalConfigs: {
		id: string | number;
		x: number;
		y: number;
		width: number;
		height: number;
	}[];

	private _zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;

	constructor(id: string, options: MapOption = defaultOptions) {
		// 初始化值
		this.id = id;
		this.width = 0;
		this.height = 0;
		this._layers = [];
		this._level = options.level === undefined ? 2 : options.level;
		this._lastLevel = this._level;
		this.projection = d3.geoMercator();
		this._modalConfigs = [];

		const container = document.getElementById(this.id);
		if (container === null) {
			throw Error("地图容器的id不能为空");
		} else {
			this._container = container;

			const option = { ...defaultOptions, ...options };
			this.options = option;
			const rect = container.getBoundingClientRect();
			this.width = rect.width;
			this.height = rect.height;

			this.projection = d3
				.geoMercator()
				.scale(36292043.780950055)
				.center(option.center!)
				.translate([rect.width / 2, rect.height / 2]);

			this._init();
			const resizeObserver = new ResizeObserver(e => {
				const rect = this._container.getBoundingClientRect();
				this.width = rect.width;
				this.height = rect.height;

				this._svg.attr("width", rect.width).attr("height", rect.height);
			});
			resizeObserver.observe(this._container);
		}
	}
	//  初始化地图
	private _init() {
		const container = d3.select(this._container);
		container.selectAll("svg").remove();

		this._svg = container
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("cursor", "pointer");

		if (this.options.class) {
			this._svg.attr("class", this.options.class);
		}
		this._mapContainer = this._svg.append("g");
		this._layerContainer = this._mapContainer.append("g").attr("id", "layers").node()!;

		this._extraContainer = this._mapContainer.append("g").attr("id", "extra").node()!;

		this._toolContainer = this._mapContainer
			.append("g")
			.attr("id", "tools")
			.style("pointer-events", "none")
			.node()!;
		// 添加缩放事件
		this._zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([zooms[17], zooms[0]])
			.wheelDelta(event => {
				this._lastLevel = this._level;
				if (event.deltaY < 0) {
					if (this._level === 1) return Math.log2(1);
					this._level--;
					return Math.log2(zooms[this._level - 1] / zooms[this._level]);
				} else {
					if (this._level === 18) return Math.log2(1);
					this._level++;
					return Math.log2(zooms[this._level - 1] / zooms[this._level - 2]);
				}
			})
			.on("zoom", e => {
				this._mapContainer.attr("transform", e.transform);
				if (e?.sourceEvent?.type === "wheel") {
					this._updateMapConfig();
				}
			});

		this._zoom.scaleBy(this._svg, zooms[this._level - 1]);
		this._svg.transition().duration(1000);
		this._zoom.duration(1000);
		this._svg.call(this._zoom);
		this._addClickFn();
	}

	private _updateMapConfig() {
		const config: InitConfigProps = {
			level: this._level,
		};
		this._layers.forEach(i => i.updateMapConfig(config));
		this._updateModal();
	}

	private _addClickFn() {
		this._svg
			.on("click", e => {
				const projection = this.projection;
				// console.log(d3.pointer(e, g.node()));
				if (this.options.onClick) {
					this.options.onClick(e, projection.invert!(d3.pointer(e, this._mapContainer.node())));
				}
			})
			.on("dblclick.zoom", null);
	}
	private _removeClickFn() {
		this._svg.on("click", null);
	}

	/**
	 * 添加图层
	 * @param layer 图层实例
	 */
	addLayer(layer: Layer) {
		this._layers.push(layer);
		layer.init(this._layerContainer, this.projection, { level: this._level });
	}
	/**
	 * 删除图层
	 * @param layer 图层实例
	 */
	removeLayer(layer: Layer) {
		for (let i = 0; i < this._layers.length; i++) {
			if (this._layers[i] === layer) {
				this._layers.splice(i, 1);
			}
		}
		layer.remove();
	}
	/**
	 * 显示指定的或所有隐藏的图层
	 * @param layer 图层
	 */
	showLayer(layer?: Layer) {
		if (layer === undefined) {
			this._layers.forEach(i => i.show());
		} else {
			layer.show();
		}
	}
	/**
	 * 隐藏指定的或所有图层
	 * @param layer 图层
	 */
	hideLayer(layer?: Layer) {
		if (layer === undefined) {
			this._layers.forEach(i => i.hide());
		} else {
			layer.show();
		}
	}

	/**
	 * 移动到指定点位
	 * @param coord 点位bd09坐标
	 * @param zoomLevel 地图缩放层级[1-20]
	 */
	moveTo(coord: [number, number], zoomLevel?: number) {
		if (zoomLevel !== undefined) {
			this._lastLevel = this._level;
			if (zoomLevel < 1) {
				this._level = 1;
			} else if (zoomLevel > 18) {
				this._level = 18;
			} else {
				this._level = Math.floor(zoomLevel);
			}

			if (this._lastLevel !== this._level) {
				this._updateMapConfig();
			}
		}
		const realCoord = this.projection(coord)!;
		const t = d3.zoomIdentity.scale(zooms[this._level - 1]).apply(realCoord);
		const m = d3.zoomIdentity
			.translate(-(t[0] - this.width / 2), -(t[1] - this.height / 2))
			.scale(zooms[this._level - 1]);
		this._svg.transition().duration(1000).call(this._zoom.transform, m);
	}

	/**
	 * 移动到某个区域的最佳视图
	 * @param coords 坐标数组
	 * @returns
	 */
	focusOnView(coords: [number, number][]): void {
		const projectionCoords = coords.map(this.projection) as [number, number][];
		if (projectionCoords.length === 0) {
			return;
		}
		const min: number[] = [];
		const max: number[] = [];
		[min[0], max[0]] = d3.extent(projectionCoords, d => d[0]) as [number, number];
		[min[1], max[1]] = d3.extent(projectionCoords, d => d[1]) as [number, number];

		const xScale = (max[0] - min[0]) / this.width;
		const yScale = (max[1] - min[1]) / this.height;
		const middle: [number, number] = this.projection.invert!([
			(max[0] + min[0]) / 2,
			(max[1] + min[1]) / 2,
		]) as [number, number];

		const scale = Math.max(xScale, yScale) === 0 ? 5 : 1 / Math.max(xScale, yScale);

		const diffs = zooms.map(i => Math.abs(scale - i));
		const minDiff = Math.min(...diffs);
		const index = diffs.indexOf(minDiff);

		if (index < 17) {
			this.moveTo(middle, index + 2);
		} else {
			this.moveTo(middle, index + 1);
		}
	}
	/**
	 * 设定地图缩放等级
	 * @param {number} level 地图缩放等级
	 */
	setLevel(level: number) {
		this._lastLevel = this._level;
		if (level >= 18) {
			this._level = 18;
		} else if (level <= 1) {
			this._level = 1;
		} else {
			this._level = Math.floor(level);
		}
		this._zoom.scaleBy(
			this._svg.transition().duration(500),
			zooms[this._level - 1] / zooms[this._lastLevel - 1]
		);
	}

	// 添加绘制面的工具
	paintPolygon() {
		d3.select(this._layerContainer).style("pointer-events", "none");
		d3.select(this._toolContainer).style("pointer-events", "inherit");
		this._removeClickFn();
		return new Promise((resolve, reject) => {
			const polygon = new EditPolygon({
				container: d3.select(this._toolContainer),
				projection: this.projection,
				map: this._toolContainer,
			});
			this._svg
				.on("click", e => {
					polygon.addData(
						this.projection.invert!(d3.pointer(e, this._mapContainer.node())) as [number, number]
					);
				})
				.on("contextmenu", () => {
					resolve(polygon.printCoordinates());
				});
		}).finally(() => {
			d3.select(this._layerContainer).style("pointer-events", "inherit");
			d3.select(this._toolContainer).style("pointer-event", "none");
			this._addClickFn();
		});
	}

	// 添加绘制线的工具
	paintPolyline() {
		d3.select(this._layerContainer).style("pointer-events", "none");
		d3.select(this._toolContainer).style("pointer-events", "inherit");
		this._removeClickFn();
		return new Promise((resolve, reject) => {
			const polygon = new EditPolyline({
				container: d3.select(this._toolContainer),
				projection: this.projection,
				map: this._toolContainer,
			});
			this._svg
				.on("click", e => {
					polygon.addData(
						this.projection.invert!(d3.pointer(e, this._mapContainer.node())) as [number, number]
					);
				})
				.on("contextmenu", () => {
					resolve(polygon.printCoordinates());
				});
		}).finally(() => {
			d3.select(this._layerContainer).style("pointer-events", "inherit");
			d3.select(this._toolContainer).style("pointer-event", "none");
			this._addClickFn();
		});
	}

	addModal(options: { id: string | number; x: number; y: number; width: number; height: number }) {
		const { id, x, y, width, height } = options;
		const scale = 1 / zooms[this._level - 1];
		this._modalConfigs.push(options);

		const foreignObject = d3
			.select(this._extraContainer)
			.append("foreignObject")
			.attr("id", `foreignObject_${id}`)
			.attr("x", x)
			.attr("y", y)
			.attr("width", width)
			.attr("height", height)
			.attr("transform", `translate(${x}, ${y}) scale(${scale}) translate(${-x}, ${-y}) `);

		return foreignObject.node();
	}

	removeModal(id: string | number) {
		d3.select(this._extraContainer).select(`#foreignObject_${id}`).remove();
		this._modalConfigs = this._modalConfigs.filter(i => i.id !== id);
	}

	removeAllModal() {
		d3.select(this._extraContainer).selectAll("foreignObject").remove();
	}

	private _updateModal() {
		const scale = 1 / zooms[this._level - 1];
		d3.select(this._extraContainer)
			.selectAll("foreignObject")
			.data(this._modalConfigs)

			.attr(
				"transform",
				d => `translate(${d.x}, ${d.y}) scale(${scale}) translate(${-d.x}, ${-d.y}) `
			);
		// .attr("width", d => d.width * scale)
		// .attr("height", d => d.height * scale);
	}
}

export default Map;
