import React from "react";

import PolygonLayer from "./PolygonLayer";

const Layer = (props) => {
  const { type = "Polygon", ...rest } = props;
  switch (type) {
    case "Polygon":
      return <PolygonLayer {...rest} />;
    default:
      return <></>;
  }
};

export default React.memo(Layer);
