import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const FlightMap = ({ origin, flights = [] }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize map with Globe projection and vibrant styling
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'satellite': {
                        type: 'raster',
                        tiles: [
                            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        ],
                        tileSize: 256,
                        attribution: 'Imagery © Esri'
                    }
                },
                layers: [
                    {
                        id: 'satellite',
                        type: 'raster',
                        source: 'satellite',
                        minzoom: 0,
                        maxzoom: 22
                    }
                ]
            },
            center: [origin?.lng || 0, origin?.lat || 0],
            zoom: origin ? 4 : 2,
            pitch: 45, // Tilt for 3D effect
            bearing: -17.6,
            antialias: true
        });

        map.current.on('load', () => {
            setIsLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || !isLoaded || !origin) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Center on origin
        map.current.flyTo({
            center: [origin.lng, origin.lat],
            zoom: 4,
            essential: true,
            pitch: 45
        });

        // Add Origin Marker
        const originEl = document.createElement('div');
        originEl.className = 'marker-origin';
        originEl.innerHTML = '📍';
        originEl.style.fontSize = '24px';
        originEl.style.cursor = 'pointer';

        const originMarker = new maplibregl.Marker(originEl)
            .setLngLat([origin.lng, origin.lat])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                <div class="popup-content">
                    <strong>Origin: ${origin.name}</strong>
                    <p>${origin.iata}</p>
                </div>
            `))
            .addTo(map.current);

        markersRef.current.push(originMarker);

        // Add Destination Markers and Path Lines
        const featuredFlights = flights.filter(f => f.destinationCoords).slice(0, 5);

        // Safety remove if exists
        try {
            if (map.current.getLayer('routes')) map.current.removeLayer('routes');
            if (map.current.getSource('routes')) map.current.removeSource('routes');
        } catch (e) { }

        const routeData = {
            type: 'FeatureCollection',
            features: []
        };

        const formatTime = (timeStr) => {
            return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        featuredFlights.forEach(f => {
            const destCoords = [f.destinationCoords.lng, f.destinationCoords.lat];

            // Improved Marker Container (Larger hit area)
            const destContainer = document.createElement('div');
            destContainer.className = 'marker-container dest';
            destContainer.style.width = '40px';
            destContainer.style.height = '40px';
            destContainer.style.display = 'flex';
            destContainer.style.alignItems = 'center';
            destContainer.style.justifyContent = 'center';
            destContainer.style.cursor = 'pointer';

            const destEl = document.createElement('div');
            destEl.className = 'marker-dest';
            destEl.innerHTML = '✈️';
            destEl.style.fontSize = '24px';
            destEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            destEl.style.transform = 'rotate(45deg)';

            destContainer.appendChild(destEl);

            const popup = new maplibregl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: true,
                className: 'flight-popup-3d',
                maxWidth: '300px'
            }).setHTML(`
                <div class="popup-content flight-details-popup">
                    <div class="popup-header-3d">
                        <strong>To: ${f.destinationName}</strong>
                        <span class="popup-iata">${f.destinationIata}</span>
                    </div>
                    <div class="popup-body">
                        <div class="status-row">
                            <span class="status-badge ${f.status.toLowerCase().replace(' ', '-')}">${f.status}</span>
                            <span class="airline-name">${f.airline}</span>
                        </div>
                        <div class="popup-info-grid">
                            <div class="info-item"><span class="label">Flight</span><span class="value">${f.flightNumber}</span></div>
                            <div class="info-item"><span class="label">Duration</span><span class="value">${f.duration}</span></div>
                            <div class="info-item"><span class="label">Departs</span><span class="value">${formatTime(f.startTime)}</span></div>
                            <div class="info-item"><span class="label">Arrives</span><span class="value">${formatTime(f.endTime)}</span></div>
                        </div>
                    </div>
                </div>
            `);

            const destMarker = new maplibregl.Marker({
                element: destContainer,
                anchor: 'center'
            })
                .setLngLat(destCoords)
                .setPopup(popup)
                .addTo(map.current);

            // Force popup on click for maximum reliability
            destContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                destMarker.togglePopup();
            });

            markersRef.current.push(destMarker);

            // Path Line
            routeData.features.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[origin.lng, origin.lat], destCoords]
                }
            });
        });

        if (routeData.features.length > 0) {
            map.current.addSource('routes', {
                type: 'geojson',
                data: routeData
            });

            map.current.addLayer({
                id: 'routes',
                type: 'line',
                source: 'routes',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#4ade80', // Vibrant green for the paths
                    'line-width': 3,
                    'line-dasharray': [2, 1],
                    'line-opacity': 0.8
                }
            });
        }

    }, [origin, flights, isLoaded]);

    return (
        <div className="map-wrapper" style={{ height: '600px', width: '100%', position: 'relative' }}>
            <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
            <div className="map-overlay-3d">
                <span>3D Earth View</span>
            </div>
        </div>
    );
};

export default FlightMap;
