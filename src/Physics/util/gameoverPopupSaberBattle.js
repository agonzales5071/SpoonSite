import { Link } from 'react-router-dom';
import '../spoondrop.css';

const GameOver = ({ message, scoreText, visible, onRestart, playButtonText, darkSideVisible, onRestartDarkSide, mobile}) => {
  return (
    

      <div id="sd-modal-wrapper"
      style={{ display: visible ? "flex" : "none" }} >
        <div id="sd-modal">
          <div id="sd-modal-background"></div>
          <div id="sd-modal-content">
            <div id="sd-modal-message">
              <p className="sd-message">{message}</p>
              <p className="sd-score-text">{scoreText}</p>
            </div>
            <div id="sd-modal-actions"
            style={{flexDirection: darkSideVisible&&mobile ? "column" : "row"}}>
              <button 
                type="button" 
                className="sd-modal-action" 
                id="restart-action"
                onClick={onRestart}
              >
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">{playButtonText}</span>
                
              </button>
              <button 
                type="button" 
                className="sd-modal-action" 
                id="darkside-action"
                onClick={onRestartDarkSide}
                style={{ display: darkSideVisible ? "flex" : "none" }}
              >
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade" id="darkside-action-fade"></div>
                  <span className="darkside-modal-action-text inter-font">Dark Side</span>
                
              </button>
                <Link to="/spoondropMenu" className="sd-modal-link">
              <button type="button" className="sd-modal-action" id="game-menu-action">
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">Back</span>
              </button>
                </Link>
            </div>
          </div>
        </div>
      </div>
  );
}

export default GameOver;