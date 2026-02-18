import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from '../Board';
import { Board as BoardType } from '@/lib/types';

describe('Board', () => {
  const mockOnCellClick = jest.fn();
  const emptyBoard: BoardType = Array(9).fill(null);

  beforeEach(() => {
    mockOnCellClick.mockClear();
  });

  it('should render 9 cells', () => {
    render(<Board board={emptyBoard} onCellClick={mockOnCellClick} disabled={false} />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
  });

  it('should call onCellClick when cell is clicked', () => {
    render(<Board board={emptyBoard} onCellClick={mockOnCellClick} disabled={false} />);
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    expect(mockOnCellClick).toHaveBeenCalledWith(0);
  });

  it('should disable cells when disabled prop is true', () => {
    render(<Board board={emptyBoard} onCellClick={mockOnCellClick} disabled={true} />);
    const cells = screen.getAllByRole('button');
    cells.forEach(cell => {
      expect(cell).toBeDisabled();
    });
  });

  it('should disable occupied cells', () => {
    const board: BoardType = ['X', null, null, null, null, null, null, null, null];
    render(<Board board={board} onCellClick={mockOnCellClick} disabled={false} />);
    const cells = screen.getAllByRole('button');
    expect(cells[0]).toBeDisabled();
    expect(cells[1]).not.toBeDisabled();
  });

  it('should display X and O correctly', () => {
    const board: BoardType = ['X', 'O', null, null, null, null, null, null, null];
    render(<Board board={board} onCellClick={mockOnCellClick} disabled={false} />);
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });
});
