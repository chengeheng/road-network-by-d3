'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../_virtual/_tslib.js');
var d3 = require('d3');
var point = require('../images/point.svg.js');
var Layer = require('./Layer.js');

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
    icon: point["default"],
    width: 36,
    height: 36,
    offset: [0, 0],
    rotate: 0,
    stopPropagation: false,
    onClick: function () { },
    onRightClick: function () { },
    onDbClick: function () { },
};
var PointLayer = /** @class */ (function (_super) {
    _tslib.__extends(PointLayer, _super);
    function PointLayer(dataSource, option) {
        if (option === void 0) { option = defaultOption; }
        var _this = _super.call(this, Layer.LayerType.PointLayer, option) || this;
        _this.data = dataSource;
        _this.option = _tslib.__assign(_tslib.__assign({}, defaultOption), option);
        _this.clickCount = 0;
        _this.isHided = false;
        _this.filterIds = [];
        return _this;
    }
    PointLayer.prototype.initState = function () {
        this.clickCount = 0;
        this.isHided = false;
        this.filterIds = [];
    };
    PointLayer.prototype.init = function (g, projection) {
        _super.prototype.init.call(this, g, projection);
        this.container = d3__namespace
            .select(g)
            .append("g")
            .attr("id", "point-layer-".concat(this.makeRandomId()));
        this.container.selectAll("g").remove();
        this.baseLayer = this.container.append("g");
        this.draw();
    };
    PointLayer.prototype.remove = function () {
        this.container.remove();
    };
    /**
     * 显示当前图层
     */
    PointLayer.prototype.show = function () {
        this.container.style("display", "inline");
    };
    /**
     * 隐藏当前图层
     */
    PointLayer.prototype.hide = function () {
        this.container.style("display", "none");
    };
    PointLayer.prototype.enableLayerFunc = function () {
        this.container.style("pointer-events", "inherit");
    };
    PointLayer.prototype.disableLayerFunc = function () {
        this.container.style("pointer-events", "none");
    };
    PointLayer.prototype.updateData = function (data) {
        this.data = data;
        // 初始化数据
        this.baseLayer.selectAll("*").remove();
        this.initState();
        this.container.style("display", "inline");
        // 绘制
        this.draw();
    };
    PointLayer.prototype.draw = function () {
        if (this.option.hoverColor) {
            this.drawWithHoverColor();
        }
        else {
            this.drawWithOutHoverColor();
        }
    };
    PointLayer.prototype.drawWithHoverColor = function () {
        var _this = this;
        var g = this.baseLayer
            .selectAll("g")
            .data(this.formatData(this.data))
            .enter()
            .append("g");
        var hoverColor = this.option.hoverColor;
        var filterMatrix = this.makeFilterMatrix(hoverColor);
        var id = this.makeRandomId();
        this.baseLayer
            .append("defs")
            .append("filter")
            .attr("id", id)
            .append("feColorMatrix")
            .attr("type", "matrix")
            .attr("values", filterMatrix);
        this.filterIds.push(id);
        g.append("image")
            .attr("xlink:href", function (d) { return d.icon; })
            .attr("x", function (d) { return d.imageLeftTop[0]; })
            .attr("y", function (d) { return d.imageLeftTop[1]; })
            .attr("width", function (d) { return d.option.width; })
            .attr("height", function (d) { return d.option.height; })
            .attr("transform", function (d) {
            return "rotate(".concat(d.option.rotate, ", ").concat(d.imageCenter[0], ", ").concat(d.imageCenter[1], ") translate(").concat(d.option.offset[0], ",").concat(d.option.offset[1], ")");
        })
            .on("click", function (e, d) {
            if (d.option.stopPropagation) {
                e.stopPropagation();
            }
            _this.clickCount++;
            var index = _this.data.findIndex(function (i) { return i.id === d.id; });
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
                }
                else {
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
        })
            .on("mouseover", function (e, d) {
            var image = d3__namespace.select(e.target);
            image.attr("filter", "url(#".concat(id, ")"));
        })
            .on("mouseout", function (e, d) {
            var image = d3__namespace.select(e.target);
            image.attr("filter", "none");
        });
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
            .attr("transform", function (d) { return "translate(".concat(0, ",").concat(d.option.offset[1] - d.option.height, ")"); })
            .style("text-anchor", "middle")
            .attr("font-size", 12)
            .text(function (d) { return d.name; });
    };
    PointLayer.prototype.drawWithOutHoverColor = function () {
        var _this = this;
        var g = this.baseLayer
            .selectAll("g")
            .data(this.formatData(this.data))
            .enter()
            .append("g");
        g.append("image")
            .attr("xlink:href", function (d) { return d.icon; })
            .attr("x", function (d) { return d.imageLeftTop[0]; })
            .attr("y", function (d) { return d.imageLeftTop[1]; })
            .attr("width", function (d) { return d.option.width; })
            .attr("height", function (d) { return d.option.height; })
            .attr("transform", function (d) {
            return "rotate(".concat(d.option.rotate, ", ").concat(d.imageCenter[0], ", ").concat(d.imageCenter[1], ") translate(").concat(d.option.offset[0], ",").concat(d.option.offset[1], ")");
        })
            .on("click", function (e, d) {
            if (d.option.stopPropagation) {
                e.stopPropagation();
            }
            _this.clickCount++;
            var index = _this.data.findIndex(function (i) { return i.id === d.id; });
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
                }
                else {
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
            .attr("transform", function (d) { return "translate(".concat(0, ",").concat(d.option.offset[1] - d.option.height, ")"); })
            .attr("font-size", 12)
            .text(function (d) { return d.name; });
    };
    PointLayer.prototype.formatData = function (data) {
        var _this = this;
        return data.map(function (i) {
            var _a, _b, _c;
            var option = _tslib.__assign(_tslib.__assign({}, _this.option), i.option);
            var coordinate = _this.projection(i.coordinate);
            var width = option.width;
            var height = option.height;
            var imageCenter = [
                coordinate[0],
                coordinate[1] - height / 2,
            ];
            var imageLeftTop = [
                coordinate[0] - width / 2,
                coordinate[1] - height,
            ];
            return _tslib.__assign(_tslib.__assign({}, i), { coordinate: coordinate, icon: (_c = (_a = i.icon) !== null && _a !== void 0 ? _a : (_b = i.option) === null || _b === void 0 ? void 0 : _b.icon) !== null && _c !== void 0 ? _c : _this.option.icon, option: option, imageCenter: imageCenter, imageLeftTop: imageLeftTop });
        });
    };
    PointLayer.prototype.makeFilterMatrix = function (color) {
        var _a = this.hexToRgb(color), r = _a[0], g = _a[1], b = _a[2];
        return "\n\t\t0 0 0 0 ".concat(r / 255, " \n\t\t0 0 0 0 ").concat(g / 255, " \n\t\t0 0 0 0 ").concat(b / 255, "  \n\t\t0 0 0 1 0\n\t");
    };
    PointLayer.prototype.hexToRgb = function (color) {
        // 16进制颜色值的正则
        var reg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/;
        var testColor = color.toLowerCase();
        if (reg.test(testColor)) {
            var newColor = void 0;
            if (testColor.length === 4) {
                newColor = "#";
                for (var i = 1; i < 4; i++) {
                    newColor += testColor
                        .slice(i, i + 1)
                        .concat(testColor.slice(i, i + 1));
                }
            }
            else {
                newColor = testColor;
            }
            var colorChange = [];
            for (var i = 1; i < 7; i += 2) {
                colorChange.push(parseInt("0x" + newColor.slice(i, i + 2)));
            }
            return colorChange;
        }
        else {
            throw new Error("输入的颜色值必须是合法的16进制颜色");
        }
    };
    return PointLayer;
}(Layer["default"]));

exports["default"] = PointLayer;
