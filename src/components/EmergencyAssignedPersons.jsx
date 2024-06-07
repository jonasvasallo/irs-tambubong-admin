import React from 'react'

const EmergencyAssignedPersons = () => {
  return (
    <div id="responders-container">
    <div className="flex main-between">
      <span className="subheading-m">Assigned Responders</span>
      <button className="button text">Add</button>
    </div>
    <div className="flex col gap-8">
      <div className="flex main-between">
        <div className="flex gap-8">
          <img src="" alt="" width={40} height={40}/>
          <div className="flex col">
            <span className="body-m">Full Name</span>
            <span className="body-m color-minor">09184639221</span>
          </div>
        </div>
        <button className="button filled">Remove</button>
      </div>
    </div>
  </div>
  )
}

export default EmergencyAssignedPersons