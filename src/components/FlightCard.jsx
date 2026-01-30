import React from 'react';

const FlightCard = ({ flight }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const options = {
                hour: 'numeric',
                minute: 'numeric',
                month: 'short',
                day: 'numeric',
            };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (e) {
            return 'N/A';
        }
    };

    const generateGoogleCalendarUrl = (flight) => {
        if (!flight.startTime || !flight.endTime) return '#';

        const formatTime = (dateString) => {
            return dateString.replace(/[-:]/g, '').split('.')[0];
        };

        try {
            const startTime = formatTime(flight.startTime);
            const endTime = formatTime(flight.endTime);
            const text = encodeURIComponent(`Flight ${flight.flightNumber || ''} (${flight.airline || ''})`);
            const details = encodeURIComponent(`Flight from ${flight.origin || ''} to ${flight.destination || ''}.\nStatus: ${flight.status || ''} \nDuration: ${flight.duration || ''} `);
            const location = encodeURIComponent(`${flight.origin || ''} to ${flight.destination || ''} `);

            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
        } catch (e) {
            return '#';
        }
    };

    return (
        <a
            href={generateGoogleCalendarUrl(flight)}
            target="_blank"
            rel="noopener noreferrer"
            className="flight-card-link"
        >
            <div className="flight-card fade-in">
                <div className="flight-header">
                    <span className="airline">{flight.airline || 'Unknown Airline'}</span>
                    <span className={`status ${(flight.status || 'unknown').toLowerCase().replace(' ', '-')}`}>{flight.status || 'Unknown'}</span>
                </div>

                <div className="route-container">
                    <div className="location start">
                        <div className="code">{flight.origin?.includes('(') ? flight.origin.split('(')[1].replace(')', '') : 'N/A'}</div>
                        <div className="city">{flight.origin?.split('(')[0].trim() || 'N/A'}</div>
                        <div className="time">{formatDate(flight.startTime)}</div>
                    </div>

                    <div className="duration-container">
                        <div className="duration-line">
                            <span className="dot start"></span>
                            <span className="plane-icon">✈</span>
                            <span className="dot end"></span>
                        </div>
                        <div className="duration-text">{flight.duration}</div>
                    </div>

                    <div className="location end">
                        <div className="code">{flight.destination?.includes('(') ? flight.destination.split('(')[1].replace(')', '') : 'N/A'}</div>
                        <div className="city">{flight.destination?.split('(')[0].trim() || 'N/A'}</div>
                        <div className="time">{formatDate(flight.endTime)}</div>
                    </div>
                </div>

                <div className="flight-footer">
                    <div className="flight-number">Flight: <strong>{flight.flightNumber}</strong></div>
                    <div className="calendar-hint">Click to add to Calendar 📅</div>
                </div>
            </div>
        </a>
    );
};

export default FlightCard;
