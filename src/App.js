import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TicTacToeIcon from './tic-tac-toe.svg';

const Square = ({ value, onClick, isWinner }) => (
  <button className={`square ${isWinner ? 'winner-square' : ''}`} onClick={onClick}>
    {value}
  </button>
);

const Board = ({ squares, onClick, winningLine }) => (
  <div className="board">
    {squares.map((square, i) => (
      <Square
        key={i}
        value={square}
        onClick={() => onClick(i)}
        isWinner={winningLine.includes(i)}
      />
    ))}
  </div>
);

const Game = () => {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  const currentSquares = history[stepNumber];
  const { winner, line: winningLine } = calculateWinner(currentSquares);

  const handleClick = i => {
    const timeInHistory = history.slice(0, stepNumber + 1);
    const current = timeInHistory[stepNumber];
    const squares = [...current];
    if (winner || squares[i]) return;
    squares[i] = xIsNext ? 'X' : 'O';
    setHistory([...timeInHistory, squares]);
    setStepNumber(timeInHistory.length);
    setXIsNext(!xIsNext);
  };

  const jumpTo = step => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const moves = history.map((_step, move) => {
    const destination = move ? `Go to move #${move}` : 'Go to start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{destination}</button>
      </li>
    );
  });

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (history[stepNumber].every(Boolean)) {
    status = 'Draw';
  } else {
    status = 'Next Player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div className="game-container">
      <h1 className="game-title">Tic-Tac-Toe</h1>
      <div className="game">
        <div className="game-board">
          <Board
            squares={currentSquares}
            onClick={handleClick}
            winningLine={winningLine}
          />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
      <div className="game-footer">
        <img src={TicTacToeIcon} alt="Tic-Tac-Toe Icon" />
      </div>
    </div>
  );
};

const calculateWinner = squares => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: [] };
};

export default Game;
