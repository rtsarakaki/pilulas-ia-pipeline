import { render, screen } from '@testing-library/react';
import { GameStatus } from '../GameStatus';

describe('GameStatus', () => {
  it('should display current player when playing', () => {
    render(<GameStatus status="playing" currentPlayer="X" winner={null} />);
    expect(screen.getByText(/Vez do jogador: X/i)).toBeInTheDocument();
  });

  it('should display winner when game is finished', () => {
    render(<GameStatus status="finished" currentPlayer="X" winner="X" />);
    expect(screen.getByText(/Jogador X venceu/i)).toBeInTheDocument();
  });

  it('should display draw message when game is draw', () => {
    render(<GameStatus status="finished" currentPlayer="X" winner="draw" />);
    expect(screen.getByText(/Empate!/i)).toBeInTheDocument();
  });

  it('should display playing hint when game is playing', () => {
    render(<GameStatus status="playing" currentPlayer="O" winner={null} />);
    expect(screen.getByText(/Clique em uma célula vazia/i)).toBeInTheDocument();
  });
});
