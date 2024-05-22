import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/'></Route>
        <Route path='/login' element={<LoginPage/>}></Route>
      </Routes>
    </>
  )
}

export default App
