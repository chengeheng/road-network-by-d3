import * as d3 from "d3";
import Layer from "./Layer";

interface MapOptionProps {
  center: [number, number];
  onClick: Function;
}

const defaultOptions: MapOptionProps = {
  center: [118.39067530252157, 31.343146080447582],
  onClick: () => {},
};

class Map {
  private id: string;
  private container: HTMLElement;
  private map: SVGSVGElement | null;
  private width: number;
  private height: number;

  private layers: Layer[];
  private onClick: Function;

  projection: d3.GeoProjection;

  constructor(id: string, options = defaultOptions) {
    // 初始化值
    this.id = id;
    this.map = null;
    this.width = 0;
    this.height = 0;
    this.layers = [];
    this.projection = d3.geoMercator();

    const container = document.getElementById(this.id);
    if (container === null) {
      throw Error("地图容器的id不能为空");
    } else {
      const { center, onClick } = options;
      this.container = container;
      this.onClick = onClick;

      const rect = container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.projection = d3
        .geoMercator()
        .scale(20000000)
        .center(center)
        .translate([rect.width / 2, rect.height / 2]);

      this.init();
    }
  }
  //  初始化地图
  private init() {
    const container = d3.select(this.container);
    container.select("svg").remove();
    const svg = container
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    this.map = svg.node();
    // 添加缩放事件
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1 / 5, 5])
      .on("zoom", (e) => {
        svg.attr("transform", e.transform);
      });
    zoom.scaleBy(svg, 1);
    svg
      .call(zoom)
      .on("click", (e) => {
        const projection = this.projection;
        this.onClick(e, projection.invert!(d3.pointer(e, svg.node())));
      })
      .on("dblclick.zoom", null);
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
  }
}

export default Map;
