import React, { useState, useEffect } from "react";
import Modal from "./modal";

export default function Table() {
    const [premiumUsers, setPremiumUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchPremiumUsers();
    }, []);

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

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleUpdate = (userId) => {
        console.log(`Update user with ID: ${userId}`);
    };

    const handleDelete = (userId) => {
        console.log(`Delete user with ID: ${userId}`);
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
                                <button onClick={() => handleUpdate(user.id)} style={styles.actionButton}>Update</button>
                                <button onClick={() => handleDelete(user.id)} style={styles.actionButton}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                    disabled={currentPage === 1}
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
