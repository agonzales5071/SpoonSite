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
                      <button type="button" class="modal-action" id="home-action">
                              <Link to="/" class="modal-link">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade" ></div>
                                  <span class="modal-action-text inter-font">Home</span>
                              </Link>
                              </button>
                          <div id="modal-message">
                              <p class="sixty-four-font">Follow Me</p>
                          </div>
                          <div id="modal-actions">
                            
                              <button type="button" class="modal-action" id="instagram-action">
                              <a href="https://www.instagram.com/alex_gonzzzzz/" class="modal-link">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade" id="instagram-action-fade"></div>
                                  <span class="modal-action-text inter-font">Instagram</span>
                              </a>
                              </button>
                              <button type="button" class="modal-action" id="youtube-action">
                              <a href="https://www.youtube.com/@droppedspoon" class="modal-link">
                                  <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade" id="youtube-action-fade"></div>
                                  <span class="modal-action-text inter-font">Youtube</span>
                              </a>
                              </button>
                              <button type="button" class="modal-action" id="facebook-action">
                              <a href="https://www.facebook.com/alex.gonzzzzz/
                              " class="modal-link">
                              <div class="modal-action-pattern"></div>
                                  <div class="modal-action-fade" id="facebook-action-fade"></div>
                                  <span class="modal-action-text inter-font">Facebook</span>
                              </a>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          </>
        );
      }
  }

  export default Socials;