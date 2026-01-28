import React, { useState } from 'react';

const FlightSearch = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Enter Flight Number (e.g. AA123)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className="search-button" disabled={isLoading}>
                    {isLoading ? <span className="loader"></span> : 'Search'}
                </button>
            </form>
        </div>
    );
};

export default FlightSearch;
