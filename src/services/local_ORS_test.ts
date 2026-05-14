import { type DirectionsResponse } from "ors-client";

function isDirectionsResponse(data: DirectionsResponse): data is DirectionsResponse {
    return (
        data &&
        Array.isArray(data.routes) &&
        Array.isArray(data.bbox) &&
        typeof data.metadata === 'object'
    );
}

const getRoute = async (coordinate1: [number, number], coordinate2: [number, number]) => {
    const apiUrl: string = 'http://172.25.11.233:8080/v2/directions/driving-car/json';
    try {
        const response: Response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': apiKey,
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

const route: DirectionsResponse = await getRoute(
    [56.76928327495828, 10.101928710937502],
    [56.447313059250334, 8.942871093750002]

);

console.log(JSON.stringify(route));
