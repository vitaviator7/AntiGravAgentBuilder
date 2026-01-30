export const searchFlight = async (flightNumber, flightDate = null) => {
    try {
        // Always use serverless proxy to keep API key secure
        let url = `/api/flight?flight_iata=${flightNumber}`;

        if (flightDate) {
            url += `&flight_date=${flightDate}`;
        }

        const response = await fetch(url);

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
            id: index,
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

export const searchFlightsByAirport = async (airportCode, flightDate = null) => {
    try {
        let url = `/api/flights-by-airport?dep_iata=${airportCode}`;

        if (flightDate) {
            url += `&flight_date=${flightDate}`;
        }

        const response = await fetch(url);

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
            id: index,
            flightNumber: flight.flight.iata || flight.flight.icao || 'N/A',
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
