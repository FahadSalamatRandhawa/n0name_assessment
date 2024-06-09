"use client"

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "/countries.json";

export default function MapChart() {
  const [tooltipContent, setTooltipContent] = useState("popup");

  return (
    <div>
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo, index) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={"#5152" + index}
                onMouseEnter={() => {
                  alert("caught")
                }}
                onMouseLeave={() => {
                  setTooltipContent("");
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      <div className="tooltip">{tooltipContent}</div>
    </div>
  );
}
