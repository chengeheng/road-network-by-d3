import * as d3 from "d3";
interface EditPolygonProps {
    map: SVGGElement;
    container: d3.Selection<any, unknown, null, undefined>;
    projection: d3.GeoProjection;
}
declare class EditPolygon {
    private _map;
    private _data;
    private _parent;
    private _path;
    private _projection;
    constructor(options: EditPolygonProps);
    addData(data: [number, number]): void;
    printCoordinates(): [number, number][];
    private _drawPolygon;
    private _drawPoints;
    private _draw;
    private _confirmError;
}
export type { EditPolygonProps };
export { EditPolygon as default };
