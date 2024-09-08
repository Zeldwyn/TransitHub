import React from "react";
import '../pages/styles/style.css';

const ManageUserModal = ({ user, onClose, onUpdate, onDelete }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>User Details</h2>
                    <span className="close-button" onClick={onClose}>&times;</span>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <p>Email: {user.email}</p>
                    <p>Password: {user.password}</p>
                    <p>First Name: {user.firstName}</p>
                    <p>Last Name: {user.lastName}</p>
                    <p>User Type: {user.userType}</p>
                    <p>Date Created: {user.dateCreated}</p>
                </div>
                <div className="button-container">
                    <button
                        className="modal-button"
                        onClick={onUpdate}
                    >
                        Update
                    </button>
                    <button
                        className="modal-button modal-button-delete"
                        onClick={onDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageUserModal;
