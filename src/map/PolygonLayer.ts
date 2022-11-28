import Layer, { LayerOption, LayerType } from "./Layer";

interface PolygonLayerOption extends LayerOption {
  strokeWidth?: number;
}

class PolygonLayer extends Layer {
  constructor(option?: PolygonLayerOption) {
    super(LayerType.PolygonLayer, option);
  }

  init() {}
}

export default PolygonLayer;
