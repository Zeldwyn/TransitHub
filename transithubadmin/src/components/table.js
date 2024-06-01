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
        const storedUsers = JSON.parse(localStorage.getItem("premiumUsers"));
        if (storedUsers) {
            setPremiumUsers(storedUsers.filter(user => !deletedUserIds.includes(user.id))); // Filter out deleted users from stored users
        }
    }, [deletedUserIds]); // Update premiumUsers whenever deletedUserIds change

    useEffect(() => {
        localStorage.setItem("premiumUsers", JSON.stringify(premiumUsers));
    }, [premiumUsers]);

    const fetchPremiumUsers = async () => {
        try {
            const response = await fetch("http://10.147.18.235:8080/premiumUsers");
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

    const handleUpdate = (userId) => {
        setSelectedUserId(userId); // Set the ID of the selected user for update
        setUpdateModalOpen(true); // Open the update modal
    };

    const handleUpdateUserDetails = (updatedUser) => {
        const updatedUsers = premiumUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
        setPremiumUsers(updatedUsers);
        localStorage.setItem("premiumUsers", JSON.stringify(updatedUsers)); // Update local storage
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleCloseUpdateModal = () => {
        setUpdateModalOpen(false);
    };

    const handleDelete = (userId) => {
        setDeletedUserIds([...deletedUserIds, userId]);
        const updatedUsers = premiumUsers.filter(user => user.id !== userId);
        setPremiumUsers(updatedUsers);
        localStorage.setItem("premiumUsers", JSON.stringify(updatedUsers)); // Update local storage
    };

    const handleDeleteButtonClick = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            handleDelete(userId);
        }
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
            {updateModalOpen && <UpdateModal userId={selectedUserId} onClose={handleCloseUpdateModal} onUpdate={handleUpdateUserDetails} />} {/* Pass userId, onClose, and onUpdate to UpdateModal */}
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
                                <button onClick={() => handleUpdate(user.id)} style={styles.actionButton}>Update</button> {/* Add Update button */}
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