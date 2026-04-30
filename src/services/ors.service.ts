import type { DirectionsResponse, GeocodingResponse, Route } from "ors-client";
export type { DirectionsResponse, Route };


import dotenv from 'dotenv';
dotenv.config();
const apiKey: string = process.env.ORS_API_KEY || "";


// async function geocodingExamples() {
//     try {
//         // Search for a place
//         const searchResults = await client.geocoding.search({
//             // text: "Fibigerstræde 15, 9220 Aalborg",
//             text: "pizza near me",
//             // size: 5,
//             // layers: ["address", "country"],
//             // "focus.point": [57.012186, 9.992092],
//             // "boundary.circle": [57.012186, 9.992092, 1],
//             "focus.point": [9.992092, 57.012186],
//             "boundary.circle": [9.992092, 57.012186, 1],
//             "boundary.country": ["DK"]
//         });
//
//         console.log("Search results:", searchResults.features.length);
//         searchResults.features.forEach((feature, index) => {
//             console.log(`Result: ${index}`, feature.properties);
//             console.log(`Result: ${index}`, feature.geometry);
//         });
//
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// Get a route
export const getGeocoding = async (adress: string): Promise<GeocodingResponse> => {
    const apiUrl: string = `https://api.heigit.org/pelias/v1/search?api_key=${apiKey}&${adress}`;
    try {
        const response: Response = await fetch(apiUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`OpenRouteService error getting geocode. Status: ${response.status}`);
        }

        const data: GeocodingResponse = await response.json();

        if (isGeocodingResponse(data)) {
            return data;
        } else {
            throw new Error("Received data does not match DirectionsResponse format");
        }
    } catch (error) {
        console.error("Failed to fetch route:", error);
        throw error;
    }
}
// Get a route
export const getRoute = async (coordinate1: [number, number], coordinate2: [number, number]): Promise<DirectionsResponse> => {
    const apiUrl: string = 'https://api.heigit.org/openrouteservice/v2/directions/driving-car/json';
    try {
        const response: Response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
            },
            body: JSON.stringify(
                {
                    "coordinates": [
                        [coordinate1[1], coordinate1[0]],
                        [coordinate2[1], coordinate2[0]],
                    ]
                }
            ),
        });

        if (!response.ok) {
            throw new Error(`OpenRouteService error getting route. Status: ${response.status}`);
        }

        const data: DirectionsResponse = await response.json();

        if (isDirectionsResponse(data)) {
            return data;
        } else {
            throw new Error("Received data does not match DirectionsResponse format");
        }
    } catch (error) {
        console.error("Failed to fetch route:", error);
        throw error;
    }
}

function isGeocodingResponse(data: GeocodingResponse): data is GeocodingResponse {
    return (
        typeof data.geocoding === 'object' &&
        data.type === "FeatureCollection" &&
        Array.isArray(data.features) &&
        Array.isArray(data.bbox)
    );
}

function isDirectionsResponse(data: DirectionsResponse): data is DirectionsResponse {
    return (
        data &&
        Array.isArray(data.routes) &&
        Array.isArray(data.bbox) &&
        typeof data.metadata === 'object'
    );
}
