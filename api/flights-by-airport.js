export default async function handler(request, response) {
    const { dep_iata, flight_date } = request.query;
    const API_KEY = process.env.AVIATION_STACK_KEY;

    if (!API_KEY) {
        return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    if (!dep_iata) {
        return response.status(400).json({ error: 'Missing dep_iata parameter' });
    }

    try {
        let apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&dep_iata=${dep_iata}`;

        if (flight_date) {
            apiUrl += `&flight_date=${flight_date}`;
        }

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
