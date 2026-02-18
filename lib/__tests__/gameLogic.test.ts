import { checkWinner, checkDraw, isValidMove, makeMove, getGameStatus } from '../gameLogic';
import { Board } from '../types';

describe('gameLogic', () => {
  describe('checkWinner', () => {
    it('should return null for empty board', () => {
      const board: Board = Array(9).fill(null);
      expect(checkWinner(board)).toBeNull();
    });

    it('should detect horizontal win for X', () => {
      const board: Board = ['X', 'X', 'X', null, null, null, null, null, null];
      expect(checkWinner(board)).toBe('X');
    });

    it('should detect horizontal win for O', () => {
      const board: Board = [null, null, null, 'O', 'O', 'O', null, null, null];
      expect(checkWinner(board)).toBe('O');
    });

    it('should detect vertical win for X', () => {
      const board: Board = ['X', null, null, 'X', null, null, 'X', null, null];
      expect(checkWinner(board)).toBe('X');
    });

    it('should detect diagonal win for O', () => {
      const board: Board = ['O', null, null, null, 'O', null, null, null, 'O'];
      expect(checkWinner(board)).toBe('O');
    });

    it('should detect reverse diagonal win for X', () => {
      const board: Board = [null, null, 'X', null, 'X', null, 'X', null, null];
      expect(checkWinner(board)).toBe('X');
    });

    it('should return null when no winner', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', null, null, null];
      expect(checkWinner(board)).toBeNull();
    });
  });

  describe('checkDraw', () => {
    it('should return false for empty board', () => {
      const board: Board = Array(9).fill(null);
      expect(checkDraw(board)).toBe(false);
    });

    it('should return true for full board with no winner', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(checkDraw(board)).toBe(true);
    });

    it('should return false when there is a winner', () => {
      const board: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(checkDraw(board)).toBe(false);
    });
  });

  describe('isValidMove', () => {
    it('should return true for empty cell', () => {
      const board: Board = Array(9).fill(null);
      expect(isValidMove(board, 0)).toBe(true);
    });

    it('should return false for occupied cell', () => {
      const board: Board = ['X', null, null, null, null, null, null, null, null];
      expect(isValidMove(board, 0)).toBe(false);
    });

    it('should return false for invalid position', () => {
      const board: Board = Array(9).fill(null);
      expect(isValidMove(board, -1)).toBe(false);
      expect(isValidMove(board, 9)).toBe(false);
    });
  });

  describe('makeMove', () => {
    it('should create new board with move', () => {
      const board: Board = Array(9).fill(null);
      const newBoard = makeMove(board, 0, 'X');
      expect(newBoard[0]).toBe('X');
      expect(board[0]).toBeNull(); // Original should be unchanged
    });

    it('should not modify board for invalid move', () => {
      const board: Board = ['X', null, null, null, null, null, null, null, null];
      const newBoard = makeMove(board, 0, 'O');
      expect(newBoard).toEqual(board);
    });
  });

  describe('getGameStatus', () => {
    it('should return playing for empty board', () => {
      const board: Board = Array(9).fill(null);
      const status = getGameStatus(board);
      expect(status.status).toBe('playing');
      expect(status.winner).toBeNull();
    });

    it('should return finished with winner X', () => {
      const board: Board = ['X', 'X', 'X', null, null, null, null, null, null];
      const status = getGameStatus(board);
      expect(status.status).toBe('finished');
      expect(status.winner).toBe('X');
    });

    it('should return finished with draw', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      const status = getGameStatus(board);
      expect(status.status).toBe('finished');
      expect(status.winner).toBe('draw');
    });
  });
});
