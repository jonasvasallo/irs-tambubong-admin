import React from 'react'
import "../styles/sidebar.css";
import logo from "../assets/logo.jpg";
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const Sidebar = () => {
    const navigate = useNavigate();
    const logout = async () => {
        await signOut(auth).then(() => {
            navigate('/login');
        })
    }
    return (
        <div className="sidebar">
            <div>
                <div className="sidebar-header">
                    <img src={logo} alt="" width={60} height={60}/>
                    <span className='heading-s color-major'>Tambubong IRS</span>
                </div>
                <div className="sidebar-menu">
                    <Link className='nav-button body-l' to={'/'}>Dashboard</Link>
                    <Link className='nav-button body-l' to={'/reports'}>Reports</Link>
                    <Link className='nav-button body-l' to={'/complaints'}>Complaints</Link>
                    <Link className='nav-button body-l' to={'/news'}>News</Link>
                    <Link className='nav-button body-l' to={'/analytics'}>Analytics</Link>
                </div>
            </div>
            <div className="sidebar-footer">
                <img src={logo} alt="" width={40} height={40}/>
                <div className="user-details">
                    <span className='subheading-m'>Jonas Vasallo</span>
                    <span className='body-s'>ADMIN</span>
                </div>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
      )
}

export default Sidebar