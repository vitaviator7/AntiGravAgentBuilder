import React, { useState } from 'react';

const AirportSearch = ({ onSearch, isLoading }) => {
    const [airportCode, setAirportCode] = useState('');
    const [flightDate, setFlightDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (airportCode.trim()) {
            onSearch(airportCode.trim().toUpperCase(), flightDate || null);
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Enter Airport Code (e.g. JFK, LAX)"
                    value={airportCode}
                    onChange={(e) => setAirportCode(e.target.value.toUpperCase())}
                    disabled={isLoading}
                    maxLength={4}
                />
                <input
                    type="date"
                    className="date-input"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className="search-button" disabled={isLoading}>
                    {isLoading ? <span className="loader"></span> : 'Search'}
                </button>
            </form>
            <p className="search-hint">Find all departing flights from an airport</p>
        </div>
    );
};

export default AirportSearch;
