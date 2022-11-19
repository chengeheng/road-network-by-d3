const isPointInArea = (point, areas) => {
  const num = areas.length - 1;
  let flag = false;
  for (let i = 0, j = num - 1; i < num; j = i++) {
    const isMiddle =
      (areas[i][1] > point[1] && areas[j][1] <= point[1]) ||
      (areas[i][1] <= point[1] && areas[j][1] > point[1]);
    if (
      isMiddle &&
      point[0] <
        ((areas[j][0] - areas[i][0]) * (point[1] - areas[i][1])) /
          (areas[j][1] - areas[i][1]) +
          areas[i][0]
    ) {
      flag = !flag;
    }
  }
  return flag;
};

export { isPointInArea };
