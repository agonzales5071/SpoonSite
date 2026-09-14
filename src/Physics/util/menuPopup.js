import '../spoondrop.css';

const Popup = ({ visible, closePopup }) => {
  return (
      <div id="sd-modal-wrapper"
      style={{ display: visible ? "flex" : "none" }} >
        <div id="sd-modal">
          <div id="sd-modal-background"></div>
          <div id="sd-modal-content">
            <div id="sd-modal-message">
              <p className="sd-message" >Click or tap anywhere and let go to drop a spoon.</p>
              <p className="sd-message" >Drop the spoon in a bucket to navigate to the corresponding page.</p>
              <p className="sd-message" >On mobile, add this site to your homescreen for best experience.</p>
            </div>
            <div id="sd-modal-actions">
              <button 
                type="button" 
                className="sd-modal-action" 
                id="restart-action"
                onClick={closePopup}
              >
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">I understand</span>
                
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Popup;