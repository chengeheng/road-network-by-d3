'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('./_virtual/_tslib.js');
var d3 = require('d3');
var config = require('./constants/config.js');
var EditPolygon = require('./Elements/EditPolygon.js');
var EditPolyline = require('./Elements/EditPolyline.js');

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

var defaultOptions = {
    center: [118.39067530252157, 31.343146080447582],
    onClick: function () { },
    level: 2,
};
var Map = /** @class */ (function () {
    function Map(id, options) {
        if (options === void 0) { options = defaultOptions; }
        var _this = this;
        // 初始化值
        this.id = id;
        this.width = 0;
        this.height = 0;
        this._layers = [];
        this._level = options.level === undefined ? 2 : options.level;
        this._lastLevel = this._level;
        this.projection = d3__namespace.geoMercator();
        var container = document.getElementById(this.id);
        if (container === null) {
            throw Error("地图容器的id不能为空");
        }
        else {
            this._container = container;
            var option = _tslib.__assign(_tslib.__assign({}, defaultOptions), options);
            this.options = option;
            var rect = container.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.projection = d3__namespace
                .geoMercator()
                .scale(36292043.780950055)
                .center(option.center)
                .translate([rect.width / 2, rect.height / 2]);
            this._init();
            var resizeObserver = new ResizeObserver(function (e) {
                var rect = _this._container.getBoundingClientRect();
                _this.width = rect.width;
                _this.height = rect.height;
                _this._svg.attr("width", rect.width).attr("height", rect.height);
            });
            resizeObserver.observe(this._container);
        }
    }
    //  初始化地图
    Map.prototype._init = function () {
        var _this = this;
        var container = d3__namespace.select(this._container);
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
        this._layerContainer = this._mapContainer.append("g").attr("id", "layers").node();
        this._toolContainer = this._mapContainer
            .append("g")
            .attr("id", "tools")
            .style("pointer-events", "none")
            .node();
        // 添加缩放事件
        this._zoom = d3__namespace
            .zoom()
            .scaleExtent([config.zooms[17], config.zooms[0]])
            .wheelDelta(function (event) {
            _this._lastLevel = _this._level;
            if (event.deltaY < 0) {
                if (_this._level === 1)
                    return Math.log2(1);
                _this._level--;
                return Math.log2(config.zooms[_this._level - 1] / config.zooms[_this._level]);
            }
            else {
                if (_this._level === 18)
                    return Math.log2(1);
                _this._level++;
                return Math.log2(config.zooms[_this._level - 1] / config.zooms[_this._level - 2]);
            }
        })
            .on("zoom", function (e) {
            var _a;
            _this._mapContainer.attr("transform", e.transform);
            if (((_a = e === null || e === void 0 ? void 0 : e.sourceEvent) === null || _a === void 0 ? void 0 : _a.type) === "wheel") {
                _this._updateMapConfig();
            }
        });
        this._zoom.scaleBy(this._svg, config.zooms[this._level - 1]);
        this._svg.transition().duration(1000);
        this._zoom.duration(1000);
        this._svg.call(this._zoom);
        this._addClickFn();
    };
    Map.prototype._updateMapConfig = function () {
        var config = {
            level: this._level,
        };
        this._layers.forEach(function (i) { return i.updateMapConfig(config); });
    };
    Map.prototype._addClickFn = function () {
        var _this = this;
        this._svg
            .on("click", function (e) {
            var projection = _this.projection;
            // console.log(d3.pointer(e, g.node()));
            if (_this.options.onClick) {
                _this.options.onClick(e, projection.invert(d3__namespace.pointer(e, _this._mapContainer.node())));
            }
        })
            .on("dblclick.zoom", null);
    };
    Map.prototype._removeClickFn = function () {
        this._svg.on("click", null);
    };
    /**
     * 添加图层
     * @param layer 图层实例
     */
    Map.prototype.addLayer = function (layer) {
        this._layers.push(layer);
        layer.init(this._layerContainer, this.projection, { level: this._level });
    };
    /**
     * 删除图层
     * @param layer 图层实例
     */
    Map.prototype.removeLayer = function (layer) {
        for (var i = 0; i < this._layers.length; i++) {
            if (this._layers[i] === layer) {
                this._layers.splice(i, 1);
            }
        }
        layer.remove();
    };
    /**
     * 显示指定的或所有隐藏的图层
     * @param layer 图层
     */
    Map.prototype.showLayer = function (layer) {
        if (layer === undefined) {
            this._layers.forEach(function (i) { return i.show(); });
        }
        else {
            layer.show();
        }
    };
    /**
     * 隐藏指定的或所有图层
     * @param layer 图层
     */
    Map.prototype.hideLayer = function (layer) {
        if (layer === undefined) {
            this._layers.forEach(function (i) { return i.hide(); });
        }
        else {
            layer.show();
        }
    };
    /**
     * 移动到指定点位
     * @param coord 点位bd09坐标
     * @param zoomLevel 地图缩放层级[1-20]
     */
    Map.prototype.moveTo = function (coord, zoomLevel) {
        if (zoomLevel !== undefined) {
            this._lastLevel = this._level;
            if (zoomLevel < 1) {
                this._level = 1;
            }
            else if (zoomLevel > 18) {
                this._level = 18;
            }
            else {
                this._level = Math.floor(zoomLevel);
            }
            if (this._lastLevel !== this._level) {
                this._updateMapConfig();
            }
        }
        var realCoord = this.projection(coord);
        var t = d3__namespace.zoomIdentity.scale(config.zooms[this._level - 1]).apply(realCoord);
        var m = d3__namespace.zoomIdentity
            .translate(-(t[0] - this.width / 2), -(t[1] - this.height / 2))
            .scale(config.zooms[this._level - 1]);
        this._svg.transition().duration(1000).call(this._zoom.transform, m);
    };
    /**
     * 移动到某个区域的最佳视图
     * @param coords 坐标数组
     * @returns
     */
    Map.prototype.focusOnView = function (coords) {
        var _a, _b;
        var projectionCoords = coords.map(this.projection);
        if (projectionCoords.length === 0) {
            return;
        }
        var min = [];
        var max = [];
        _a = d3__namespace.extent(projectionCoords, function (d) { return d[0]; }), min[0] = _a[0], max[0] = _a[1];
        _b = d3__namespace.extent(projectionCoords, function (d) { return d[1]; }), min[1] = _b[0], max[1] = _b[1];
        var xScale = (max[0] - min[0]) / this.width;
        var yScale = (max[1] - min[1]) / this.height;
        var middle = this.projection.invert([
            (max[0] + min[0]) / 2,
            (max[1] + min[1]) / 2,
        ]);
        var scale = Math.max(xScale, yScale) === 0 ? 5 : 1 / Math.max(xScale, yScale);
        var diffs = config.zooms.map(function (i) { return Math.abs(scale - i); });
        var minDiff = Math.min.apply(Math, diffs);
        var index = diffs.indexOf(minDiff);
        if (index < 17) {
            this.moveTo(middle, index + 2);
        }
        else {
            this.moveTo(middle, index + 1);
        }
    };
    /**
     * 设定地图缩放等级
     * @param {number} level 地图缩放等级
     */
    Map.prototype.setLevel = function (level) {
        this._lastLevel = this._level;
        if (level >= 18) {
            this._level = 18;
        }
        else if (level <= 1) {
            this._level = 1;
        }
        else {
            this._level = Math.floor(level);
        }
        this._zoom.scaleBy(this._svg.transition().duration(500), config.zooms[this._level - 1] / config.zooms[this._lastLevel - 1]);
    };
    // 添加绘制面的工具
    Map.prototype.paintPolygon = function () {
        var _this = this;
        d3__namespace.select(this._layerContainer).style("pointer-events", "none");
        d3__namespace.select(this._toolContainer).style("pointer-events", "inherit");
        this._removeClickFn();
        return new Promise(function (resolve, reject) {
            var polygon = new EditPolygon["default"]({
                container: d3__namespace.select(_this._toolContainer),
                projection: _this.projection,
                map: _this._toolContainer,
            });
            _this._svg
                .on("click", function (e) {
                polygon.addData(_this.projection.invert(d3__namespace.pointer(e, _this._mapContainer.node())));
            })
                .on("contextmenu", function () {
                resolve(polygon.printCoordinates());
            });
        }).finally(function () {
            d3__namespace.select(_this._layerContainer).style("pointer-events", "inherit");
            d3__namespace.select(_this._toolContainer).style("pointer-event", "none");
            _this._addClickFn();
        });
    };
    // 添加绘制线的工具
    Map.prototype.paintPolyline = function () {
        var _this = this;
        d3__namespace.select(this._layerContainer).style("pointer-events", "none");
        d3__namespace.select(this._toolContainer).style("pointer-events", "inherit");
        this._removeClickFn();
        return new Promise(function (resolve, reject) {
            var polygon = new EditPolyline["default"]({
                container: d3__namespace.select(_this._toolContainer),
                projection: _this.projection,
                map: _this._toolContainer,
            });
            _this._svg
                .on("click", function (e) {
                polygon.addData(_this.projection.invert(d3__namespace.pointer(e, _this._mapContainer.node())));
            })
                .on("contextmenu", function () {
                resolve(polygon.printCoordinates());
            });
        }).finally(function () {
            d3__namespace.select(_this._layerContainer).style("pointer-events", "inherit");
            d3__namespace.select(_this._toolContainer).style("pointer-event", "none");
            _this._addClickFn();
        });
    };
    return Map;
}());

exports["default"] = Map;
