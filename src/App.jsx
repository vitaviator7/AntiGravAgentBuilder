
import React, { useState } from 'react'
import FlightSearch from './components/FlightSearch'
import AirportSearch from './components/AirportSearch'
import FlightCard from './components/FlightCard'
import { searchFlight, searchFlightsByAirport } from './services/flightApi'

function App() {
    const [flights, setFlights] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [activeTab, setActiveTab] = useState('flight') // 'flight' or 'airport'

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

        try {
            const results = await searchFlightsByAirport(airportCode, flightDate)
            setFlights(results)
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

