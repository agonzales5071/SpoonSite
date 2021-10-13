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
  //const ENDPOINT = 'localhost:5000'; //local testing
  const ENDPOINT = 'https://spoonchathost.herokuapp.com/';

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

    socket.on('playerURL', playerURL => {
      setPlayerURL(playerURL);
    })
}, []);
  

  //function to send messages
  const sendMessage =(event) => {
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }

  const sendURL =(event) =>{
    event.preventDefault();

    if(playerURL){
      socket.emit('sendURL', playerURL);
    }
  }

  console.log(message, messages);

  return (
    <div className="outerContainer">
      <SyncPlayer setPlayerURL={setPlayerURL} sendURL={sendURL}/>
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