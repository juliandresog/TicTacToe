import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, tests }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Select a Test</h2>
        <select>
          {tests.length > 0 ? (
            tests.map(test => (
              <option key={test.id} value={test.id}>
                {test.label}
              </option>
            ))
          ) : (
            <option>Loading...</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default Modal;
