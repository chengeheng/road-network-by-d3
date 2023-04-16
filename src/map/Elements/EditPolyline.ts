import * as d3 from "d3";

interface EditPolylineProps {
	map: SVGGElement;
	container: d3.Selection<any, unknown, null, undefined>;
	projection: d3.GeoProjection;
}

class EditPolyline {
	private _map!: SVGGElement;
	private _data: [number, number][];
	private _parent: d3.Selection<any, unknown, null, undefined>;
	private _path!: d3.GeoPath<any, any>;
	private _projection!: d3.GeoProjection;

	constructor(options: EditPolylineProps) {
		this._data = [];
		this._map = options.map;
		this._projection = options.projection;
		this._parent = options.container;
		this._path = d3.geoPath<any, any>().projection(this._projection);
	}

	addData(data: [number, number]) {
		this._data.push(data);
		this._draw();
	}

	printCoordinates() {
		return this._data;
	}

	private _drawPolygon() {
		const update = this._parent?.selectAll("path").data([
			{
				type: "Feature",
				geometry: {
					type: "MultiLineString",
					coordinates: [this._data],
				},
				properties: {
					id: "polygon",
				},
			},
		]);

		update.attr("d", d => {
			return this._path(d);
		});

		update
			.enter()
			.append("path")
			.attr("d", d => {
				return this._path(d);
			})
			.attr("stroke", "#87ceeb")
			.attr("stroke-width", 4)
			.attr("fill", "none")
			.exit()
			.remove();
	}

	private _drawPoints() {
		const me = this;
		const pointData = this._data.map((i, idx) => {
			const [x, y] = this._projection(i)!;
			return {
				x: x,
				y: y,
				idx,
			};
		});
		const draged = d3
			.drag<SVGCircleElement, { x: number; y: number; idx: number }>()
			.on("start", e => {
				e.sourceEvent.stopPropagation();
			})
			.on("drag", function (e, d, ...c) {
				const { idx } = d;
				me._data[idx] = me._projection.invert!(d3.pointer(e, me._map))!;
				d3.select(this)
					.raise()
					.attr("cx", (d.x = e.x))
					.attr("cy", (d.y = e.y));
				me._drawPolygon();
			})
			.on("end", () => {});
		const update = this._parent?.selectAll("circle").data(pointData);
		update
			.enter()
			.append<SVGCircleElement>("circle")
			.attr("cx", d => d.x)
			.attr("cy", d => d.y)
			.attr("r", 10)
			.attr("stroke", "#666")
			.attr("stroke-width", 1)
			.attr("fill", "transparent")
			.call(draged)
			.exit()
			.remove();
	}

	private _draw() {
		this._confirmError();
		this._drawPolygon();
		this._drawPoints();
	}

	private _confirmError() {
		if (this._parent === null) {
			throw new Error("线图元必须绘制在容器中");
		}
	}
}

export type { EditPolylineProps };
export { EditPolyline as default };
