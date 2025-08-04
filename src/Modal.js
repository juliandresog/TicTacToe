import React, { useState, useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, tests, title }) => {
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    if (tests.length > 0 && !selectedValue) {
      setSelectedValue(tests[0].id);
    }
  }, [tests, selectedValue]);

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleAlertClick = () => {
    alert(`Valor elegido: ${selectedValue}`);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{title}</h2>
        <select value={selectedValue} onChange={handleSelectChange}>
          {tests.length > 0 ? (
            tests.map(test => (
              <option key={test.id} value={test.id}>
                {test.label}
              </option>
            ))
          ) : (
            <option value="">Loading...</option>
          )}
        </select>
        {selectedValue && (
          <p className="selected-value-label">Valor seleccionado: <strong>{selectedValue}</strong></p>
        )}
        <button onClick={handleAlertClick}>Consultar</button>
      </div>
    </div>
  );
};

export default Modal;
