import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { useGeographic } from "ol/proj";
import { Style, Fill, Stroke, Icon } from "ol/style";
import Overlay from "ol/Overlay";

import "ol/ol.css";
import { BackgroundLayerSelect } from "../layer/backgroundLayerSelect";

useGeographic();

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupOverlayRef = useRef<Overlay | null>(null);

  const [baseLayer, _setBaseLayer] = useState<TileLayer>(
    new TileLayer({ source: new OSM() }),
  );
  const [additionalLayers, setAdditionalLayers] = useState<any[]>([]);
  const [showSchools, setShowSchools] = useState(true);
  const [view, setView] = useState(
    new View({ center: [10.8, 59.9], zoom: 10 }),
  );

  const map = useRef(new Map()).current;
  const FylkerLayerRef = useRef<VectorLayer | null>(null);
  const VgsLayerRef = useRef<VectorLayer | null>(null);
  const baseLayerRef = useRef<TileLayer>(baseLayer);
  const setBaseLayer = (layer: TileLayer) => {
    baseLayerRef.current = layer;
    map.setLayers([layer, ...additionalLayers]);
    _setBaseLayer(layer);
  };
  const [popupInfo, setPopupInfo] = useState<{
    name: string;
    coordinates: number[];
  } | null>(null);

  useEffect(() => {
    //Popup med informasjon
    popupOverlayRef.current = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });

    map.setTarget(mapRef.current!);
    map.setView(view);
    map.addOverlay(popupOverlayRef.current);
    //map.setLayers([baseLayerRef.current, additionalLayers]);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    map.setView(view);
  }, [view]);

  useEffect(() => {
    map.setLayers([baseLayer, ...additionalLayers]);
  }, [baseLayer, additionalLayers]);

  //Lager fylke og skolelag
  useEffect(() => {
    const defaultPolygonStyle = new Style({
      fill: new Fill({ color: "rgba(245,33,233,0.3)" }),
      stroke: new Stroke({ color: "#f85699", width: 2 }),
    });

    //Hover-stil for fylkene
    const hoverPolygonStyle = new Style({
      fill: new Fill({ color: "rgba(0,200,255,0.5)" }),
      stroke: new Stroke({ color: "#00BBFF", width: 3 }),
    });

    const getIconSrc = () => "/icons/skole-ikon.png";

    const getPointStyle = (skoler: number, isHovered = false) =>
      new Style({
        image: new Icon({
          anchor: [0.2, 0.5],
          src: getIconSrc(),
          scale: isHovered ? 0.1 : 0.05,
        }),
      });

    //Henter oversikt over fylkene
    const FylkerSource = new VectorSource({
      url: "/geojson/Fylker-M.json",
      format: new GeoJSON(),
    });

    //Henter oversikt over vgs
    const VgsSource = new VectorSource({
      url: "/geojson/Videreg_ende skoler.json",
      format: new GeoJSON(),
    });

    const FylkerLayer = new VectorLayer({
      source: FylkerSource,
      style: defaultPolygonStyle,
    });

    const VgsLayer = new VectorLayer({
      source: VgsSource,
      style: (feature) => {
        const skoler = (feature.get("skoler") as number) || 0;
        return getPointStyle(skoler);
      },
    });

    FylkerLayerRef.current = FylkerLayer;
    VgsLayerRef.current = VgsLayer;

    setAdditionalLayers(showSchools ? [FylkerLayer, VgsLayer] : [FylkerLayer]);

    map.on("pointermove", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);

      FylkerLayer.getSource()
        ?.getFeatures()
        .forEach((feat) => {
          feat.setStyle(
            feat === feature ? hoverPolygonStyle : defaultPolygonStyle,
          );
        });

      VgsLayer.getSource()
        ?.getFeatures()
        .forEach((feat) => {
          const skoler = feat.get("skoler");
          feat.setStyle(getPointStyle(skoler, feat === feature));
        });
    });

    map.on("singleclick", (event) => {
      let skoleFeature: any = null;
      map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        if (layer === VgsLayer && feature?.get("skolenavn")) {
          skoleFeature = feature;
        }
      });

      if (skoleFeature) {
        const name = skoleFeature.get("skolenavn") as string;
        const coordinates = skoleFeature
          .getGeometry()
          ?.getCoordinates() as number[];
        setPopupInfo({ name, coordinates });
        map.getOverlays().item(0).setPosition(coordinates);
      } else {
        setPopupInfo(null);
        map.getOverlays().item(0).setPosition(undefined);
      }
    });
  }, [showSchools]);

  return (
    <>
      <header>
        <h1>My application</h1>
      </header>
      <nav>
        <BackgroundLayerSelect setBaseLayer={setBaseLayer} setView={setView} />
        <button
          onClick={() => setShowSchools((prev) => !prev)}
          className="toggle-button"
        >
          {showSchools ? "Skjul skoler" : "Vis skoler"}
        </button>
      </nav>
      <main>
        <div ref={mapRef} className="map-container" />
        <div
          ref={popupRef}
          className="popup"
          style={{ display: popupInfo ? "block" : "none" }}
        >
          {popupInfo && <div className="popup-content">{popupInfo.name}</div>}
        </div>
      </main>
    </>
  );
}
