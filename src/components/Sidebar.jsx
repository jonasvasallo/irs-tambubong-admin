import React from 'react'
import "../styles/sidebar.css";
import logo from "../assets/logo.jpg";
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../core/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const logout = async () => {
        await signOut(auth).then(() => {
            navigate('/login');
        })
    }

    const { user_type, userPermissions } = useAuth();
    return (
        <div className="sidebar">
            <div>
                <div className="sidebar-header">
                    <img src={logo} alt="" width={60} height={60}/>
                    <span className='heading-s color-major'>Tambubong IRS</span>
                </div>
                <div className="sidebar-menu">
                    <Link className='nav-button body-l' to={'/'}>Dashboard</Link>
                    {(userPermissions['view_incidents'] || user_type == 'admin') ? <Link className='nav-button body-l' to={'/reports'}>Reports</Link> : <></>}
                    {(userPermissions['view_emergencies'] || user_type == 'admin') ? <Link className='nav-button body-l' to={'/emergencies'}>Emergencies</Link> : <></>}
                    {(userPermissions['view_complaints'] || user_type == 'admin') ? <Link className='nav-button body-l' to={'/complaints'}>Complaints</Link> : <></>}
                    {(userPermissions['view_news'] || user_type == 'admin') ? <Link className='nav-button body-l' to={'/news'}>News</Link> : <></>}
                    {(userPermissions['view_users'] || user_type == 'admin') ? <Link className='nav-button body-l' to={'/users'}>Users</Link> : <></>}
                    {(userPermissions['view_tickets'] || user_type == 'admin') ? <Link className='nav-button body-l' to={'/tickets'}>Tickets</Link> : <></>}
                    
                </div>
            </div>
            <div className="sidebar-footer">
                <img src={logo} alt="" width={40} height={40}/>
                <div className="user-details">
                    <span className='subheading-m'>USER TYPE:</span>
                    <span className='body-s'>{`${user_type.toUpperCase()}`}</span>
                </div>
                <button className='button outlined' onClick={logout}>Logout</button>
            </div>
        </div>
      )
}

export default Sidebar