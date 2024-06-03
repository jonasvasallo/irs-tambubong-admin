import React from 'react';
import "../styles/modal.css";
import { useModal } from '../core/ModalContext';

const Modal = () => {
    const { modalData, closeModal } = useModal();

    if (!modalData.isOpen) return null;

    return (
        <>
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal">
                <div className="modal-header">
                    <div className="icon">
                        <span className="material-symbols-outlined">{modalData.type}</span>
                    </div>
                    <div>
                        <h2 id="modal-title">{modalData.title}</h2>
                        <p id="modal-description">{modalData.description}</p>
                    </div>
                </div>
                <div className="modal-content">
                    {modalData.content}
                </div>
                <div className="modal-actions">
                    <button className="button outlined negative" onClick={closeModal}>Close</button>
                    {modalData.actions}
                </div>
            </div>
        </>
    );
};

export default Modal;
