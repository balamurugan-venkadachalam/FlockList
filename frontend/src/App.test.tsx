import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    const elements = screen.getAllByText(/Family Task Manager/i);
    expect(elements.length).toBeGreaterThan(0);
  });
}); 