import React from 'react'
import '../styles/input.css';

export const InputButton = (props) => {
  return (
    <button type={props.type} className={`button ${props.buttonType} w-100`} onClick={props.onClick}>{props.label}</button>
  )
}
