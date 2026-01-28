export default async function handler(request, response) {
    const { flight_iata } = request.query;
    const API_KEY = process.env.VITE_AVIATION_STACK_KEY;

    if (!API_KEY) {
        return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    if (!flight_iata) {
        return response.status(400).json({ error: 'Missing flight_iata parameter' });
    }

    try {
        const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flight_iata}`;
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            throw new Error(`Upstream API Error: ${apiResponse.statusText}`);
        }

        const data = await apiResponse.json();
        return response.status(200).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
