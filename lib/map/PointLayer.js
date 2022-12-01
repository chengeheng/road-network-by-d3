var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as d3 from "d3";
import PointSvg from "../images/point.svg";
import Layer, { LayerType } from "./Layer";
var defaultOption = {
    icon: PointSvg,
    width: 36,
    height: 36,
    offset: [-18, -36],
    stopPropagation: false,
    onClick: function () { },
    onRightClick: function () { },
    onDbClick: function () { },
};
var PointLayer = /** @class */ (function (_super) {
    __extends(PointLayer, _super);
    function PointLayer(dataSource, option) {
        if (option === void 0) { option = defaultOption; }
        var _this = _super.call(this, LayerType.PointLayer, option) || this;
        _this.data = dataSource;
        _this.option = __assign(__assign({}, defaultOption), option);
        _this.clickCount = 0;
        return _this;
    }
    PointLayer.prototype.init = function (svg, projection) {
        _super.prototype.init.call(this, svg, projection);
        this.container = d3.select(svg).append("g");
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
            .attr("xlink:href", function (d) { return d.icon; })
            .attr("x", function (d) { return d.coordinate[0]; })
            .attr("y", function (d) { return d.coordinate[1]; })
            .attr("width", function (d) { return d.option.width; })
            .attr("height", function (d) { return d.option.height; })
            .attr("transform", function (d) { return "translate(".concat(d.option.offset[0], ",").concat(d.option.offset[1], ")"); })
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
    };
    PointLayer.prototype.formatData = function (data) {
        var _this = this;
        return data.map(function (i) {
            var _a;
            return __assign(__assign({}, i), { coordinate: _this.projection(i.coordinate), icon: (_a = i.icon) !== null && _a !== void 0 ? _a : _this.option.icon, option: __assign(__assign({}, _this.option), i.option) });
        });
    };
    return PointLayer;
}(Layer));
export default PointLayer;
