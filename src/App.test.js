import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app correctly', () => {
  render(<App />);
  const ctaElement = screen.getByText(/Want today's picks\?/i);
  expect(ctaElement).toBeInTheDocument();
});
