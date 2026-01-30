
import React, { useState } from 'react'
import FlightSearch from './components/FlightSearch'
import AirportSearch from './components/AirportSearch'
import FlightCard from './components/FlightCard'
import FlightMap from './components/FlightMap'
import { searchFlight, searchFlightsByAirport, getAirportInfo } from './services/flightApi'

function App() {
    const [flights, setFlights] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [activeTab, setActiveTab] = useState('flight') // 'flight' or 'airport'
    const [originCoords, setOriginCoords] = useState(null)
    const [airportCache, setAirportCache] = useState({})

    const handleFlightSearch = async (flightNumber, flightDate) => {
        setIsLoading(true)
        setError(null)
        setFlights([])
        setHasSearched(true)

        try {
            const results = await searchFlight(flightNumber, flightDate)
            setFlights(results)
        } catch (err) {
            setError(err.message || 'An error occurred while fetching flight details.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAirportSearch = async (airportCode, flightDate) => {
        setIsLoading(true)
        setError(null)
        setFlights([])
        setHasSearched(true)
        setOriginCoords(null)

        try {
            // Fetch origin coords first
            let originInfo = airportCache[airportCode];
            if (!originInfo) {
                try {
                    originInfo = await getAirportInfo(airportCode);
                    setAirportCache(prev => ({ ...prev, [airportCode]: originInfo }));
                } catch (e) {
                    console.warn('Could not fetch origin coordinates', e);
                }
            }
            setOriginCoords(originInfo);

            const results = await searchFlightsByAirport(airportCode, flightDate)

            // Enrich first few results with destination coords for the map
            const uniqueDestinations = [...new Set(results.map(f => {
                // The API mapper puts the IATA in parens: "Airport Name (IATA)"
                const match = f.destination.match(/\(([^)]+)\)/);
                return match ? match[1] : null;
            }).filter(Boolean))].slice(0, 10);

            const destinationMap = { ...airportCache };
            const enrichedResults = [...results];

            for (const iata of uniqueDestinations) {
                if (!destinationMap[iata]) {
                    try {
                        const info = await getAirportInfo(iata);
                        destinationMap[iata] = info;
                    } catch (e) {
                        console.warn(`Could not fetch coords for ${iata}`, e);
                    }
                }
            }

            setAirportCache(destinationMap);

            // Add coords to results for the map component
            const finalResults = results.map(f => {
                const match = f.destination.match(/\(([^)]+)\)/);
                const iata = match ? match[1] : null;
                const name = f.destination.split(' (')[0];
                return {
                    ...f,
                    destinationIata: iata,
                    destinationName: name,
                    destinationCoords: destinationMap[iata] || null
                };
            });

            setFlights(finalResults)
        } catch (err) {
            setError(err.message || 'An error occurred while fetching departures.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setFlights([])
        setError(null)
        setHasSearched(false)
    }

    return (
        <div className="app">
            <div className="background-design"></div>
            <header className="header">
                <h1>Flight<span className="highlight">Lookup</span></h1>
                <p>Real-time flight status at your fingertips</p>
            </header>

            <main>
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'flight' ? 'active' : ''}`}
                        onClick={() => handleTabChange('flight')}
                    >
                        ✈️ Search Flight
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'airport' ? 'active' : ''}`}
                        onClick={() => handleTabChange('airport')}
                    >
                        🛫 Airport Departures
                    </button>
                </div>

                {activeTab === 'flight' ? (
                    <FlightSearch onSearch={handleFlightSearch} isLoading={isLoading} />
                ) : (
                    <AirportSearch onSearch={handleAirportSearch} isLoading={isLoading} />
                )}

                <div className="results-container">
                    {isLoading && <div className="loading-state">Searching flights...</div>}

                    {!isLoading && error && <div className="error-message">{error}</div>}

                    {!isLoading && hasSearched && flights.length > 0 && activeTab === 'airport' && originCoords && (
                        <FlightMap origin={originCoords} flights={flights} />
                    )}

                    {!isLoading && hasSearched && flights.length === 0 && !error && (
                        <div className="no-results">
                            {activeTab === 'flight'
                                ? 'No flights found for this number. Please check the flight IATA code (e.g. AA123).'
                                : 'No departures found for this airport. Please check the airport IATA code (e.g. JFK, LAX).'
                            }
                        </div>
                    )}

                    {!isLoading && flights.length > 0 && (
                        <div className="results-header">
                            Found {flights.length} flight{flights.length > 1 ? 's' : ''}
                        </div>
                    )}

                    {!isLoading && flights.map(flight => (
                        <FlightCard key={flight.id} flight={flight} />
                    ))}
                </div>
            </main>
        </div>
    )
}

export default App

