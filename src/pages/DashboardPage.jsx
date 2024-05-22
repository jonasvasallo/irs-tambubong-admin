import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const DashboardPage = () => {
  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="Dashboard"/>
                <div className="content-here">
                    Dashboard Summary Here
                </div>
            </div>
        </div>
    </>
  )
}

export default DashboardPage