import React from 'react'

const ChangeUserType = () => {
  return (
    <div className='flex col gap-8'>
        <select name="" id="" className="dropdown">
            <option value="" selected disabled>Select a tag</option>
            <option value="Tanod">Tanod</option>
            <option value="Resident">Resident</option>
        </select>
        <button className="button filled">Update</button>
    </div>
  )
}

export default ChangeUserType