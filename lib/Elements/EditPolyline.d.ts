import * as d3 from "d3";
interface EditPolylineProps {
    map: SVGGElement;
    container: d3.Selection<any, unknown, null, undefined>;
    projection: d3.GeoProjection;
}
declare class EditPolyline {
    private _map;
    private _data;
    private _parent;
    private _path;
    private _projection;
    constructor(options: EditPolylineProps);
    addData(data: [number, number]): void;
    printCoordinates(): [number, number][];
    private _drawPolygon;
    private _drawPoints;
    private _draw;
    private _confirmError;
}
export type { EditPolylineProps };
export { EditPolyline as default };
