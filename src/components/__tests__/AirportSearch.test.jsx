import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AirportSearch from '../AirportSearch';

describe('AirportSearch Component', () => {
    it('renders input and button correctly', () => {
        render(<AirportSearch onSearch={() => { }} isLoading={false} />);

        expect(screen.getByPlaceholderText(/Enter Airport Code/i)).toBeInTheDocument();
    });

    it('transforms input to uppercase', () => {
        render(<AirportSearch onSearch={() => { }} isLoading={false} />);
        const input = screen.getByPlaceholderText(/Enter Airport Code/i);

        fireEvent.change(input, { target: { value: 'jfk' } });
        expect(input.value).toBe('JFK');
    });

    it('calls onSearch with uppercase code and date', () => {
        const mockOnSearch = vi.fn();
        render(<AirportSearch onSearch={mockOnSearch} isLoading={false} />);

        const input = screen.getByPlaceholderText(/Enter Airport Code/i);
        const button = screen.getByRole('button', { name: /Search/i });

        fireEvent.change(input, { target: { value: 'lax' } });
        fireEvent.click(button);

        expect(mockOnSearch).toHaveBeenCalledWith('LAX', null);
    });
});
