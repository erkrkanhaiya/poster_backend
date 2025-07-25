import React, { useState } from 'react';
import Login from './pages/Login';
import Category from './pages/Category';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    isLoggedIn ? <Category /> : <Login onLogin={() => setIsLoggedIn(true)} />
  );
}

export default App;
