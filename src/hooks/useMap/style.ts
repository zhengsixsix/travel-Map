import { watch } from "vue";
import { Fill, Style, Text, Stroke } from "~/ol-imports";

export function CreateLayerStyle(feature: any) {
  const text = new Text({
    text: feature.get("name_zh") || feature.get("name"),
    font: '14px "ZCOOL KuaiLe", "Nunito", sans-serif',
    fill: new Fill({ color: "#5D4037" }), // Brown text
    stroke: new Stroke({ color: "white", width: 3 }),
    offsetY: 0,
  });
  
  const fill = new Fill({
    color: '#FFF9C4', // Light yellow (youthful land color)
  });

  const stroke = new Stroke({
    color: feature.get("name") === "China" ? "rgba(255, 167, 38, 0.8)" : "rgba(255, 167, 38, 0.6)", // Orange stroke
    width: 2,
    lineDash: [5, 5], // Dashed line like a travel map
  });

  return [
    new Style({
      text,
      fill,
      stroke,
    }),
  ];
}
