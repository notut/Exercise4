import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import "./Application.css";
//import { BackgroundLayerSelect } from "../layer/backgroundLayerSelect";

useGeographic();
export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    name: string;
    coordinates: number[];
  } | null>(null);

  useEffect(() => {
    /*const defaultPolygonStyle = new Style({
      fill: new Fill({ color: "rgba(245,33,233,0.3)" }),
      stroke: new Stroke({ color: "#f85699", width: 2 }),
    });

    const hoverPolygonStyle = new Style({
      fill: new Fill({ color: "rgba(0,200,255,0.5)" }),
      stroke: new Stroke({ color: "#00BBFF", width: 3 }),
    });*/

    const getPointStyle = (brannstasjoner: number, isHovered = false) =>
      new Style({
        image: new Icon({
          anchor: [0.2, 0.5],
          src: getIconSrc(brannstasjoner),
          scale: isHovered ? 0.1 : 0.05,
        }),
      });
    const getIconSrc = (brannstasjoner: number) => {
      if (brannstasjoner) return "/icons/brann.png";
      return "/icons/brann.png";
    };

    const BrannSource = new VectorSource({
      url: "/geojson/Brannstasjoner.json",
      format: new GeoJSON(),
    });

    const BrannLayer = new VectorLayer({
      source: BrannSource,
      style: (feature) => {
        const brannstasjoner = (feature.get("brannstasjoner") as number) || 0;
        return getPointStyle(brannstasjoner);
      },
    });

    const popupOverlay = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });

    const map = new Map({
      target: mapRef.current!,
      view: new View({ center: [10.8, 59.9], zoom: 6 }),
      layers: [new TileLayer({ source: new OSM() }), BrannLayer],
      overlays: [popupOverlay],
    });

    map.on("pointermove", (event) => {
      const hoveredFeature = map.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat,
      );

      BrannLayer.getSource()
        ?.getFeatures()
        .forEach((feat) => {
          const isHovered = feat === hoveredFeature;
          const brannstasjoner = (feat.get("brannstasjoner") as number) || 0;
          feat.setStyle(getPointStyle(brannstasjoner, isHovered));
        });
    });

    map.on("singleclick", (event) => {
      let brannFeature: any = null;
      map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        if (layer === BrannLayer && feature?.get("name")) {
          brannFeature = feature;
        }
      });

      if (brannFeature) {
        const name = brannFeature.get("name") as string;
        const coordinates = brannFeature
          .getGeometry()
          ?.getCoordinates() as number[];
        setPopupInfo({ name, coordinates });
        popupOverlay.setPosition(coordinates);
      } else {
        setPopupInfo(null);
        popupOverlay.setPosition(undefined);
      }
    });
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <div
        ref={popupRef}
        className="popup"
        style={{ display: popupInfo ? "block" : "none" }}
      >
        {popupInfo && <div className="popup-content">{popupInfo.name}</div>}
      </div>
    </div>
  );
}
