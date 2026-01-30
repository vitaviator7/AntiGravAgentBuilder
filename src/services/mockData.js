export const mockFlights = [
    {
        flight: { iata: "BA123", icao: "BAW123" },
        flight_date: "2026-01-30",
        flight_status: "active",
        departure: {
            airport: "London Heathrow",
            iata: "LHR",
            scheduled: "2026-01-30T10:00:00+00:00"
        },
        arrival: {
            airport: "John F. Kennedy International",
            iata: "JFK",
            scheduled: "2026-01-30T13:00:00+00:00"
        },
        airline: { name: "British Airways" }
    },
    {
        flight: { iata: "AA456", icao: "AAL456" },
        flight_date: "2026-01-30",
        flight_status: "scheduled",
        departure: {
            airport: "John F. Kennedy International",
            iata: "JFK",
            scheduled: "2026-01-30T15:00:00+00:00"
        },
        arrival: {
            airport: "Los Angeles International",
            iata: "LAX",
            scheduled: "2026-01-30T18:00:00+00:00"
        },
        airline: { name: "American Airlines" }
    },
    {
        flight: { iata: "AF789", icao: "AFR789" },
        flight_date: "2026-01-30",
        flight_status: "landed",
        departure: {
            airport: "Charles de Gaulle",
            iata: "CDG",
            scheduled: "2026-01-30T08:00:00+00:00"
        },
        arrival: {
            airport: "London Heathrow",
            iata: "LHR",
            scheduled: "2026-01-30T09:15:00+00:00"
        },
        airline: { name: "Air France" }
    }
];

export const mockAirports = {
    "JFK": {
        iata: "JFK",
        name: "John F. Kennedy International",
        lat: 40.6413,
        lng: -73.7781
    },
    "LHR": {
        iata: "LHR",
        name: "London Heathrow",
        lat: 51.4700,
        lng: -0.4543
    },
    "LAX": {
        iata: "LAX",
        name: "Los Angeles International",
        lat: 33.9416,
        lng: -118.4085
    },
    "CDG": {
        iata: "CDG",
        name: "Charles de Gaulle",
        lat: 49.0097,
        lng: 2.5479
    },
    "SFO": {
        iata: "SFO",
        name: "San Francisco International",
        lat: 37.6213,
        lng: -122.3790
    }
};

export const getMockDepartures = (iata) => {
    // Returns some random flights departing from the given IATA
    return mockFlights.map((f, i) => ({
        ...f,
        departure: { ...f.departure, iata: iata, airport: mockAirports[iata]?.name || "Local Airport" },
        arrival: {
            ...f.arrival,
            iata: ["LAX", "SFO", "LHR", "CDG", "JFK"].filter(code => code !== iata)[i % 4],
            airport: mockAirports[["LAX", "SFO", "LHR", "CDG", "JFK"].filter(code => code !== iata)[i % 4]]?.name || "Destination Airport"
        }
    }));
};
