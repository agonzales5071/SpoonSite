import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../spoondrop.css';

const GameOver = ({ message, score, visible, onRestart }) => {
  return (
    

      <div id="sd-modal-wrapper"
      style={{ display: visible ? "flex" : "none" }} >
        <div id="sd-modal">
          <div id="sd-modal-background"></div>
          <div id="sd-modal-content">
            <div id="sd-modal-message">
              <p className="sixty-four-font">{message}</p>
              <p className="sixty-four-font">Score: {score}</p>
            </div>
            <div id="sd-modal-actions">
              <button 
                type="button" 
                className="sd-modal-action" 
                id="restart-action"
                onClick={onRestart}
              >
                <div className="sd-modal-link">
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">Restart</span>
                </div>
              </button>
              <button type="button" className="sd-modal-action" id="game-menu-action">
                <Link to="/spoondropMenu" className="sd-modal-link">
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">Back</span>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default GameOver;