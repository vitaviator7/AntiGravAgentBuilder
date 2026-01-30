import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom plane icon for destinations
const planeIcon = L.divIcon({
    html: `<div style="font-size: 20px; transform: rotate(45deg);">✈️</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Component to handle map view updates
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
}

const FlightMap = ({ origin, flights = [] }) => {
    const [markers, setMarkers] = useState([]);
    const [originPos, setOriginPos] = useState(null);

    useEffect(() => {
        if (origin) {
            setOriginPos([origin.lat, origin.lng]);
        }

        // Extract unique destinations from flights that have coordinates
        const uniqueDestinations = [];
        const seen = new Set();

        flights.forEach(f => {
            if (f.destinationCoords && !seen.has(f.destinationIata)) {
                seen.add(f.destinationIata);
                uniqueDestinations.push({
                    iata: f.destinationIata,
                    name: f.destinationName,
                    pos: [f.destinationCoords.lat, f.destinationCoords.lng],
                    flight: f // Store full flight object
                });
            }
        });

        setMarkers(uniqueDestinations);
    }, [origin, flights]);

    if (!originPos) return <div className="map-placeholder">Loading map...</div>;

    const mapCenter = originPos || [0, 0];

    const formatTime = (timeStr) => {
        return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="map-wrapper">
            <MapContainer
                center={mapCenter}
                zoom={4}
                style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <MapUpdater center={mapCenter} zoom={4} />

                {/* Origin Marker */}
                <Marker position={originPos}>
                    <Popup>
                        <div className="popup-content">
                            <strong>Origin: {origin.name}</strong>
                            <p>{origin.iata}</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Destination Markers and Lines */}
                {markers.map(dest => (
                    <React.Fragment key={dest.iata}>
                        <Marker position={dest.pos} icon={planeIcon}>
                            <Popup>
                                <div className="popup-content flight-details-popup">
                                    <strong>To: {dest.name}</strong>
                                    <div className="popup-meta">
                                        <span className="popup-iata">{dest.iata}</span>
                                        <span className={`status-badge ${dest.flight.status.toLowerCase().replace(' ', '-')}`}>
                                            {dest.flight.status}
                                        </span>
                                    </div>
                                    <div className="popup-info-grid">
                                        <div className="info-item">
                                            <span className="label">Flight</span>
                                            <span className="value">{dest.flight.flightNumber}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Airline</span>
                                            <span className="value">{dest.flight.airline}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Departs</span>
                                            <span className="value">{formatTime(dest.flight.startTime)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Arrives</span>
                                            <span className="value">{formatTime(dest.flight.endTime)}</span>
                                        </div>
                                    </div>
                                    <div className="popup-footer">
                                        <span>Duration: {dest.flight.duration}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                        <Polyline
                            positions={[originPos, dest.pos]}
                            pathOptions={{
                                color: 'var(--primary-color)',
                                weight: 2,
                                opacity: 0.5,
                                dashArray: '5, 10'
                            }}
                        />
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default FlightMap;
