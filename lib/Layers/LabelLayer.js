'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../_virtual/_tslib.js');
var d3 = require('d3');
var Layer = require('./Layer.js');
require('./PointLayer.js');
require('./PolygonLayer.js');
require('./PolyLineLayer.js');

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/_interopNamespace(d3);

var defaultOption = {
    style: {
        fontSize: 12,
        fontWeight: "normal",
        color: "#333333",
        strokeColor: "transparent",
        strokeWidth: 2,
    },
    rotate: 0,
    offset: [0, 0],
    stopPropagation: false,
    onClick: function () { },
    onRightClick: function () { },
    onDbClick: function () { },
};
var LabelLayer = /** @class */ (function (_super) {
    _tslib.__extends(LabelLayer, _super);
    function LabelLayer(dataSource, option) {
        var _this = _super.call(this, Layer.LayerType.PointLayer, option) || this;
        _this.data = dataSource;
        _this._option = _this._combineOption(option);
        _this._clickCount = 0;
        _this.isHided = false;
        return _this;
    }
    LabelLayer.prototype._combineOption = function (option) {
        if (option === void 0) { option = {}; }
        var _a = option.style, style = _a === void 0 ? {} : _a, rest = _tslib.__rest(option, ["style"]);
        return _tslib.__assign(_tslib.__assign(_tslib.__assign({}, defaultOption), rest), { style: _tslib.__assign(_tslib.__assign({}, defaultOption.style), style) });
    };
    LabelLayer.prototype._initState = function () {
        this._clickCount = 0;
        this.isHided = false;
    };
    LabelLayer.prototype._formatData = function (data) {
        var _this = this;
        return data.map(function (i) {
            var _a = (i.option || {}).style, style = _a === void 0 ? {} : _a;
            var option = _tslib.__assign(_tslib.__assign(_tslib.__assign({}, _this._option), i.option), { style: _tslib.__assign(_tslib.__assign({}, _this._option.style), style) });
            var coordinate = _this.projection(i.coordinate);
            return _tslib.__assign(_tslib.__assign({}, i), { coordinate: coordinate, option: option });
        });
    };
    LabelLayer.prototype.init = function (g, projection, option) {
        _super.prototype.init.call(this, g, projection, option);
        this.container = d3__namespace
            .select(g)
            .append("g")
            .attr("id", "point-layer-".concat(this.makeRandomId()));
        this.container.selectAll("g").remove();
        this._baseLayer = this.container.append("g");
        this._draw();
    };
    LabelLayer.prototype.remove = function () {
        this.container.remove();
    };
    /**
     * 显示当前图层
     */
    LabelLayer.prototype.show = function () {
        this.container.style("display", "inline");
    };
    /**
     * 隐藏当前图层
     */
    LabelLayer.prototype.hide = function () {
        this.container.style("display", "none");
    };
    LabelLayer.prototype.enableLayerFunc = function () {
        this.container.style("pointer-events", "inherit");
    };
    LabelLayer.prototype.disableLayerFunc = function () {
        this.container.style("pointer-events", "none");
    };
    LabelLayer.prototype.updateData = function (data) {
        this.data = data;
        // 初始化数据
        this._baseLayer.selectAll("*").remove();
        this._initState();
        this.container.style("display", "inline");
        // 绘制
        this._draw();
    };
    LabelLayer.prototype._draw = function () {
        var _this = this;
        var g = this._baseLayer
            .selectAll("g")
            .data(this._formatData(this.data))
            .enter()
            .append("g");
        g.filter(function (i) {
            if (i.name) {
                return true;
            }
            else {
                return false;
            }
        })
            .append("text")
            .attr("x", function (d) { return d.coordinate[0]; })
            .attr("y", function (d) { return d.coordinate[1]; })
            .style("text-anchor", "middle")
            .attr("transform", function (d) {
            return "rotate(".concat(d.option.rotate, ", ").concat(d.coordinate[0], ", ").concat(d.coordinate[1], ") translate(").concat(d.option.offset[0], ",").concat(d.option.offset[1], ")");
        })
            .attr("fill", function (d) { return d.option.style.color; })
            .attr("font-size", function (d) { return d.option.style.fontSize; })
            .attr("font-weight", function (d) { return d.option.style.fontWeight; })
            .attr("stroke", function (d) { return d.option.style.strokeColor; })
            .attr("stroke-width", function (d) { return d.option.style.strokeWidth; })
            .attr("paint-order", "stroke")
            .style("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text(function (d) { return d.name; })
            .on("click", function (e, d) {
            if (d.option.stopPropagation) {
                e.stopPropagation();
            }
            _this._clickCount++;
            var index = _this.data.findIndex(function (i) { return i.id === d.id; });
            clearTimeout(_this._clickTimer);
            _this._clickTimer = setTimeout(function () {
                if (_this._clickCount % 2 === 1) {
                    _this._clickCount--;
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
                }
                else {
                    _this._clickCount = 0;
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
            var index = _this.data.findIndex(function (i) { return i.id === d.id; });
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
    return LabelLayer;
}(Layer["default"]));

exports["default"] = LabelLayer;
