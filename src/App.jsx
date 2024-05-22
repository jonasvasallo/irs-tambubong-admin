import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import NotFoundPage from './pages/NotFoundPage'
import { auth } from './config/firebase'
import { useNavigate } from 'react-router-dom'


function App() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const checkLogin = () => {
      if(auth.currentUser == null){
        navigate('/login');
      }
    }

    checkLogin();
  });
  return (

    <>
      <Routes>
        <Route path='/' element={<DashboardPage />}></Route>
        <Route path='/reports' element={<ReportsPage />}></Route>
        <Route path='/login' element={<LoginPage/>}></Route>
        <Route path='*' element={<NotFoundPage />}></Route>
      </Routes>
    </>
  )
}

export default App
