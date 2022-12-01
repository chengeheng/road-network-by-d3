import * as d3 from "d3";
var LayerType;
(function (LayerType) {
    LayerType[LayerType["PointLayer"] = 0] = "PointLayer";
    LayerType[LayerType["PolygonLayer"] = 1] = "PolygonLayer";
    LayerType[LayerType["PolyLineLayer"] = 2] = "PolyLineLayer";
})(LayerType || (LayerType = {}));
var defaultOption = {};
var Layer = /** @class */ (function () {
    function Layer(type, options) {
        if (options === void 0) { options = defaultOption; }
        this.type = type;
        this.projection = d3.geoMercator();
    }
    Layer.prototype.init = function (g, projection) {
        this.map = g;
        this.projection = projection;
    };
    Layer.prototype.remove = function () { };
    return Layer;
}());
export { Layer as default, LayerType };
