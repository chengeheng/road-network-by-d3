"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var _tslib = require("../_virtual/_tslib.js");
var d3 = require("d3");
var point = require("../images/point.svg.js");
var Layer = require("./Layer.js");

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

var defaultOption = {
	icon: point["default"],
	width: 36,
	height: 36,
	offset: [-18, -36],
	stopPropagation: false,
	onClick: function () {},
	onRightClick: function () {},
	onDbClick: function () {},
};
var PointLayer = /** @class */ (function (_super) {
	_tslib.__extends(PointLayer, _super);
	function PointLayer(dataSource, option) {
		if (option === void 0) {
			option = defaultOption;
		}
		var _this = _super.call(this, Layer.LayerType.PointLayer, option) || this;
		_this.data = dataSource;
		_this.option = _tslib.__assign(_tslib.__assign({}, defaultOption), option);
		_this.clickCount = 0;
		return _this;
	}
	PointLayer.prototype.init = function (svg, projection) {
		_super.prototype.init.call(this, svg, projection);
		this.container = d3__namespace.select(svg).append("g");
		this.container.selectAll("g").remove();
		this.draw();
	};
	PointLayer.prototype.remove = function () {
		this.container.remove();
	};
	// TODO 显示当前图层
	PointLayer.prototype.show = function () {
		this.container.style("display", "inline");
	};
	// TODO 隐藏当前图层
	PointLayer.prototype.hide = function () {
		this.container.style("display", "none");
	};
	PointLayer.prototype.updateData = function (data) {
		this.data = data;
		this.draw();
	};
	PointLayer.prototype.draw = function () {
		var _this = this;
		var base = this.container;
		this.baseLayer = base.append("g");
		this.baseLayer
			.selectAll("image")
			.data(this.formatData(this.data))
			.enter()
			.append("image")
			.attr("xlink:href", function (d) {
				return d.icon;
			})
			.attr("x", function (d) {
				return d.coordinate[0];
			})
			.attr("y", function (d) {
				return d.coordinate[1];
			})
			.attr("width", function (d) {
				return d.option.width;
			})
			.attr("height", function (d) {
				return d.option.height;
			})
			.attr("transform", function (d) {
				return "translate(".concat(d.option.offset[0], ",").concat(d.option.offset[1], ")");
			})
			.on("click", function (e, d) {
				if (d.option.stopPropagation) {
					e.stopPropagation();
				}
				_this.clickCount++;
				var index = _this.data.findIndex(function (i) {
					return i.id === d.id;
				});
				clearTimeout(_this.clickTimer);
				_this.clickTimer = setTimeout(function () {
					if (_this.clickCount % 2 === 1) {
						_this.clickCount--;
						var clickFn = d.option.onClick;
						if (clickFn) {
							clickFn({
								data: d,
								PointerEvent: e,
								target: {
									index: index,
									data: d,
								},
							});
						}
					} else {
						_this.clickCount = 0;
						var dblClickFn = d.option.onDbClick;
						if (dblClickFn) {
							dblClickFn({
								data: d,
								PointerEvent: e,
								target: {
									index: index,
									data: d,
								},
							});
						}
					}
				}, 300);
			})
			.on("contextmenu", function (e, d) {
				if (d.option.stopPropagation) {
					e.stopPropagation();
				}
				var index = _this.data.findIndex(function (i) {
					return i.id === d.id;
				});
				var rightClickFn = d.option.onRightClick;
				if (rightClickFn) {
					rightClickFn({
						data: d,
						PointerEvent: e,
						target: {
							index: index,
							data: d,
						},
					});
				}
			});
	};
	PointLayer.prototype.formatData = function (data) {
		var _this = this;
		return data.map(function (i) {
			var _a;
			return _tslib.__assign(_tslib.__assign({}, i), {
				coordinate: _this.projection(i.coordinate),
				icon: (_a = i.icon) !== null && _a !== void 0 ? _a : _this.option.icon,
				option: _tslib.__assign(_tslib.__assign({}, _this.option), i.option),
			});
		});
	};
	return PointLayer;
})(Layer["default"]);

exports["default"] = PointLayer;
