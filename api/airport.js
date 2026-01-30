export default async function handler(request, response) {
    const { iata } = request.query;
    const API_KEY = process.env.AVIATION_STACK_KEY;

    if (!API_KEY) {
        return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    if (!iata) {
        return response.status(400).json({ error: 'Missing iata parameter' });
    }

    try {
        const apiUrl = `http://api.aviationstack.com/v1/airports?access_key=${API_KEY}&iata_code=${iata}`;
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            throw new Error(`Upstream API Error: ${apiResponse.statusText}`);
        }

        const data = await apiResponse.json();

        if (data.data && data.data.length > 0) {
            const airport = data.data[0];
            return response.status(200).json({
                iata: airport.iata_code,
                name: airport.airport_name,
                lat: parseFloat(airport.latitude),
                lng: parseFloat(airport.longitude)
            });
        }

        return response.status(404).json({ error: 'Airport not found' });
    } catch (error) {
        console.error('Proxy Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
