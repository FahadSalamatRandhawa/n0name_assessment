"use client"
import * as d3 from 'd3';
import { numData, geoData } from '../../../public/global';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';


type MapProps = {
  width?: number;
  height?: number;
  data?: typeof geoData;
};

export default function Map ({ width=1850,height=950,data=geoData }: MapProps) {

  // Fetch tokenholdersdata
  const fetcher = (url:string) => fetch(url,{cache:"default"}).then((res) => res.json());
  const { data: tokenHolders, error, isLoading } = useSWR("/api/edgeTokenHolders", fetcher,{refreshInterval:0,shouldRetryOnError:false});

  const [allSvgPaths, setAllSvgPaths] = useState<any>([]);
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState([0, 0]); //for storing coordinates

  // Pointer events to show data on hover
  const handleMouseOver = (shape:typeof geoData.features[0], event:any) => {
    const holdersFromSameCountry = tokenHolders.tokenHoldersByCountry[shape.properties.name] ? tokenHolders.tokenHoldersByCountry[shape.properties.name].length : null;
    if(!holdersFromSameCountry){
      return; // if no holders, do not update data or show
    }
    setTooltipContent(`Country: ${shape.properties.name}, Token Holders: ${holdersFromSameCountry}`);
    setTooltipPosition(geoPathGenerator.centroid(shape));
  };
  const handleMouseOut = () => {
    setTooltipContent(null);
  };

  
  // if (isLoading) {
  //   console.log("Loading token holders...");
  // } else if (error) {
  //   console.log("Error in fetching token holders:");
  //   console.log(error);
  // } else if (tokenHolders) {
  //   console.log("Token holders:");
  //   console.log(tokenHolders);
  // }
    

  // set height and width automatically on update
  if(typeof window !== 'undefined'){
    useEffect(()=>{
      width=window.innerWidth-50
      height=window.innerHeight-50
    },[window])
  }

  const projection = d3
    .geoMercator()
    .scale(width / 2 / Math.PI - 40)
    .center([10, 35]);

  const geoPathGenerator = d3.geoPath().projection(projection);

  // Country shapes rendering
    useEffect(() => {

      // If no tokenholder data render a basic map
      if (!tokenHolders) {
        const firstSvgPaths=data.features
        .filter((shape) => shape.id !== 'ATA')
        .map((shape:any,index) => {
          return (
            <path
              key={shape.id?shape.id:index}
              d={geoPathGenerator(shape) as string}
              stroke="lightGrey"
              strokeWidth={0.5}
              fill={"#85392"}
              fillOpacity={0.7}
            />
          )
        });
        setAllSvgPaths(firstSvgPaths);
      }else{

        // Update map after data is fetched
        const newSvgPaths = data.features
        .filter((shape) => shape.id !== 'ATA')
        .map((shape:any,index) => {
          const holdersFromSameCountry = tokenHolders.tokenHoldersByCountry[shape.properties.name] ? tokenHolders.tokenHoldersByCountry[shape.properties.name].length : 0;
          return (
            <g key={shape.id ? shape.id : index}>
              <path
                onMouseOver={(event) => handleMouseOver(shape, event)}
                onMouseOut={handleMouseOut}
                d={geoPathGenerator(shape) as string}
                stroke="lightGrey"
                strokeWidth={0.5}
                fill={holdersFromSameCountry?("#F5392"+holdersFromSameCountry*2):"#F5392"}
                fillOpacity={0.7}
              />
            </g>
          );
        });
    
        setAllSvgPaths(newSvgPaths);
      }
  
    }, [tokenHolders]);

  console.log("rendering page")

  return (
    <div>
      <svg id='svg' width={width} height={height}>
        {allSvgPaths}

        {/* shows data on map, upon hover */}
        {tooltipContent && 
          <text x={tooltipPosition[0]} y={tooltipPosition[1]} textAnchor="middle" fontSize="10px" fill='white'>
            {tooltipContent}
          </text>
        }
      </svg>
    </div>
  );
  
};