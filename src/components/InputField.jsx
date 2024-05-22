import React from 'react'
import '../styles/input.css';
import { useState } from 'react';

export const InputField = (props) => {
    const [focused, setFocus] = useState(false);

    const handleFocus = (e) => {
        if (!focused) {
            setFocus(true);
        }
    };

  return (
    <div className='input-field'>
        <label htmlFor="" className='body-l'>{props.label}</label>
        <input name={props.name} type={props.type} id={props.id} onChange={e=>props.onChange(e.target.value)} placeholder={props.placeholder} pattern={props.pattern} required onBlur={handleFocus} focused={focused.toString()}
        onFocus={(props.last != null && props.last === true) ? handleFocus : undefined} />
        <span id='msgError'>{props.msgError}</span>
    </div>
  )
}
