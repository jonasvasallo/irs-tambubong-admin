import React from 'react'
import "../styles/header.css";
import Modal from './Modal';


const Header = (props) => {
  return (
    <>
      <div className='header'>
        <span className='header-title heading-m color-major'>{props.title}</span>
        <div className="actions">
            <button>Action 1</button>
            <button>Action 2</button>
        </div>
      </div>
      <Modal />
    </>
  )
}

export default Header