import { mockFlights, mockAirports, getMockDepartures } from './mockData';

const mapFlightData = (flight, index, inputFlightNumber = 'N/A') => {
    const dep = flight.departure || {};
    const arr = flight.arrival || {};
    const flt = flight.flight || {};
    const airline = flight.airline || {};

    return {
        id: index,
        flightNumber: flt.iata || flt.icao || inputFlightNumber,
        origin: dep.airport ? `${dep.airport} (${dep.iata || '???'})` : (dep.iata || 'Unknown'),
        destination: arr.airport ? `${arr.airport} (${arr.iata || '???'})` : (arr.iata || 'Unknown'),
        startTime: dep.scheduled || null,
        endTime: arr.scheduled || null,
        duration: calculateDuration(dep.scheduled, arr.scheduled),
        status: mapStatus(flight.flight_status),
        airline: airline.name || 'Unknown Airline'
    };
};

export const searchFlight = async (flightNumber, flightDate = null, useMock = false) => {
    if (useMock) {
        // Find matching flight or return random ones
        const results = mockFlights.filter(f => f.flight.iata === flightNumber);
        const finalResults = results.length > 0 ? results : mockFlights.slice(0, 1);
        return finalResults.map((f, i) => mapFlightData(f, i, flightNumber));
    }

    try {
        let url = `/api/flight?flight_iata=${flightNumber}`;
        if (flightDate) url += `&flight_date=${flightDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const data = await response.json();
        if (data.error) throw new Error(data.error.info || 'API returned an error');
        if (!data.data || data.data.length === 0) return [];

        return data.data.map((flight, index) => mapFlightData(flight, index, flightNumber));
    } catch (error) {
        console.error('Flight API Error:', error);
        throw error;
    }
};

export const searchFlightsByAirport = async (airportCode, flightDate = null, useMock = false) => {
    if (useMock) {
        const results = getMockDepartures(airportCode);
        return results.map((f, i) => mapFlightData(f, i));
    }

    try {
        let url = `/api/flights-by-airport?dep_iata=${airportCode}`;
        if (flightDate) url += `&flight_date=${flightDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const data = await response.json();
        if (data.error) throw new Error(data.error.info || 'API returned an error');
        if (!data.data || data.data.length === 0) return [];

        return data.data.map((flight, index) => mapFlightData(flight, index));
    } catch (error) {
        console.error('Flight API Error:', error);
        throw error;
    }
};

export const getAirportInfo = async (iataCode, useMock = false) => {
    if (useMock) {
        const info = mockAirports[iataCode];
        if (info) return info;
        // Return dummy coords if not found
        return {
            iata: iataCode,
            name: `${iataCode} International`,
            lat: 34.0522 + (Math.random() - 0.5) * 10,
            lng: -118.2437 + (Math.random() - 0.5) * 10
        };
    }

    try {
        const response = await fetch(`/api/airport?iata=${iataCode}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Airport API Error:', error);
        throw error;
    }
};

const mapStatus = (status) => {
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

