import React, { useState, useEffect } from "react";

const UpdateModal = ({ userId, onClose, onUpdate }) => {
    const [updatedUserDetails, setUpdatedUserDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        userType: ""
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/premiumUsers/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }
                const userDetails = await response.json();
                setUpdatedUserDetails(userDetails);
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        fetchUserDetails();
    }, [userId]);

    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
        zIndex: 1000,
    };

    const closeStyle = {
        position: "absolute",
        top: "10px",
        right: "10px",
        fontSize: "24px",
        cursor: "pointer",
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedUserDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/premiumUsers/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUserDetails)
            });
            if (!response.ok) {
                throw new Error('Failed to update user details');
            }
            const updatedUser = await response.json();
            onUpdate(updatedUser);
            onClose();
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalStyle}>
                <span style={closeStyle} onClick={onClose}>&times;</span>
                <div style={{ marginBottom: "20px" }}>
                    <h2>Update User Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="firstName">First Name:</label>
                            <input type="text" id="firstName" name="firstName" value={updatedUserDetails.firstName} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="lastName">Last Name:</label>
                            <input type="text" id="lastName" name="lastName" value={updatedUserDetails.lastName} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={updatedUserDetails.email} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="userType">User Type:</label>
                            <input type="text" id="userType" name="userType" value={updatedUserDetails.userType} onChange={handleInputChange} />
                        </div>
                        <button type="submit">Update</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateModal;
