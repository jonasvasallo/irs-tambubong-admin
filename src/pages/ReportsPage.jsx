import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const ReportsPage = () => {
  return (
    <div className="content">
    <Sidebar />
    <div className="main-content">
        <Header title="Reported Incidents"/>
        <div className="content-here">
            Incidents Here
        </div>
    </div>
</div>
  )
}

export default ReportsPage