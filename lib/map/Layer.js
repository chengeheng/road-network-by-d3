"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var d3 = require("d3");

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== "default") {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(
					n,
					k,
					d.get
						? d
						: {
								enumerable: true,
								get: function () {
									return e[k];
								},
						  }
				);
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/ _interopNamespace(d3);

exports.LayerType = void 0;
(function (LayerType) {
	LayerType[(LayerType["PointLayer"] = 0)] = "PointLayer";
	LayerType[(LayerType["PolygonLayer"] = 1)] = "PolygonLayer";
	LayerType[(LayerType["PolyLineLayer"] = 2)] = "PolyLineLayer";
})(exports.LayerType || (exports.LayerType = {}));
var Layer = /** @class */ (function () {
	function Layer(type, options) {
		this.type = type;
		this.projection = d3__namespace.geoMercator();
	}
	Layer.prototype.init = function (g, projection) {
		this.map = g;
		this.projection = projection;
	};
	Layer.prototype.remove = function () {};
	return Layer;
})();

exports["default"] = Layer;
