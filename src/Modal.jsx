import React from "react";
import './Modal.css';

const Modal = ({ children, setIsOpen, title }) => {
  return (
    <>
      <div className="darkBG" onClick={() => setIsOpen(false)} />
      <div className="centered">
        <div className="modal">
          <div className="modalHeader">
            <h5 className="heading"> { title } </h5>
          </div>
          <button className="closeBtn" onClick={() => setIsOpen(false)}>
            <b>X</b>
          </button>
          <div className="modalContent">
            { children }
          </div>

          { /*
          <div className="modalActions">
            <div className="actionsContainer">
              <button className="deleteBtn" onClick={() => setIsOpen(false)}>
                Delete
              </button>
              <button
                className="cancelBtn"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
            */}
        </div>
      </div>
    </>
  );
};

export default Modal;
