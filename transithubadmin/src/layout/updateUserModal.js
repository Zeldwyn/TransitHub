import React, { useState } from "react";
import config from '../config'; // Import the config file
import '../pages/styles/style.css'; 

const UpdateUserModal = ({ user, onClose, onSave }) => {
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState(user.password);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = async () => {
        const updatedUser = {
            email,
            password,
            firstName,
            lastName
        };
    
        try {
            const response = await fetch(`${config.BASE_URL}/update-UserDetails`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });
    
            const data = await response.json();
    
            if (response.ok && data.success) {
                setSuccessMessage('User details updated successfully!');
                onSave(updatedUser); // Optionally, call onSave to update the UI without a full reload
                setTimeout(() => {
                    window.location.reload(); // Reload the page after a short delay
                }, 1000); // Delay for showing the success message
            } else {
                setErrorMessage(data.error || 'Update failed.');
            }
        } catch (error) {
            setErrorMessage('Internal server error. Please try again later.');
        }
    };
    

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Update User</h2>
                    <span className="close-button" onClick={onClose}>&times;</span>
                </div>
                <div className="modal-body">
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
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
