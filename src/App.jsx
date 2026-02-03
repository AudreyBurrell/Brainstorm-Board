import './App.css'
import { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Board from './Board'

function App() {

  return (
    <div>
      {/* <h1>App is working!</h1> */}
      <Router>
        <Routes>
          <Route path="/" element={<Board />}/>
        </Routes>
      </Router>
    </div>
    
  )
}

export default App
