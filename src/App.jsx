
import React, { useState } from 'react'
import FlightSearch from './components/FlightSearch'
import FlightCard from './components/FlightCard'
import { searchFlight } from './services/flightApi'

function App() {
    const [flights, setFlights] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (flightNumber) => {
        setIsLoading(true)
        setError(null)
        setFlights([])
        setHasSearched(true)

        try {
            const results = await searchFlight(flightNumber)
            setFlights(results)
        } catch (err) {
            setError('An error occurred while fetching flight details.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="app">
            <div className="background-design"></div>
            <header className="header">
                <h1>Flight<span className="highlight">Lookup</span></h1>
                <p>Real-time flight status at your fingertips</p>
            </header>

            <main>
                <FlightSearch onSearch={handleSearch} isLoading={isLoading} />

                <div className="results-container">
                    {isLoading && <div className="loading-state">Searching flights...</div>}

                    {!isLoading && error && <div className="error-message">{error}</div>}

                    {!isLoading && hasSearched && flights.length === 0 && !error && (
                        <div className="no-results">
                            No flights found for this number. Please check the flight IATA code (e.g. AA123).

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

