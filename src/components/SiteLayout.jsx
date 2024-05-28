import React from 'react'
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from 'react-router-dom';
const SiteLayout = (props) => {
  return (
    <div className="content">
        <Sidebar/>
        <div className="main-content">
            <Header title={props.title} />
            <div className="content-here">
                <Outlet />
            </div>
        </div>
    </div>
  )
}

export default SiteLayout