import { ALL_EXTENT } from "~/data/province";
import { GeoJSON, Map, SourceVector, Vector } from "~/ol-imports";
import { CreateAddLayerCache, LayerIndex } from ".";
import { CreateLayerStyle } from "../style";

export function SetupProvinceLayer(map: Map) {
  for (const key in ALL_EXTENT) {
    const layer = new Vector({
      source: new SourceVector({
        url: `/geojson/china/${key}.json`,
        format: new GeoJSON(),
      }),
    });
    CreateAddLayerCache(LayerIndex.Second, key, layer);
    layer.setStyle(CreateLayerStyle);
    if (!map.getLayers().getArray().includes(layer)) {
      map.addLayer(layer);
    }
  }
}
