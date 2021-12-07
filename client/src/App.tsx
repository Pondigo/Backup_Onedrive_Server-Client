import axios from 'axios';
import './App.css';
import React, { useState } from 'react'

function App() {

  var [textToSearch, setTextToSearch] = useState('')
  var [velocityToDowload, setVelocityToDowload] = useState('332')
  // onClick of startSession_button
  const loginFunction = (e: any) => {

    axios.get("http://localhost:3001/getAuthURL").then(res => {
      console.log(res.data.url)
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    })
  }
  const startMap = (e: any) => {
    axios.post(`http://localhost:3001/mapFilesOnedrive`, { address: textToSearch })
      .then(res => {
        console.log(res);
        //console.log(res.data);
      })
  }
  const startDownload = (e: any) => {
    axios.post(`http://localhost:3001/startDownload`, { address: textToSearch,velocity: velocityToDowload })
      .then(res => {
        console.log(res);
        //console.log(res.data);
      })
  }

  

  return (
    <div className="App">
      <header className="App-header">
        <button className="startSession_button" onClick={loginFunction}>Inicia session</button>
        <input type="text" id='inputText' className='searchInput' placeholder='Path where download' onChange={(e) => setTextToSearch(e.target.value)} />
        <button onClick={startMap}>Map</button>
        <input type="text" id='inputText' className='searchInput' placeholder='Velocity to download in ms, default 332ms' onChange={(e) => setVelocityToDowload(e.target.value)} />
        <button onClick={startDownload}>Download</button>
      </header>
    </div>
  );
}

export default App;
