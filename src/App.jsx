import './App.css'
import { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Board from './Board'
import Login from './Login'

function App() {

  return (
    <div>
      {/* <h1>App is working!</h1> */}
      <Router>
        <Routes>
          <Route path="/" element={<Board />}/>
          <Route path="/Login" element={<Login />} />
        </Routes>
      </Router>
    </div>
    
  )
}

export default App
