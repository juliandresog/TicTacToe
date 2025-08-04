import React, { useState } from 'react';
import './App.css';
import TabNavigation from './TabNavigation';
import TicTacToe from './TicTacToe';
import NewGame from './NewGame';
import Chess from './Chess';

const App = () => {
  const [activeTab, setActiveTab] = useState('tic-tac-toe');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tic-tac-toe':
        return <TicTacToe />;
      case 'new-game':
        return <NewGame />;
      case 'chess':
        return <Chess />;
      default:
        return <TicTacToe />;
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Juegos React</h1>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="app-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default App;