import React from 'react';
import { Link } from 'react-router-dom';
import './socials.css';
class Socials extends React.Component {
    componentDidMount(){
      document.body.className="body-socials"; // Or set the class
      console.log("socials mounted");
    }
    componentWillUnmount(){
      document.body.className ="body";
    }
    render(){
      return (
        <><div id="app">
              <div id="star-container">
                  <div id="star-pattern"></div>
                  <div id="star-gradient-overlay"></div>
              </div>
              <div id="stripe-container">
                  <div id="stripe-pattern"></div>
              </div>

              <div id="modal-wrapper">
                  <div id="modal">
                      <div id="modal-background"></div>
                      <div id="modal-content">
                          <div id="modal-message">
                              <p class="sixty-four-font">Follow Me</p>
                          </div>
                          <div id="modal-actions">
                              <button type="button" class="modal-action">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade"></div>
                                  <span class="modal-action-text inter-font">Back</span>
                              </button>
                              <button type="button" class="modal-action" id="instagram">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade"></div>
                                  <span class="modal-action-text inter-font">Instagram</span>
                              </button>
                              <button type="button" class="modal-action" id="youtube">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade"></div>
                                  <span class="modal-action-text inter-font">Youtube</span>
                              </button>
                              <button type="button" class="modal-action" id="facebook">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade"></div>
                                  <span class="modal-action-text inter-font">Facebook</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div><div id="magic-mouse-container"></div><div id="cursor">
                  <img
                      src="https://assets.codepen.io/1468070/Arrow+-+Cursor.png"
                      alt="Arrow Cursor" />
                  <div id="cursor-eyes">
                      <div class="cursor-eye"></div>
                      <div class="cursor-eye"></div>
                  </div>
              </div></>
        );
      }
  }

  export default Socials;