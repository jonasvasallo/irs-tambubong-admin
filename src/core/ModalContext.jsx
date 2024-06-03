import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
    return useContext(ModalContext);
};

export const ModalProvider = ({ children }) => {
    const [modalData, setModalData] = useState({
        isOpen: false,
        title: '',
        description: '',
        content: '',
        type: '',
        actions: null,
    });

    const openModal = (title, description, content, type, actions) => {
        document.body.classList.add('open');
        setModalData({
            isOpen: true,
            title,
            description,
            content,
            type,
            actions,
        });
    };

    const closeModal = () => {
        document.body.classList.remove('open');
        setModalData(prevState => ({ ...prevState, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ modalData, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};
