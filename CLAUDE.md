# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based gaming application created with Create React App featuring three classic board games: Tic-Tac-Toe, Othello, and Chess. The application uses a tabbed interface to switch between games, with modern React patterns including functional components and hooks.

React versión 19.1.1

## Development Commands

### Core Commands
- `npm start` - Start development server on http://localhost:3000
- `npm test` - Run tests in interactive watch mode
- `npm run build` - Build production bundle
- `npm run eject` - Eject from Create React App (irreversible)

### Testing
- Tests use React Testing Library with Jest
- Test files follow the pattern `*.test.js`
- Run single test: `npm test -- --testNamePattern="test name"`
- Run tests for specific file: `npm test Game.test.js`

## Code Architecture

### Application Structure
The application uses a tabbed interface with the following hierarchy:
- `App` (main component in `src/App.js`) - Main app container with tab navigation
- `TabNavigation` - Tab switching component
- `TicTacToe` - Complete Tic-Tac-Toe game component
- `NewGame` - Othello game component (despite the name)
- `Chess` - Complete Chess game component with AI opponent
- `Modal` - Shared modal component for additional features

### Game Components

#### Tic-Tac-Toe (`src/TicTacToe.js`)
- `Board` - Renders the 3x3 grid of squares
- `Square` - Individual clickable square component
- `calculateWinner` - Pure function for game logic
- State management with React hooks for game history and moves

#### Othello (`src/NewGame.js`)
- `OthelloBoard` - Renders the 8x8 game board
- `OthelloSquare` - Individual board square with piece rendering
- Advanced AI with Minimax algorithm and Alpha-Beta pruning
- Multiple difficulty levels (Easy to Expert)
- Complete game logic including move validation and piece flipping

#### Chess (`src/Chess.js`)
- `ChessBoard` - Renders the 8x8 chess board with proper square coloring
- `ChessSquare` - Individual board square with Unicode chess piece symbols
- Full chess rule implementation including all piece movements
- AI opponent with Minimax algorithm and Alpha-Beta pruning
- Multiple difficulty levels (Easy to Expert)
- Check and checkmate detection
- Captured pieces tracking
- Move validation and legal move highlighting

### State Management
- **Tic-Tac-Toe**: Uses `history`, `stepNumber`, and `xIsNext` for game state
- **Othello**: Uses `board`, `currentPlayer`, `score`, and `gameOver` for game state
- **Chess**: Uses `board`, `currentPlayer`, `selectedSquare`, `validMoves`, `gameOver`, `winner`, `thinking`, `capturedPieces`, and `difficulty` for complete chess game state
- **App**: Uses `activeTab` to manage which game is currently displayed ('tic-tac-toe', 'new-game', 'chess')

### Key Files
- `src/App.js` - Main application component with tab management
- `src/TabNavigation.js` - Tab navigation component
- `src/TicTacToe.js` - Complete Tic-Tac-Toe game
- `src/NewGame.js` - Complete Othello game with AI
- `src/Chess.js` - Complete Chess game with AI opponent
- `src/Modal.js` - Shared modal component
- `src/App.css` - Global styles and CSS variables
- `src/TicTacToe.css` - Tic-Tac-Toe specific styles
- `src/NewGame.css` - Othello specific styles
- `src/Chess.css` - Chess specific styles
- `src/TabNavigation.css` - Tab navigation styles
- `src/Modal.css` - Modal component styles
- `src/index.js` - Entry point, renders App component
- `src/Game.test.js` - Basic test for game rendering

### AI Implementation

#### Othello AI
The Othello game features sophisticated AI:
- **Minimax Algorithm** with Alpha-Beta pruning for optimal move calculation
- **Position Evaluation** with strategic bonuses for corners and edges
- **Mobility Analysis** considering future move options
- **Difficulty Scaling** from depth 2 (Easy) to depth 8 (Expert)

#### Chess AI  
The Chess game features advanced AI:
- **Minimax Algorithm** with Alpha-Beta pruning for optimal move selection
- **Position Evaluation** considering piece values, positional bonuses, and center control
- **Legal Move Validation** with check and checkmate detection
- **Piece Value System** with standard chess piece valuations
- **Advanced Features**: Pawn advancement bonuses, center control evaluation, mobility analysis
- **Difficulty Scaling** from depth 2 (Easy) to depth 5 (Expert)

### Styling
- Uses CSS custom properties for consistent theming
- Responsive design that works on desktop and mobile
- Smooth animations and transitions
- Dark theme with cyan accent colors

## React Version
Uses React 19.1.1 with modern patterns including functional components, hooks (useState, useEffect, useCallback), and follows Create React App conventions.