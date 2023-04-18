'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../_virtual/_tslib.js');
var d3 = require('d3');
var Layer = require('./Layer.js');
require('./LabelLayer.js');
require('./PointLayer.js');
require('./PolygonLayer.js');
var lodash = require('lodash');
var config = require('../constants/config.js');

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

exports.StrokeLineType = void 0;
(function (StrokeLineType) {
    StrokeLineType["dotted"] = "dotted";
    StrokeLineType["solid"] = "solid";
})(exports.StrokeLineType || (exports.StrokeLineType = {}));
var defaultOption = {
    style: {
        strokeColor: "#333333",
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeType: exports.StrokeLineType.solid,
        strokeDashArray: [2, 3],
    },
    shrink: true,
    selectable: false,
    stopPropagation: false,
    onClick: function () { },
    onRightClick: function () { },
    onDbClick: function () { },
    onHover: function () { },
    onLeave: function () { },
    selectType: "link",
};
var PolyLineLayer = /** @class */ (function (_super) {
    _tslib.__extends(PolyLineLayer, _super);
    function PolyLineLayer(dataSource, option) {
        var _this = _super.call(this, Layer.LayerType.PolygonLayer, option) || this;
        _this.data = dataSource;
        _this.option = _this._combineOption(option);
        _this._clickCount = 0;
        _this._selectIndex = new Map();
        _this._selectType = _this.option.selectType;
        _this._allIndex = new Map();
        _this._hoverIndex = new Map();
        _this.length = dataSource.length;
        _this._hover = false;
        _this._shrink = _this.option.shrink === undefined ? true : _this.option.shrink;
        return _this;
    }
    PolyLineLayer.prototype._combineOption = function (option) {
        if (option === void 0) { option = defaultOption; }
        var _a = option.style, style = _a === void 0 ? {} : _a, _b = option.hoverStyle, hoverStyle = _b === void 0 ? {} : _b, _c = option.selectStyle, selectStyle = _c === void 0 ? {} : _c, rest = _tslib.__rest(option, ["style", "hoverStyle", "selectStyle"]);
        var defaultStyle = _tslib.__assign(_tslib.__assign({}, defaultOption.style), style);
        return _tslib.__assign(_tslib.__assign(_tslib.__assign({}, defaultOption), rest), { style: _tslib.__assign({}, defaultStyle), hoverStyle: _tslib.__assign(_tslib.__assign({}, defaultStyle), hoverStyle), selectStyle: _tslib.__assign(_tslib.__assign({}, defaultStyle), selectStyle), hasHover: !!hoverStyle.strokeColor });
    };
    PolyLineLayer.prototype._draw = function () {
        var _this = this;
        return this._baseLayer
            .selectAll("path")
            .data(this._formatData(this.data, function (e, outerIndex, innerIndex) {
            var _a;
            if (_this._allIndex.has(outerIndex)) {
                (_a = _this._allIndex.get(outerIndex)) === null || _a === void 0 ? void 0 : _a.add(innerIndex);
            }
            else {
                _this._allIndex.set(outerIndex, new Set([innerIndex]));
            }
            return true;
        }))
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (d) { var _a; return (_a = d.properties.option.style) === null || _a === void 0 ? void 0 : _a.strokeColor; })
            .attr("stroke-width", function (d) { var _a; return (_a = d.properties.option.style) === null || _a === void 0 ? void 0 : _a.strokeWidth; })
            .attr("stroke-dasharray", function (d) {
            if (d.properties.option.style.strokeType === exports.StrokeLineType.dotted) {
                return d.properties.option.style.strokeDashArray;
            }
            else {
                return null;
            }
        })
            .attr("fill", "none")
            .on("click", function (e, d) {
            if (d.properties.option.stopPropagation) {
                e.stopPropagation();
            }
            _this._clickCount++;
            var _a = _this._formatReturnedData(e, d), data = _a[0], index = _a[1];
            clearTimeout(_this._clickTimer);
            _this._clickTimer = setTimeout(function () {
                if (_this._clickCount % 2 === 1) {
                    _this._clickCount--;
                    var selectable = d.properties.option.selectable;
                    if (selectable) {
                        _this._selectIndex = _this.combineIndex(_this._selectIndex, d.properties.index, index);
                        _this._drawSelectLayer();
                    }
                    d.properties.option.onClick(data);
                }
                else {
                    _this._clickCount = 0;
                    d.properties.option.onDbClick(data);
                }
            }, 300);
        })
            .on("mousemove", function (e, d) {
            _this._hover = true;
            var hasHover = d.properties.option.hasHover;
            if (hasHover) {
                var _a = _this._formatReturnedData(e, d), data = _a[0], index = _a[1];
                _this._hoverIndex = _this.combineIndex(new Map(), d.properties.index, index);
                if (index > -1) {
                    _this._drawHoverLayer();
                    d.properties.option.onHover(data);
                }
            }
        })
            .on("mouseleave", function (e, d) {
            _this._hover = false;
            _this._hoverLayer.selectAll("*").remove();
            if (d.properties.option.onLeave) {
                var data = _this._formatReturnedData(e, d)[0];
                d.properties.option.onLeave(data);
            }
        })
            .on("contextmenu", function (e, d) {
            var data = _this._formatReturnedData(e, d)[0];
            d.properties.option.onRightClick(data);
        });
    };
    PolyLineLayer.prototype._formatReturnedData = function (e, d) {
        var _a;
        var index = -1;
        var startIndex = -1;
        var endIndex = -1;
        var coordinates = d.geometry.coordinates;
        var lineWidth = d.properties.option.style.strokeWidth;
        var targetCoord = d3__namespace.pointer(e, this.container.node());
        for (var i = 0; i < coordinates.length; i++) {
            var _b = this._isPointInLine(coordinates[i], targetCoord, this.projection, lineWidth), inPoint = _b[0], start = _b[1], end = _b[2];
            if (inPoint) {
                index = i;
                startIndex = start;
                endIndex = end;
                break;
            }
        }
        var originalParams;
        if (this._selectType === "all") {
            originalParams = this.data;
        }
        else if (this._selectType === "path") {
            originalParams = d.properties.originData;
        }
        else {
            originalParams = (_a = d.properties.originData) === null || _a === void 0 ? void 0 : _a.data[index];
        }
        return [
            {
                data: originalParams,
                PointerEvent: e,
                target: {
                    index: index,
                    data: originalParams,
                    selected: this._selectIndex.get(d.properties.index)
                        ? this._selectIndex.get(d.properties.index).has(index)
                        : false,
                    startIndex: startIndex,
                    endIndex: endIndex,
                    coordinate: targetCoord,
                },
                originData: d.properties.originData,
            },
            index,
        ];
    };
    PolyLineLayer.prototype._drawSelectLayer = function () {
        var _this = this;
        this._selectLayer.selectAll("*").remove();
        var pathData = this._formatData(this.data, function (e, idx, index) {
            if (!_this._selectIndex.get(idx)) {
                return false;
            }
            else {
                return _this._selectIndex.get(idx).has(index);
            }
        });
        this._selectLayer
            .selectAll("path")
            .data(pathData)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (l) { return l.properties.option.selectStyle.strokeColor; })
            .attr("stroke-width", function (l) { return l.properties.option.selectStyle.strokeWidth; })
            .attr("fill", "none")
            .attr("stroke-dasharray", function (l) {
            if (l.properties.option.selectStyle.strokeType === exports.StrokeLineType.dotted) {
                return l.properties.option.selectStyle.strokeDashArray;
            }
            else {
                return null;
            }
        });
    };
    PolyLineLayer.prototype._drawHoverLayer = function () {
        var _this = this;
        this._hoverLayer.selectAll("*").remove();
        var pathData = this._formatData(this.data, function (e, idx, index) {
            if (!_this._hoverIndex.get(idx)) {
                return false;
            }
            else {
                return _this._hoverIndex.get(idx).has(index);
            }
        });
        this._hoverLayer
            .selectAll("path")
            .data(pathData)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (l) { return l.properties.option.hoverStyle.strokeColor; })
            .attr("stroke-width", function (l) { return l.properties.option.hoverStyle.strokeWidth; })
            .attr("fill", "none")
            .attr("stroke-dasharray", function (l) {
            if (l.properties.option.hoverStyle.strokeType === exports.StrokeLineType.dotted) {
                return l.properties.option.hoverStyle.strokeDashArray;
            }
            else {
                return null;
            }
        });
    };
    PolyLineLayer.prototype._formatData = function (data, dataFilter) {
        var _this = this;
        return data.reduce(function (pre, cur, idx) {
            var _a = cur.data, data = _a === void 0 ? [] : _a, option = cur.option;
            var ids = [];
            var coordinates = [];
            data.forEach(function (j, innerIndex) {
                if (dataFilter) {
                    if (!dataFilter(j, idx, innerIndex)) {
                        return;
                    }
                }
                ids.push(j.id);
                coordinates.push(j.coordinates);
            });
            var _b = option || {}, _c = _b.style, style = _c === void 0 ? {} : _c, _d = _b.hoverStyle, hoverStyle = _d === void 0 ? {} : _d, _e = _b.selectStyle, selectStyle = _e === void 0 ? {} : _e;
            var onHover = (option === null || option === void 0 ? void 0 : option.onHover) || _this.option.onHover;
            var strokeWidth = style.strokeWidth || _this.option.style.strokeWidth;
            var hoverStrokeWidth = hoverStyle.strokeWidth || style.strokeWidth || _this.option.hoverStyle.strokeWidth;
            var selectStrokeWidth = selectStyle.strokeWidth || style.strokeWidth || _this.option.selectStyle.strokeWidth;
            if (_this._shrink === false) {
                var scale = 1 / config.zooms[_this._mapConfig.level - 1];
                strokeWidth = strokeWidth * scale;
                hoverStrokeWidth = hoverStrokeWidth * scale;
                selectStrokeWidth = selectStrokeWidth * scale;
            }
            pre.push({
                type: "Feature",
                geometry: {
                    type: "MultiLineString",
                    coordinates: coordinates,
                },
                properties: {
                    option: _tslib.__assign(_tslib.__assign(_tslib.__assign({}, _this.option), option), { style: _tslib.__assign(_tslib.__assign(_tslib.__assign({}, _this.option.style), style), { strokeWidth: strokeWidth }), hoverStyle: _tslib.__assign(_tslib.__assign(_tslib.__assign(_tslib.__assign({}, _this.option.hoverStyle), style), hoverStyle), { strokeWidth: hoverStrokeWidth }), selectStyle: _tslib.__assign(_tslib.__assign(_tslib.__assign(_tslib.__assign({}, _this.option.selectStyle), style), selectStyle), { strokeWidth: selectStrokeWidth }), hasHover: !!(hoverStyle === null || hoverStyle === void 0 ? void 0 : hoverStyle.strokeColor) || _this.option.hasHover, onHover: lodash.debounce(function () {
                            var e = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                e[_i] = arguments[_i];
                            }
                            if (_this._hover) {
                                onHover.apply(void 0, e);
                            }
                        }, 500) }),
                    ids: ids,
                    originData: cur,
                    index: idx,
                },
            });
            return pre;
        }, []);
    };
    PolyLineLayer.prototype.combineIndex = function (idxs, index, // 外部index，pathIndex
    idx // 内部index，linkIndex
    ) {
        var _a, _b;
        switch (this._selectType) {
            case "all": {
                if (idxs.size === this.length) {
                    idxs = new Map();
                }
                else {
                    idxs = this._allIndex;
                }
                return idxs;
            }
            case "path": {
                if (idxs.has(index)) {
                    idxs.delete(index);
                }
                else {
                    idxs.set(index, new Set(this._allIndex.get(index)));
                }
                return idxs;
            }
            case "link": {
                if (idxs.has(index)) {
                    var temp = idxs.get(index);
                    if (temp.has(idx)) {
                        temp.delete(idx);
                        if (temp.size <= 0) {
                            idxs.delete(index);
                        }
                    }
                    else {
                        (_a = idxs.get(index)) === null || _a === void 0 ? void 0 : _a.add(idx);
                    }
                }
                else {
                    idxs.set(index, new Set([idx]));
                }
                return idxs;
            }
            default: {
                if (idxs.has(index)) {
                    var temp = idxs.get(index);
                    if (temp.has(idx)) {
                        temp.delete(idx);
                        if (temp.size <= 0) {
                            idxs.delete(index);
                        }
                    }
                    else {
                        (_b = idxs.get(index)) === null || _b === void 0 ? void 0 : _b.add(idx);
                    }
                }
                else {
                    idxs.set(index, new Set([idx]));
                }
                return idxs;
            }
        }
    };
    PolyLineLayer.prototype._insideInStandardRect = function (_a, _b, _c) {
        var x1 = _a[0], y1 = _a[1];
        var x2 = _b[0], y2 = _b[1];
        var x = _c[0], y = _c[1];
        if (y < y1 || y > y2)
            return false;
        if (x1 < x2) {
            if (x < x1 || x > x2)
                return false;
        }
        else {
            if (x > x1 || x < x2)
                return false;
        }
        return true;
    };
    PolyLineLayer.prototype._insideInRect = function (_a, _b, _c, height) {
        var x1 = _a[0], y1 = _a[1];
        var x2 = _b[0], y2 = _b[1];
        var x = _c[0], y = _c[1];
        if (y1 === y2) {
            return this._insideInStandardRect([x1, y1 - height], [x2, y1 + height], [x, y]);
        }
        var l = y2 - y1;
        var r = x2 - x1;
        var s = Math.sqrt(l * l + r * r);
        var sin = l / s;
        var cos = r / s;
        var x1r = x1 * cos + y1 * sin;
        var y1r = y1 * cos - x1 * sin;
        var x2r = x2 * cos + y2 * sin;
        var y2r = y2 * cos - x2 * sin;
        var xr = x * cos + y * sin;
        var yr = y * cos - x * sin;
        return this._insideInStandardRect([x1r, y1r - height], [x2r, y2r + height], [xr, yr]);
    };
    PolyLineLayer.prototype._isPointInLine = function (coordinates, point, projection, lineWidth) {
        if (coordinates.length <= 1)
            return [false, -1, -1];
        var lineArr = coordinates.map(projection);
        for (var i = 1; i < lineArr.length; i++) {
            if (this._insideInRect(lineArr[i], lineArr[i - 1], point, lineWidth / 2)) {
                return [true, i - 1, i];
            }
        }
        return [false, -1, -1];
    };
    PolyLineLayer.prototype.init = function (g, projection, option) {
        _super.prototype.init.call(this, g, projection, option);
        this._mapConfig = option;
        this.path = d3__namespace.geoPath().projection(projection);
        this.container = d3__namespace.select(g).append("g").attr("id", "polyline-layer-".concat(this.makeRandomId()));
        this.container.selectAll("g").remove();
        this._baseLayer = this.container.append("g");
        this._selectLayer = this.container.append("g").style("pointer-events", "none");
        this._hoverLayer = this.container.append("g").style("pointer-events", "none");
        this._draw();
    };
    PolyLineLayer.prototype.remove = function () {
        this.container.remove();
    };
    /**
     * 显示当前图层
     */
    PolyLineLayer.prototype.show = function () {
        this.container.style("display", "inline");
    };
    /**
     * 隐藏当前图层
     */
    PolyLineLayer.prototype.hide = function () {
        this.container.style("display", "none");
    };
    PolyLineLayer.prototype.enableLayerFunc = function () {
        this.container.style("pointer-events", "inherit");
    };
    PolyLineLayer.prototype.disableLayerFunc = function () {
        this.container.style("pointer-events", "none");
    };
    PolyLineLayer.prototype.updateData = function (data) {
        this.data = data;
        this._selectIndex = new Map();
        this._baseLayer.selectAll("path").remove();
        this._selectLayer.selectAll("path").remove();
        this._hoverLayer.selectAll("path").remove();
        this._draw();
    };
    PolyLineLayer.prototype.setSelectType = function (type) {
        this._selectType = type;
    };
    PolyLineLayer.prototype.updateMapConfig = function (config) {
        this._mapConfig = config;
        if (this._shrink === false) {
            this._baseLayer.selectAll("path").remove();
            this._selectLayer.selectAll("path").remove();
            this._hoverLayer.selectAll("path").remove();
            this._draw();
            this._drawSelectLayer();
            this._drawHoverLayer();
        }
    };
    return PolyLineLayer;
}(Layer["default"]));

exports["default"] = PolyLineLayer;
