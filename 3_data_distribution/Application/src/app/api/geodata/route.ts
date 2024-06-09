import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(request:NextRequest) {
    // Read the GeoJSON data
    const geojsonFilePath = path.join(process.cwd(), 'public', 'countries.geojson');
    const geojsonData = JSON.parse(fs.readFileSync(geojsonFilePath, 'utf8'));

    return NextResponse.json({data:geojsonData})
}