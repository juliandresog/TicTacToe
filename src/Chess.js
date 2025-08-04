import React, { useState, useEffect, useCallback } from 'react';
import './Chess.css';

// Chess piece constants
const EMPTY = null;
const WHITE = 'white';
const BLACK = 'black';
const HUMAN = WHITE;
const AI = BLACK;

// Piece types
const PAWN = 'pawn';
const ROOK = 'rook';
const KNIGHT = 'knight';
const BISHOP = 'bishop';
const QUEEN = 'queen';
const KING = 'king';

// Piece Unicode symbols
const pieceSymbols = {
  [WHITE]: {
    [KING]: '♔',
    [QUEEN]: '♕',
    [ROOK]: '♖',
    [BISHOP]: '♗',
    [KNIGHT]: '♘',
    [PAWN]: '♙'
  },
  [BLACK]: {
    [KING]: '♚',
    [QUEEN]: '♛',
    [ROOK]: '♜',
    [BISHOP]: '♝',
    [KNIGHT]: '♞',
    [PAWN]: '♟'
  }
};

// Piece values for evaluation
const pieceValues = {
  [PAWN]: 100,
  [KNIGHT]: 320,
  [BISHOP]: 330,
  [ROOK]: 500,
  [QUEEN]: 900,
  [KING]: 20000
};

const ChessSquare = ({ piece, isLight, onClick, isSelected, isValidMove, position }) => {
  const squareClass = `chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''}`;
  
  return (
    <button 
      className={squareClass}
      onClick={onClick}
    >
      {piece && (
        <span className={`chess-piece ${piece.color}`}>
          {pieceSymbols[piece.color][piece.type]}
        </span>
      )}
      {isValidMove && !piece && <div className="move-hint"></div>}
    </button>
  );
};

const ChessBoard = ({ board, onSquareClick, selectedSquare, validMoves }) => {
  return (
    <div className="chess-board">
      {board.map((row, rowIndex) => 
        row.map((piece, colIndex) => {
          const position = { row: rowIndex, col: colIndex };
          const isLight = (rowIndex + colIndex) % 2 === 0;
          const isSelected = selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex;
          const isValidMove = validMoves.some(move => move.to.row === rowIndex && move.to.col === colIndex);
          
          return (
            <ChessSquare
              key={`${rowIndex}-${colIndex}`}
              piece={piece}
              isLight={isLight}
              onClick={() => onSquareClick(position)}
              isSelected={isSelected}
              isValidMove={isValidMove}
              position={position}
            />
          );
        })
      )}
    </div>
  );
};

const Chess = () => {
  const [board, setBoard] = useState(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(HUMAN);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('Tu turno');
  const [difficulty, setDifficulty] = useState(3);
  const [capturedPieces, setCapturedPieces] = useState({ [WHITE]: [], [BLACK]: [] });

  function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
    
    // Place pawns
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: PAWN, color: BLACK };
      board[6][col] = { type: PAWN, color: WHITE };
    }
    
    // Place other pieces
    const backRow = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK];
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: backRow[col], color: BLACK };
      board[7][col] = { type: backRow[col], color: WHITE };
    }
    
    return board;
  }

  const isValidPosition = (row, col) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const getPieceAt = (board, position) => {
    return board[position.row][position.col];
  };

  const isEnemyPiece = (piece, color) => {
    return piece && piece.color !== color;
  };

  const isFriendlyPiece = (piece, color) => {
    return piece && piece.color === color;
  };

  const getValidMovesForPiece = useCallback((board, from, piece) => {
    const moves = [];
    const { row, col } = from;
    const { type, color } = piece;

    switch (type) {
      case PAWN: {
        const direction = color === WHITE ? -1 : 1;
        const startRow = color === WHITE ? 6 : 1;
        
        // Move forward one square
        if (isValidPosition(row + direction, col) && !getPieceAt(board, { row: row + direction, col })) {
          moves.push({ from, to: { row: row + direction, col } });
          
          // Move forward two squares from starting position
          if (row === startRow && !getPieceAt(board, { row: row + 2 * direction, col })) {
            moves.push({ from, to: { row: row + 2 * direction, col } });
          }
        }
        
        // Capture diagonally
        [-1, 1].forEach(offset => {
          const newCol = col + offset;
          if (isValidPosition(row + direction, newCol)) {
            const targetPiece = getPieceAt(board, { row: row + direction, col: newCol });
            if (isEnemyPiece(targetPiece, color)) {
              moves.push({ from, to: { row: row + direction, col: newCol } });
            }
          }
        });
        break;
      }
      
      case ROOK: {
        // Horizontal and vertical moves
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        directions.forEach(([dRow, dCol]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            if (!isValidPosition(newRow, newCol)) break;
            
            const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
            if (!targetPiece) {
              moves.push({ from, to: { row: newRow, col: newCol } });
            } else {
              if (isEnemyPiece(targetPiece, color)) {
                moves.push({ from, to: { row: newRow, col: newCol } });
              }
              break;
            }
          }
        });
        break;
      }
      
      case BISHOP: {
        // Diagonal moves
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        directions.forEach(([dRow, dCol]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            if (!isValidPosition(newRow, newCol)) break;
            
            const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
            if (!targetPiece) {
              moves.push({ from, to: { row: newRow, col: newCol } });
            } else {
              if (isEnemyPiece(targetPiece, color)) {
                moves.push({ from, to: { row: newRow, col: newCol } });
              }
              break;
            }
          }
        });
        break;
      }
      
      case QUEEN: {
        // Combination of rook and bishop moves
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        directions.forEach(([dRow, dCol]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            if (!isValidPosition(newRow, newCol)) break;
            
            const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
            if (!targetPiece) {
              moves.push({ from, to: { row: newRow, col: newCol } });
            } else {
              if (isEnemyPiece(targetPiece, color)) {
                moves.push({ from, to: { row: newRow, col: newCol } });
              }
              break;
            }
          }
        });
        break;
      }
      
      case KNIGHT: {
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (isValidPosition(newRow, newCol)) {
            const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
            if (!targetPiece || isEnemyPiece(targetPiece, color)) {
              moves.push({ from, to: { row: newRow, col: newCol } });
            }
          }
        });
        break;
      }
      
      case KING: {
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        kingMoves.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (isValidPosition(newRow, newCol)) {
            const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
            if (!targetPiece || isEnemyPiece(targetPiece, color)) {
              moves.push({ from, to: { row: newRow, col: newCol } });
            }
          }
        });
        break;
      }
    }
    
    return moves;
  }, []);

  const getAllValidMoves = useCallback((board, color) => {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const pieceMoves = getValidMovesForPiece(board, { row, col }, piece);
          moves.push(...pieceMoves);
        }
      }
    }
    return moves;
  }, [getValidMovesForPiece]);

  const makeMove = useCallback((board, move) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.row][move.from.col];
    const capturedPiece = newBoard[move.to.row][move.to.col];
    
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = EMPTY;
    
    return { board: newBoard, capturedPiece };
  }, []);

  const evaluateBoard = useCallback((board) => {
    let score = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceValue = pieceValues[piece.type];
          if (piece.color === AI) {
            score += pieceValue;
          } else {
            score -= pieceValue;
          }
          
          // Add positional bonuses
          if (piece.type === PAWN) {
            if (piece.color === AI) {
              score += (6 - row) * 10; // Advance pawns
            } else {
              score -= (row - 1) * 10;
            }
          }
          
          // Center control bonus
          if ((row === 3 || row === 4) && (col === 3 || col === 4)) {
            if (piece.color === AI) {
              score += 30;
            } else {
              score -= 30;
            }
          }
        }
      }
    }
    
    // Mobility bonus
    const aiMoves = getAllValidMoves(board, AI).length;
    const humanMoves = getAllValidMoves(board, HUMAN).length;
    score += (aiMoves - humanMoves) * 10;
    
    return score;
  }, [getAllValidMoves]);

  const isKingInCheck = useCallback((board, color) => {
    // Find king position
    let kingPos = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === KING && piece.color === color) {
          kingPos = { row, col };
          break;
        }
      }
    }
    
    if (!kingPos) return false;
    
    // Check if any enemy piece can attack the king
    const enemyColor = color === WHITE ? BLACK : WHITE;
    const enemyMoves = getAllValidMoves(board, enemyColor);
    
    return enemyMoves.some(move => 
      move.to.row === kingPos.row && move.to.col === kingPos.col
    );
  }, [getAllValidMoves]);

  const isCheckmate = useCallback((board, color) => {
    if (!isKingInCheck(board, color)) return false;
    
    const moves = getAllValidMoves(board, color);
    
    // Check if any move can get out of check
    for (const move of moves) {
      const { board: newBoard } = makeMove(board, move);
      if (!isKingInCheck(newBoard, color)) {
        return false;
      }
    }
    
    return true;
  }, [getAllValidMoves, makeMove, isKingInCheck]);

  const minimax = useCallback((board, depth, alpha, beta, maximizingPlayer) => {
    const playerColor = maximizingPlayer ? AI : HUMAN;
    
    if (depth === 0) {
      return { evaluation: evaluateBoard(board), move: null };
    }
    
    if (isCheckmate(board, playerColor)) {
      return { evaluation: maximizingPlayer ? -50000 : 50000, move: null };
    }
    
    const moves = getAllValidMoves(board, playerColor);
    if (moves.length === 0) {
      return { evaluation: 0, move: null }; // Stalemate
    }
    
    let bestMove = null;
    
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const { board: newBoard } = makeMove(board, move);
        if (!isKingInCheck(newBoard, AI)) {
          const result = minimax(newBoard, depth - 1, alpha, beta, false);
          if (result.evaluation > maxEval) {
            maxEval = result.evaluation;
            bestMove = move;
          }
          alpha = Math.max(alpha, result.evaluation);
          if (beta <= alpha) break;
        }
      }
      return { evaluation: maxEval, move: bestMove };
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const { board: newBoard } = makeMove(board, move);
        if (!isKingInCheck(newBoard, HUMAN)) {
          const result = minimax(newBoard, depth - 1, alpha, beta, true);
          if (result.evaluation < minEval) {
            minEval = result.evaluation;
            bestMove = move;
          }
          beta = Math.min(beta, result.evaluation);
          if (beta <= alpha) break;
        }
      }
      return { evaluation: minEval, move: bestMove };
    }
  }, [evaluateBoard, isCheckmate, getAllValidMoves, makeMove, isKingInCheck]);

  const makeAIMove = useCallback(async () => {
    setThinking(true);
    setGameStatus('IA pensando...');
    
    setTimeout(() => {
      const result = minimax(board, difficulty, -Infinity, Infinity, true);
      
      if (result.move) {
        const { board: newBoard, capturedPiece } = makeMove(board, result.move);
        setBoard(newBoard);
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [AI]: [...prev[AI], capturedPiece]
          }));
        }
        
        if (isCheckmate(newBoard, HUMAN)) {
          setGameOver(true);
          setWinner(AI);
          setGameStatus('¡La IA ganó! Jaque mate');
        } else if (isKingInCheck(newBoard, HUMAN)) {
          setGameStatus('Jaque. Tu turno');
          setCurrentPlayer(HUMAN);
        } else {
          setGameStatus('Tu turno');
          setCurrentPlayer(HUMAN);
        }
      }
      
      setThinking(false);
    }, 1000);
  }, [board, difficulty, minimax, makeMove, isCheckmate, isKingInCheck]);

  const handleSquareClick = (position) => {
    if (currentPlayer !== HUMAN || gameOver || thinking) return;
    
    if (!selectedSquare) {
      // Select a piece
      const piece = getPieceAt(board, position);
      if (piece && piece.color === HUMAN) {
        setSelectedSquare(position);
        const moves = getValidMovesForPiece(board, position, piece).filter(move => {
          const { board: testBoard } = makeMove(board, move);
          return !isKingInCheck(testBoard, HUMAN);
        });
        setValidMoves(moves);
      }
    } else {
      // Try to make a move
      const moveToMake = validMoves.find(move => 
        move.to.row === position.row && move.to.col === position.col
      );
      
      if (moveToMake) {
        const { board: newBoard, capturedPiece } = makeMove(board, moveToMake);
        setBoard(newBoard);
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [HUMAN]: [...prev[HUMAN], capturedPiece]
          }));
        }
        
        if (isCheckmate(newBoard, AI)) {
          setGameOver(true);
          setWinner(HUMAN);
          setGameStatus('¡Ganaste! Jaque mate');
        } else if (isKingInCheck(newBoard, AI)) {
          setGameStatus('IA en jaque');
          setCurrentPlayer(AI);
        } else {
          setCurrentPlayer(AI);
        }
      } else {
        // Deselect or select new piece
        const piece = getPieceAt(board, position);
        if (piece && piece.color === HUMAN) {
          setSelectedSquare(position);
          const moves = getValidMovesForPiece(board, position, piece).filter(move => {
            const { board: testBoard } = makeMove(board, move);
            return !isKingInCheck(testBoard, HUMAN);
          });
          setValidMoves(moves);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer(HUMAN);
    setSelectedSquare(null);
    setValidMoves([]);
    setGameOver(false);
    setWinner(null);
    setThinking(false);
    setGameStatus('Tu turno');
    setCapturedPieces({ [WHITE]: [], [BLACK]: [] });
  };

  // Effect for AI moves
  useEffect(() => {
    if (currentPlayer === AI && !gameOver && !thinking) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, thinking, makeAIMove]);

  return (
    <div className="chess-container">
      <h1 className="chess-title">Ajedrez</h1>
      
      <div className="game-controls">
        <div className="captured-pieces">
          <div className="captured-section">
            <span>Capturadas por ti:</span>
            <div className="captured-list">
              {capturedPieces[HUMAN].map((piece, index) => (
                <span key={index} className="captured-piece">
                  {pieceSymbols[piece.color][piece.type]}
                </span>
              ))}
            </div>
          </div>
          <div className="captured-section">
            <span>Capturadas por IA:</span>
            <div className="captured-list">
              {capturedPieces[AI].map((piece, index) => (
                <span key={index} className="captured-piece">
                  {pieceSymbols[piece.color][piece.type]}
                </span>
              ))}
            </div>
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
            <option value={3}>Medio</option>
            <option value={4}>Difícil</option>
            <option value={5}>Experto</option>
          </select>
        </div>
      </div>
      
      <div className="game-status">
        {thinking && <div className="thinking-indicator">🤔</div>}
        <span className={gameOver ? 'game-over' : ''}>{gameStatus}</span>
      </div>
      
      <ChessBoard 
        board={board} 
        onSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
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

export default Chess;