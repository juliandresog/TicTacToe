# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Tic-Tac-Toe game created with Create React App. The entire game logic is contained in a single component architecture with functional components and React hooks.

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

### Component Structure
The application follows a simple component hierarchy:
- `Game` (main component in `src/App.js`) - Contains all game state and logic
- `Board` - Renders the 3x3 grid of squares
- `Square` - Individual clickable square component
- `calculateWinner` - Pure function for game logic

### State Management
Game state is managed with React hooks in the main Game component:
- `history` - Array of board states for move history
- `stepNumber` - Current step in game history
- `xIsNext` - Boolean for current player turn

### Key Files
- `src/App.js` - Contains the entire game (exported as `Game` component)
- `src/index.js` - Entry point, renders Game component
- `src/Game.test.js` - Basic test for game rendering

## React Version
Uses React 19.1.1 with modern patterns including functional components and hooks. The project structure follows Create React App conventions.