import React, { useState, useEffect } from "react";
import Modal from "./modal";
import UpdateModal from "./updatemodal"; // Import the UpdateModal component

export default function Table() {
    const [premiumUsers, setPremiumUsers] = useState([]);
    const [deletedUserIds, setDeletedUserIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false); // State to manage the visibility of the update modal
    const [selectedUserId, setSelectedUserId] = useState(null); // State to store the ID of the selected user for update

    useEffect(() => {
        fetchPremiumUsers();
    }, []);

    useEffect(() => {
        localStorage.setItem("premiumUsers", JSON.stringify(premiumUsers));
    }, [premiumUsers]);

    const fetchPremiumUsers = async () => {
        try {
            const response = await fetch("http://192.168.1.5:8080/premiumUsers");
            if (!response.ok) {
                throw new Error('Failed to fetch premium users');
            }
            const data = await response.json();
            setPremiumUsers(data);
        } catch (error) {
            console.error("Error fetching premium users:", error);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleUpdate = (premiumUserID) => {
        setSelectedUserId(premiumUserID); // Set the selected user ID
        setUpdateModalOpen(true); // Open the update modal
    };

    const handleUpdateUser = async (updatedUser) => {
        try {
            const updatedUsers = premiumUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
            setPremiumUsers(updatedUsers);
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleCloseUpdateModal = () => {
        setUpdateModalOpen(false);
    };

    const handleDelete = (userId) => {
    };

    const handleDeleteButtonClick = (userId) => {
        
    };

    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = premiumUsers.slice(indexOfFirstRow, indexOfLastRow);

    const filteredData = currentRows.filter((user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {modalOpen && <Modal user={selectedUser} onClose={handleCloseModal} />}
            {updateModalOpen && <UpdateModal premiumUserID={selectedUserId} onClose={handleCloseUpdateModal} onUpdate={handleUpdateUser} />}
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: "8px", borderRadius: "20px", border: "1px solid #ccc", width: "200px", marginLeft: "auto" }}
                />
            </div>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={{ ...styles.header }}>Email</th>
                        <th style={{ ...styles.header }}>First Name</th>
                        <th style={{ ...styles.header }}>Last Name</th>
                        <th style={{ ...styles.header }}>User Type</th>
                        <th style={{ ...styles.header }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((user, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f2f2f2" : "transparent", cursor: "pointer" }}>
                            <td>{user.email}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.userType}</td>
                            <td>
                                <button onClick={() => handleView(user)} style={styles.actionButton}>View</button>
                                <button onClick={() => handleUpdate(user.premiumUserID)} style={styles.actionButton}>Update</button> 
                                <button onClick={() => handleDeleteButtonClick(user.id)} style={styles.actionButton}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                    disabled={currentRows.length < rowsPerPage}
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={styles.paginationButton}
                >
                    Previous
                </button>
                <span style={{ margin: "0 10px" }}>{currentPage}</span>
                <button
                    disabled={currentRows.length < rowsPerPage}
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={styles.paginationButton}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const styles = {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
    },
    header: {
        backgroundColor: "#8A252C",
        color: "#fff",
        padding: "8px",
        textAlign: "left",
    },
    paginationButton: {
        padding: "8px 16px",
        borderRadius: "20px",
        backgroundColor: "#8A252C",
        color: "#fff",
        border: "none",
        cursor: "pointer",
    },
    actionButton: {
        padding: "8px 12px",
        borderRadius: "4px",
        backgroundColor: "#8A252C",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        marginRight: "5px",
    },
};