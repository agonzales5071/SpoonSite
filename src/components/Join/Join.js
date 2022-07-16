import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './Join.css';

const Join = props => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  useEffect(() => {
    document.body.className ="body-chat";
    //console.log("body should change");
  });
  return (
    <div className='joinOuterContainer'>
      <Link to="/"><button className='back-button'></button></Link>
      <div className='joinInnerContainer'>
        <h1 className='heading'>Join</h1>
        <div><input placeholder='Username' className="joinInput" type="text" onChange={(event) => setName(event.target.value)} /></div>
        <div><input placeholder='Room' className="joinInput mt=20" type="text" onChange={(event) => setRoom(event.target.value)} /></div>
        <Link onClick={event => (!name || !room) ? event.preventDefault() : null } to={`/chat?name=${name}&room=${room}`}>
          <button className="button mt-20" type="submit">Sign In</button>
        </Link>
      </div>

    </div>
  )
}

export default Join;