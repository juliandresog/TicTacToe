import React, { useState, useEffect, useCallback } from 'react';
import './NewGame.css';

const BOARD_SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const HUMAN = BLACK;
const AI = WHITE;

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const OthelloSquare = ({ value, onClick, isValidMove, row, col }) => {
  const getSquareContent = () => {
    if (value === BLACK) return <div className="piece black-piece"></div>;
    if (value === WHITE) return <div className="piece white-piece"></div>;
    if (isValidMove) return <div className="valid-move-hint"></div>;
    return null;
  };

  return (
    <button 
      className={`othello-square ${isValidMove ? 'valid-move' : ''}`}
      onClick={() => onClick(row, col)}
      disabled={!isValidMove}
    >
      {getSquareContent()}
    </button>
  );
};

const OthelloBoard = ({ board, onMove, validMoves }) => {
  return (
    <div className="othello-board">
      {board.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
          return (
            <OthelloSquare
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onClick={onMove}
              isValidMove={isValidMove}
              row={rowIndex}
              col={colIndex}
            />
          );
        })
      )}
    </div>
  );
};

const Othello = () => {
  const [board, setBoard] = useState(() => {
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    // Initial setup: 4 pieces in the center
    initialBoard[3][3] = WHITE;
    initialBoard[3][4] = BLACK;
    initialBoard[4][3] = BLACK;
    initialBoard[4][4] = WHITE;
    return initialBoard;
  });
  
  const [currentPlayer, setCurrentPlayer] = useState(HUMAN);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ black: 2, white: 2 });
  const [difficulty, setDifficulty] = useState(4);
  const [thinking, setThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('');

  // Game logic functions
  const isValidPosition = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  };

  const getValidMoves = useCallback((board, player) => {
    const validMoves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          // Check if this move would flip any pieces
          let canPlace = false;
          
          for (const [dx, dy] of directions) {
            let x = row + dx;
            let y = col + dy;
            let hasOpponentPiece = false;
            
            // Walk in this direction
            while (isValidPosition(x, y) && board[x][y] === (3 - player)) {
              hasOpponentPiece = true;
              x += dx;
              y += dy;
            }
            
            // If we found opponent pieces and ended with our piece
            if (hasOpponentPiece && isValidPosition(x, y) && board[x][y] === player) {
              canPlace = true;
              break;
            }
          }
          
          if (canPlace) {
            validMoves.push({ row, col });
          }
        }
      }
    }
    
    return validMoves;
  }, []);

  const makeMove = useCallback((board, row, col, player) => {
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;
    
    // Flip pieces in all directions
    for (const [dx, dy] of directions) {
      const toFlip = [];
      let x = row + dx;
      let y = col + dy;
      
      // Collect opponent pieces in this direction
      while (isValidPosition(x, y) && newBoard[x][y] === (3 - player)) {
        toFlip.push([x, y]);
        x += dx;
        y += dy;
      }
      
      // If we end with our piece, flip all collected pieces
      if (isValidPosition(x, y) && newBoard[x][y] === player && toFlip.length > 0) {
        toFlip.forEach(([flipX, flipY]) => {
          newBoard[flipX][flipY] = player;
        });
      }
    }
    
    return newBoard;
  }, []);

  const calculateScore = useCallback((board) => {
    let black = 0, white = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === BLACK) black++;
        else if (board[row][col] === WHITE) white++;
      }
    }
    return { black, white };
  }, []);

  // Minimax with Alpha-Beta Pruning
  const evaluateBoard = useCallback((board) => {
    const score = calculateScore(board);
    let evaluation = score.white - score.black;
    
    // Corner bonus
    const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
    corners.forEach(([row, col]) => {
      if (board[row][col] === WHITE) evaluation += 25;
      else if (board[row][col] === BLACK) evaluation -= 25;
    });
    
    // Edge bonus
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (board[0][i] === WHITE || board[7][i] === WHITE || 
          board[i][0] === WHITE || board[i][7] === WHITE) evaluation += 5;
      if (board[0][i] === BLACK || board[7][i] === BLACK || 
          board[i][0] === BLACK || board[i][7] === BLACK) evaluation -= 5;
    }
    
    // Mobility bonus
    const whiteMoves = getValidMoves(board, WHITE).length;
    const blackMoves = getValidMoves(board, BLACK).length;
    evaluation += (whiteMoves - blackMoves) * 2;
    
    return evaluation;
  }, [calculateScore, getValidMoves]);

  const minimax = useCallback((board, depth, alpha, beta, maximizingPlayer) => {
    const player = maximizingPlayer ? AI : HUMAN;
    const validMoves = getValidMoves(board, player);
    
    if (depth === 0 || validMoves.length === 0) {
      return { evaluation: evaluateBoard(board), move: null };
    }
    
    let bestMove = null;
    
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const newBoard = makeMove(board, move.row, move.col, player);
        const result = minimax(newBoard, depth - 1, alpha, beta, false);
        
        if (result.evaluation > maxEval) {
          maxEval = result.evaluation;
          bestMove = move;
        }
        
        alpha = Math.max(alpha, result.evaluation);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return { evaluation: maxEval, move: bestMove };
    } else {
      let minEval = Infinity;
      for (const move of validMoves) {
        const newBoard = makeMove(board, move.row, move.col, player);
        const result = minimax(newBoard, depth - 1, alpha, beta, true);
        
        if (result.evaluation < minEval) {
          minEval = result.evaluation;
          bestMove = move;
        }
        
        beta = Math.min(beta, result.evaluation);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return { evaluation: minEval, move: bestMove };
    }
  }, [getValidMoves, evaluateBoard, makeMove]);

  const makeAIMove = useCallback(async () => {
    setThinking(true);
    setGameStatus('IA pensando...');
    
    // Add delay to show thinking state
    setTimeout(() => {
      const result = minimax(board, difficulty, -Infinity, Infinity, true);
      
      if (result.move) {
        const newBoard = makeMove(board, result.move.row, result.move.col, AI);
        setBoard(newBoard);
        setScore(calculateScore(newBoard));
        
        const humanMoves = getValidMoves(newBoard, HUMAN);
        if (humanMoves.length > 0) {
          setCurrentPlayer(HUMAN);
          setGameStatus('Tu turno');
        } else {
          const aiMoves = getValidMoves(newBoard, AI);
          if (aiMoves.length === 0) {
            setGameOver(true);
            const finalScore = calculateScore(newBoard);
            if (finalScore.black > finalScore.white) {
              setGameStatus('¡Ganaste!');
            } else if (finalScore.white > finalScore.black) {
              setGameStatus('¡La IA ganó!');
            } else {
              setGameStatus('¡Empate!');
            }
          } else {
            setGameStatus('Sin movimientos válidos. La IA juega de nuevo.');
          }
        }
      }
      
      setThinking(false);
    }, 500);
  }, [board, difficulty, minimax, makeMove, calculateScore, getValidMoves]);

  const handleHumanMove = (row, col) => {
    if (currentPlayer !== HUMAN || gameOver || thinking) return;
    
    const validMoves = getValidMoves(board, HUMAN);
    const isValid = validMoves.some(move => move.row === row && move.col === col);
    
    if (isValid) {
      const newBoard = makeMove(board, row, col, HUMAN);
      setBoard(newBoard);
      setScore(calculateScore(newBoard));
      
      const aiMoves = getValidMoves(newBoard, AI);
      if (aiMoves.length > 0) {
        setCurrentPlayer(AI);
      } else {
        const humanMoves = getValidMoves(newBoard, HUMAN);
        if (humanMoves.length === 0) {
          setGameOver(true);
          const finalScore = calculateScore(newBoard);
          if (finalScore.black > finalScore.white) {
            setGameStatus('¡Ganaste!');
          } else if (finalScore.white > finalScore.black) {
            setGameStatus('¡La IA ganó!');
          } else {
            setGameStatus('¡Empate!');
          }
        } else {
          setGameStatus('Sin movimientos válidos para la IA. Continúa jugando.');
        }
      }
    }
  };

  const resetGame = () => {
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    initialBoard[3][3] = WHITE;
    initialBoard[3][4] = BLACK;
    initialBoard[4][3] = BLACK;
    initialBoard[4][4] = WHITE;
    
    setBoard(initialBoard);
    setCurrentPlayer(HUMAN);
    setGameOver(false);
    setScore({ black: 2, white: 2 });
    setThinking(false);
    setGameStatus('Tu turno');
  };

  // Effect for AI moves
  useEffect(() => {
    if (currentPlayer === AI && !gameOver && !thinking) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, thinking, makeAIMove]);

  // Initialize game status
  useEffect(() => {
    if (gameStatus === '') {
      setGameStatus('Tu turno');
    }
  }, [gameStatus]);

  const validMoves = currentPlayer === HUMAN ? getValidMoves(board, HUMAN) : [];

  return (
    <div className="othello-container">
      <h1 className="othello-title">Othello</h1>
      
      <div className="game-controls">
        <div className="score-display">
          <div className="score-item">
            <div className="piece black-piece small"></div>
            <span>Tú: {score.black}</span>
          </div>
          <div className="score-item">
            <div className="piece white-piece small"></div>
            <span>IA: {score.white}</span>
          </div>
        </div>
        
        <div className="difficulty-selector">
          <label>Dificultad: </label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            disabled={!gameOver && currentPlayer === AI}
          >
            <option value={2}>Fácil</option>
            <option value={4}>Medio</option>
            <option value={6}>Difícil</option>
            <option value={8}>Experto</option>
          </select>
        </div>
      </div>
      
      <div className="game-status">
        {thinking && <div className="thinking-indicator">🤔</div>}
        <span className={gameOver ? 'game-over' : ''}>{gameStatus}</span>
      </div>
      
      <OthelloBoard 
        board={board} 
        onMove={handleHumanMove} 
        validMoves={validMoves}
      />
      
      <div className="game-footer">
        <button className="reset-button" onClick={resetGame}>
          Nuevo Juego
        </button>
      </div>
    </div>
  );
};

export default Othello;