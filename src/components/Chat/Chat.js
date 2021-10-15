import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import './Chat.css';

import UserContainer from '../UserContainer/UserContainer';
import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
import SyncPlayer from '../Player/SyncPlayer';

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [playerURL, setPlayerURL]= useState('');
  const [videoCode, setVideoCode] = useState('');
  const [playerState, setPlayerState] = useState('');
  const ENDPOINT = 'localhost:5000'; //local testing
  //const ENDPOINT = 'https://spoonchathost.herokuapp.com/';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
  
    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    socket.emit('join', { name, room,}, () => {
      
      });
    //console.log(socket);

    return () => {
      socket.emit('disconnect');

      socket.off();
    }
}, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ]);
    });
    
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on('videoCode', videoCode => {
      setVideoCode(videoCode);
      console.log('video id= ', videoCode);
    });

    socket.on('playerState', ({ newState, username }) => {
        setPlayerState(newState);
        console.log("state changed to ", newState, " by ", username);
        
    });

}, []);
  
  

  //function to send messages
  const sendMessage =(event) => {
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }
//code to send youtube url to room
  const sendCode =(event) =>{
    event.preventDefault();
    console.log("pls send code")
    if(playerURL){
      if(playerURL.split("v=").length === 1){
        event.preventDefault();
        console.log("playerURL=", playerURL);
      }
      else{
      var code = playerURL.split("v=")[1].split("&")[0];
      console.log("pls emit-- code:", code);
      socket.emit('sendCode', code);
      }
    }
  }

  //code to change state of players in room
  const onPlayerStateChange = (event) => {
    
    socket.emit('playerStateChange', event.data);
    console.log("state has changed locally to ", event.data);
  }

  return (
    <div className="outerContainer">
      <SyncPlayer code={videoCode} setPlayerURL={setPlayerURL} sendCode={sendCode} onPlayerStateChange={onPlayerStateChange} playerState={playerState}/>
      <div className="container">
        
        <InfoBar room={room}/>
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
      </div>
      <UserContainer users={users}/>
    </div>
  )
}

export default Chat;