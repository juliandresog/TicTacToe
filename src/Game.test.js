import { render, screen } from '@testing-library/react';
import Game from './App';

test('renders game status', () => {
  render(<Game />);
  const statusElement = screen.getByText(/Next Player: X/i);
  expect(statusElement).toBeInTheDocument();
});
