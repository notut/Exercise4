import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import { BackgroundLayerSelect } from "../layer/backgroundLayerSelect";

useGeographic();
const map = new Map({});
export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<TileLayer[]>([
    new TileLayer({ source: new OSM() }),
  ]);
  const [view, setView] = useState(
    new View({ center: [10.8, 59.9], zoom: 10 }),
  );

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);
  useEffect(() => {
    map.setLayers(layers);
  }, [layers]);
  useEffect(() => {
    map.setView(view);
  }, [view]);

  return (
    <>
      <header>
        <h1>My application</h1>
      </header>
      <nav>
        <BackgroundLayerSelect setLayers={setLayers} setView={setView} />
      </nav>
      <main>
        <div ref={mapRef}></div>
      </main>
    </>
  );
}
