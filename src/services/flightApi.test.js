import { describe, it, expect, vi } from 'vitest';
import { searchFlight, searchFlightsByAirport } from './flightApi';

// Mock the global fetch
global.fetch = vi.fn();

describe('flightApi service', () => {
    it('searchFlight handles successful response and maps data correctly', async () => {
        const mockResponse = {
            data: [
                {
                    flight: { iata: 'AA123' },
                    departure: { airport: 'JFK', iata: 'JFK', scheduled: '2026-01-30T10:00:00Z' },
                    arrival: { airport: 'LAX', iata: 'LAX', scheduled: '2026-01-30T16:00:00Z' },
                    flight_status: 'active',
                    airline: { name: 'American Airlines' }
                }
            ]
        };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await searchFlight('AA123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: 0,
            flightNumber: 'AA123',
            origin: 'JFK (JFK)',
            destination: 'LAX (LAX)',
            startTime: '2026-01-30T10:00:00Z',
            endTime: '2026-01-30T16:00:00Z',
            duration: '6h 0m',
            status: 'In Air',
            airline: 'American Airlines'
        });
    });

    it('searchFlight returns empty array when no data found', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        const result = await searchFlight('UNKNOWN');
        expect(result).toEqual([]);
    });

    it('searchFlightsByAirport maps data correctly', async () => {
        const mockResponse = {
            data: [
                {
                    flight: { iata: 'UA456' },
                    departure: { airport: 'LHR', iata: 'LHR', scheduled: '2026-01-30T12:00:00Z' },
                    arrival: { airport: 'JFK', iata: 'JFK', scheduled: '2026-01-30T20:30:00Z' },
                    flight_status: 'scheduled',
                    airline: { name: 'United' }
                }
            ]
        };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await searchFlightsByAirport('LHR');

        expect(result[0].duration).toBe('8h 30m');
        expect(result[0].status).toBe('On Time');
    });
});
