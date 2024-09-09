import React, { useState } from "react";
import '../pages/styles/style.css'; 

const UpdateUserModal = ({ user, onClose, onSave }) => {
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState(user.password);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);

    const handleSave = () => {
        const updatedUser = {
            ...user,
            email,
            password,
            firstName,
            lastName
        };
        onSave(updatedUser);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Update User</h2>
                    <span className="close-button" onClick={onClose}>&times;</span>
                </div>
                <div className="modal-body">
                    <div className="input-group">
                        <label>Email:</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>First Name:</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>
                <div className="button-container">
                    <button
                        className="modal-button"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateUserModal;
