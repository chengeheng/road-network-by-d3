enum LayerType {
  PointLayer,
  PolygonLayer,
  PolyLineLayer,
}

interface LayerOption {}

const defaultOption: LayerOption = {};

class Layer {
  type: LayerType;
  sum: number;

  constructor(type: LayerType, options = defaultOption) {
    this.type = type;
    this.sum = 0;
  }

  updateSum() {
    this.sum++;
  }
}

export type { LayerOption };
export { Layer as default, LayerType };
