import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';

// Mock useGame hook
jest.mock('@/lib/useGame', () => ({
  useGame: jest.fn(),
}));

import { useGame } from '@/lib/useGame';

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;

describe('Home Page', () => {
  const mockHandleCellClick = jest.fn();
  const mockResetGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGame.mockReturnValue({
      gameState: {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        status: 'playing' as const,
        winner: null,
      },
      handleCellClick: mockHandleCellClick,
      resetGame: mockResetGame,
    });
  });

  it('should render game title', () => {
    render(<Home />);
    expect(screen.getByText('Jogo da Velha')).toBeInTheDocument();
  });

  it('should render Board component', () => {
    render(<Home />);
    const cells = screen.getAllByRole('button');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should render GameStatus component', () => {
    render(<Home />);
    expect(screen.getByText(/Vez do jogador: X/i)).toBeInTheDocument();
  });

  it('should not show reset button when game is playing', () => {
    render(<Home />);
    expect(screen.queryByText(/Jogar Novamente/i)).not.toBeInTheDocument();
  });

  it('should show reset button when game is finished', () => {
    mockUseGame.mockReturnValue({
      gameState: {
        board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
        currentPlayer: 'X',
        status: 'finished' as const,
        winner: 'X',
      },
      handleCellClick: mockHandleCellClick,
      resetGame: mockResetGame,
    });

    render(<Home />);
    const resetButton = screen.getByText(/Jogar Novamente/i);
    expect(resetButton).toBeInTheDocument();
  });

  it('should call resetGame when reset button is clicked', () => {
    mockUseGame.mockReturnValue({
      gameState: {
        board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
        currentPlayer: 'X',
        status: 'finished' as const,
        winner: 'X',
      },
      handleCellClick: mockHandleCellClick,
      resetGame: mockResetGame,
    });

    render(<Home />);
    const resetButton = screen.getByText(/Jogar Novamente/i);
    fireEvent.click(resetButton);
    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });
});
