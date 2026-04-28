import { OpenRouteService, type DirectionsResponse, type Route } from "ors-client";
export type { DirectionsResponse, Route };


import dotenv from 'dotenv';
dotenv.config();



const client = new OpenRouteService({
    apiKey: process.env.ORS_API_KEY || "",
});

async function geocodingExamples() {
    try {
        // Search for a place
        const searchResults = await client.geocoding.search({
            // text: "Fibigerstræde 15, 9220 Aalborg",
            text: "pizza near me",
            // size: 5,
            // layers: ["address", "country"],
            // "focus.point": [57.012186, 9.992092],
            // "boundary.circle": [57.012186, 9.992092, 1],
            "focus.point": [9.992092, 57.012186],
            "boundary.circle": [9.992092, 57.012186, 1],
            "boundary.country": ["DK"]
        });

        console.log("Search results:", searchResults.features.length);
        searchResults.features.forEach((feature, index) => {
            console.log(`Result: ${index}`, feature.properties);
            console.log(`Result: ${index}`, feature.geometry);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

// Get a route
export const getRoute = async (coordinate1: [number, number], coordinate2: [number, number]): Promise<DirectionsResponse> => {
    return await client.directions.calculateRoute("driving-car", {
        coordinates: [
            [coordinate1[1], coordinate1[0]],
            [coordinate2[1], coordinate2[0]],
        ],
    });
}
