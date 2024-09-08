import React, { useState, useEffect } from "react";
import config from "../config";

const UpdateModal = ({ premiumUserID, onClose, onUpdate }) => {
    const [updatedUserDetails, setUpdatedUserDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        userType: ""
    });    

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/premiumUsers/${premiumUserID}`);
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
    }, [premiumUserID]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedUserDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://192.168.1.5:8080/premiumUsers/${premiumUserID}`, {
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
            window.location.reload(); // temporary fix, uncontrolled input
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };
    
    
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
        zIndex: 1000, 
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
                    <h2>Update User Details</h2>
                    <div>
                        <label htmlFor="firstName" style={styles.label}>First Name:</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            value={updatedUserDetails.firstName} 
                            onChange={handleInputChange} 
                            style={styles.input} 
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" style={styles.label}>Last Name:</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName" 
                            value={updatedUserDetails.lastName} 
                            onChange={handleInputChange} 
                            style={styles.input} 
                        />
                    </div>
                    <div>
                        <label htmlFor="email" style={styles.label}>Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={updatedUserDetails.email} 
                            onChange={handleInputChange} 
                            style={styles.input} 
                        />
                    </div>
                    <div>
                        <label htmlFor="userType" style={styles.label}>User Type:</label>
                        <input 
                            type="radio" 
                            id="owner" 
                            name="userType" 
                            value="owner" 
                            checked={updatedUserDetails.userType === "owner"} 
                            onChange={handleInputChange} 
                        />
                        <label htmlFor="owner" style={{ marginRight: "10px" }}>Owner</label>
                        <input 
                            type="radio" 
                            id="operator" 
                            name="userType" 
                            value="operator" 
                            checked={updatedUserDetails.userType === "operator"} 
                            onChange={handleInputChange} 
                        />
                        <label htmlFor="operator">Operator</label>
                    </div>
                    <div style={styles.updateButtonContainer}>
                        <button style={styles.button} onClick={handleUpdate}>
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const styles = {
    button: {
        padding: "8px 12px",
        borderRadius: "4px",
        backgroundColor: "#8A252C",
        color: "#fff",
        border: "none",
        cursor: "pointer",
    },
    label: {
        marginBottom: "10px",
        display: "inline-block",
        width: "120px",
        textAlign: "right",
        marginRight: "10px",
    },
    input: {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "calc(100% - 140px)",
        boxSizing: "border-box",
    },
    updateButtonContainer: {
        textAlign: "right",
    },
};

export default UpdateModal;
