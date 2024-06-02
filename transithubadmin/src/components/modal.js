import React from "react";

const Modal = ({ user, onClose }) => {
    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    };

    const modalStyle = {
        backgroundColor: "#fefefe",
        borderRadius: "8px",
        padding: "20px",
        maxWidth: "600px",
        width: "80%",
        position: "relative",
        zIndex: 1000, // Ensure the modal appears above the overlay
    };

    const closeStyle = {
        position: "absolute",
        top: "10px",
        right: "10px",
        fontSize: "24px",
        cursor: "pointer",
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalStyle}>
                <span style={closeStyle} onClick={onClose}>&times;</span>
                <div style={{ marginBottom: "20px" }}>
                    <h2>User Details</h2>
                    <p>Email: {user.email}</p>
                    <p>Password: {user.password}</p>
                    <p>First Name: {user.firstName}</p>
                    <p>Last Name: {user.lastName}</p>
                    <p>User Type: {user.userType}</p>
                    <p>Created at: {user.created_at}</p>
                    {/* Add more user details here */}
                </div>
            </div>
        </div>
    );
};

export default Modal;
