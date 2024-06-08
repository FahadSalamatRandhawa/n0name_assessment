// "use client"

import Map from "./map/page"


// import React from "react";
// import { MapContainer, TileLayer } from "react-leaflet";

// const geoUrl = "https://raw.githubusercontent.com/markmarkoh/datamaps/master/src/js/data/world.geo.json";

// const MyMapComponent = () => {
//   return (
//     <MapContainer center={[51.505, -0.09]} zoom={3} style={{ height: "100vh", width: "100%" }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//     </MapContainer>
//   );
// };

// export default MyMapComponent;


export default async function Page() {
    const req=(await fetch("http://localhost:3000/api/geodata",{cache:"no-cache",method:"GET"}))
    const {data}=await req.json()

    console.log(data)

    return <Map data={data} height={500} width={1000} />
}
