import dotenv from 'dotenv';
import type { DirectionsResponse, GeocodingResponse, Route, RouteSummary } from "ors-client";
export type { DirectionsResponse, Route, RouteSummary};

dotenv.config();
const apiKey: string = process.env.ORS_API_KEY || "";

const rateLimitRoute: number = 40;
const rateLimitGeocode: number = 100;


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


export const addressToCoordinates = async (address: string ): Promise<[number, number]> => {
    const response: GeocodingResponse = await getGeocoding(address);
    const coordinates: [number, number] = [
        response.features[0]?.geometry.coordinates[1] as number,
        response.features[0]?.geometry.coordinates[0] as number
    ]
    return coordinates;

}

// Get a route
const getGeocoding = async (address: string): Promise<GeocodingResponse> => {
    return enqueue(async () => {
        const apiUrl: string = `https://api.heigit.org/pelias/v1/search?api_key=${apiKey}&text=${address}`;
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
    },
        (60 * 1000) / rateLimitGeocode
    );
}
// Get a route
export const getRoute = async (coordinate1: [number, number], coordinate2: [number, number]): Promise<DirectionsResponse> => {
    return enqueue(async () => {
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
    },
        (60 * 1000) / rateLimitRoute
    );
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


const wait = (ms: number): Promise<unknown> => new Promise(resolve => setTimeout(resolve, ms));

// ====== RATE LIMIT QUEUE ======
let userWriteQueue: Promise<any> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>, waitMS: number): Promise<T> => {

    const resultPromise = userWriteQueue.then(async () => {
        const result = await task();
        await wait(waitMS);
        return result;
    });

    userWriteQueue = resultPromise.catch((error) => {
        console.log("Task failed", error);
        return wait(waitMS);
    });

    return resultPromise;
}
