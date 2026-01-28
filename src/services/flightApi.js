const API_URL = 'http://api.aviationstack.com/v1/flights';
const API_KEY = import.meta.env.VITE_AVIATION_STACK_KEY;

export const searchFlight = async (flightNumber) => {
    if (!API_KEY) {
        throw new Error('API Key is missing. Please set VITE_AVIATION_STACK_KEY in .env');
    }

    try {
        try {
            let response;

            // Use local direct fetch for development, Proxy for production (to fix mixed content)
            if (import.meta.env.DEV) {
                response = await fetch(`${API_URL}?access_key=${API_KEY}&flight_iata=${flightNumber}`);
            } else {
                // In production (Vercel), use the serverless proxy
                response = await fetch(`/api/flight?flight_iata=${flightNumber}`);
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.info || 'API returned an error');
            }

            if (!data.data || data.data.length === 0) {
                return [];
            }

            // Map response to our app's format
            return data.data.map((flight, index) => ({
                id: index, // unique id not always provided by free tier in a stable way for list
                flightNumber: flight.flight.iata || flight.flight.icao || flightNumber,
                origin: `${flight.departure.airport} (${flight.departure.iata})`,
                destination: `${flight.arrival.airport} (${flight.arrival.iata})`,
                startTime: flight.departure.scheduled,
                endTime: flight.arrival.scheduled,
                duration: calculateDuration(flight.departure.scheduled, flight.arrival.scheduled),
                status: mapStatus(flight.flight_status),
                airline: flight.airline.name
            }));

        } catch (error) {
            console.error('Flight API Error:', error);
            throw error;
        }
    };

    const mapStatus = (status) => {
        // Aviation stack statuses: scheduled, active, landed, cancelled, incident, diverted
        const map = {
            'scheduled': 'On Time',
            'active': 'In Air',
            'landed': 'Landed',
            'cancelled': 'Cancelled',
            'incident': 'Incident',
            'diverted': 'Diverted'
        };
        return map[status] || status;
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 'N/A';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        if (isNaN(diffMs)) return 'N/A';

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };
