import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FlightSearch from '../FlightSearch';

describe('FlightSearch Component', () => {
    it('renders input and button correctly', () => {
        render(<FlightSearch onSearch={() => { }} isLoading={false} />);

        expect(screen.getByPlaceholderText(/Enter Flight Number/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });

    it('calls onSearch with input values when submitted', () => {
        const mockOnSearch = vi.fn();
        render(<FlightSearch onSearch={mockOnSearch} isLoading={false} />);

        const input = screen.getByPlaceholderText(/Enter Flight Number/i);
        const dateInput = screen.getByPlaceholderText(/Select date/i);
        const button = screen.getByRole('button', { name: /Search/i });

        fireEvent.change(input, { target: { value: 'BA456' } });
        fireEvent.change(dateInput, { target: { value: '2026-02-15' } });
        fireEvent.click(button);

        expect(mockOnSearch).toHaveBeenCalledWith('BA456', '2026-02-15');
    });

    it('disables inputs when loading', () => {
        render(<FlightSearch onSearch={() => { }} isLoading={true} />);

        expect(screen.getByPlaceholderText(/Enter Flight Number/i)).toBeDisabled();
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
