'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('./_virtual/_tslib.js');
var d3 = require('d3');

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
};
var Map = /** @class */ (function () {
    function Map(id, options) {
        if (options === void 0) { options = defaultOptions; }
        var _this = this;
        // 初始化值
        this.id = id;
        this.width = 0;
        this.height = 0;
        this.layers = [];
        this.zoomLevel = 1;
        this.projection = d3__namespace.geoMercator();
        var container = document.getElementById(this.id);
        if (container === null) {
            throw Error("地图容器的id不能为空");
        }
        else {
            this.container = container;
            var option = _tslib.__assign(_tslib.__assign({}, defaultOptions), options);
            this.options = option;
            var rect = container.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.projection = d3__namespace
                .geoMercator()
                .scale(30000000)
                .center(option.center)
                .translate([rect.width / 2, rect.height / 2]);
            this.init();
            var resizeObserver = new ResizeObserver(function (e) {
                var rect = container.getBoundingClientRect();
                _this.width = rect.width;
                _this.height = rect.height;
                d3__namespace.select(_this.svg)
                    .attr("width", rect.width)
                    .attr("height", rect.height);
            });
            resizeObserver.observe(container);
        }
    }
    //  初始化地图
    Map.prototype.init = function () {
        var _this = this;
        var container = d3__namespace.select(this.container);
        container.select("svg").remove();
        var svg = container
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("cursor", "pointer");
        if (this.options.class) {
            svg.attr("class", this.options.class);
        }
        var g = svg.append("g");
        this.map = g.node();
        this.svg = svg.node();
        // 添加缩放事件
        var zoom = d3__namespace
            .zoom()
            .scaleExtent([1 / 10, 5])
            // .wheelDelta(event => {
            // 	if (event.deltaY < 0) {
            // 		if (this.zoomLevel === 5) return Math.log2(1);
            // 		this.zoomLevel = this.zoomLevel + 0.5;
            // 		return Math.log2(1 + 0.5 / (this.zoomLevel - 0.5));
            // 	} else {
            // 		if (this.zoomLevel === 0.5) return Math.log2(1);
            // 		this.zoomLevel = this.zoomLevel - 0.5;
            // 		return Math.log2(1 - 0.5 / (this.zoomLevel + 0.5));
            // 	}
            // })
            .on("zoom", function (e) {
            g.attr("transform", e.transform);
        });
        this.zoom = zoom;
        zoom.scaleBy(svg, this.zoomLevel);
        svg.transition().duration(1000);
        svg
            .call(zoom)
            .on("click", function (e) {
            var projection = _this.projection;
            // console.log(d3.pointer(e, g.node()));
            if (_this.options.onClick) {
                _this.options.onClick(e, projection.invert(d3__namespace.pointer(e, g.node())));
            }
        })
            .on("dblclick.zoom", null);
    };
    /**
     * 添加图层
     * @param layer 图层实例
     */
    Map.prototype.addLayer = function (layer) {
        this.layers.push(layer);
        layer.init(this.map, this.projection);
    };
    /**
     * 删除图层
     * @param layer 图层实例
     */
    Map.prototype.removeLayer = function (layer) {
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i] === layer) {
                this.layers.splice(i, 1);
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
            this.layers.forEach(function (i) { return i.show(); });
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
            this.layers.forEach(function (i) { return i.hide(); });
        }
        else {
            layer.show();
        }
    };
    /**
     * 移动到指定点位
     * @param coord 点位bd09坐标
     * @param zoomLevel 地图缩放层级
     */
    Map.prototype.moveTo = function (coord, zoomLevel) {
        if (zoomLevel === void 0) { zoomLevel = 5; }
        var svg = d3__namespace.select(this.svg);
        var realCoord = this.projection(coord);
        var t = d3__namespace.zoomIdentity.scale(zoomLevel).apply(realCoord);
        var m = d3__namespace.zoomIdentity
            .translate(-(t[0] - this.width / 2), -(t[1] - this.height / 2))
            .scale(zoomLevel);
        svg.transition().duration(1000).call(this.zoom.transform, m);
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
        if (scale < 1 / 2) {
            this.moveTo(middle, 0.5);
        }
        else if (scale > 5) {
            this.moveTo(middle, 5);
        }
        else {
            this.moveTo(middle, scale);
        }
    };
    return Map;
}());

exports["default"] = Map;
