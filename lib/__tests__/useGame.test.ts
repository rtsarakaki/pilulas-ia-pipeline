import { renderHook, act } from '@testing-library/react';
import { useGame } from '../useGame';

describe('useGame', () => {
  it('should initialize with empty board and X as current player', () => {
    const { result } = renderHook(() => useGame());
    
    expect(result.current.gameState.board).toEqual(Array(9).fill(null));
    expect(result.current.gameState.currentPlayer).toBe('X');
    expect(result.current.gameState.status).toBe('playing');
    expect(result.current.gameState.winner).toBeNull();
  });

  it('should update board when cell is clicked', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.handleCellClick(0);
    });
    
    expect(result.current.gameState.board[0]).toBe('X');
    expect(result.current.gameState.currentPlayer).toBe('O');
  });

  it('should not update board if cell is already occupied', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.handleCellClick(0);
    });
    
    const boardAfterFirstClick = [...result.current.gameState.board];
    
    act(() => {
      result.current.handleCellClick(0); // Try to click same cell
    });
    
    expect(result.current.gameState.board).toEqual(boardAfterFirstClick);
  });

  it('should detect winner correctly', () => {
    const { result } = renderHook(() => useGame());
    
    // X wins horizontally
    act(() => {
      result.current.handleCellClick(0); // X
    });
    act(() => {
      result.current.handleCellClick(3); // O
    });
    act(() => {
      result.current.handleCellClick(1); // X
    });
    act(() => {
      result.current.handleCellClick(4); // O
    });
    act(() => {
      result.current.handleCellClick(2); // X wins
    });
    
    expect(result.current.gameState.status).toBe('finished');
    expect(result.current.gameState.winner).toBe('X');
  });

  it('should reset game correctly', () => {
    const { result } = renderHook(() => useGame());
    
    // Make some moves
    act(() => {
      result.current.handleCellClick(0);
    });
    act(() => {
      result.current.handleCellClick(1);
    });
    
    // Reset
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.gameState.board).toEqual(Array(9).fill(null));
    expect(result.current.gameState.currentPlayer).toBe('X');
    expect(result.current.gameState.status).toBe('playing');
    expect(result.current.gameState.winner).toBeNull();
  });
});
