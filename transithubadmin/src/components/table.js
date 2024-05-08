import React, { useState } from "react";

export default function Table() {
    // Sample data. will remove if naa nay legit data
    const data = [
        { id: 1, firstName: "John", lastName: "Doe", userType: "Transport Operator", phoneNumber: "123-456-7890" },
        { id: 2, firstName: "Jane", lastName: "Smith", userType: "Transport Operator", phoneNumber: "456-789-0123" },
        { id: 3, firstName: "Alex", lastName: "Johnson", userType: "Business Owner", phoneNumber: "789-012-3456" },
        { id: 4, firstName: "Emily", lastName: "Brown", userType: "Business Owner", phoneNumber: "012-345-6789" },
        { id: 5, firstName: "Michael", lastName: "Davis", userType: "Transport Operator", phoneNumber: "345-678-9012" },
        { id: 6, firstName: "Sarah", lastName: "Wilson", userType: "Transport Operator", phoneNumber: "567-890-1234" },
        { id: 7, firstName: "David", lastName: "Taylor", userType: "Business Owner", phoneNumber: "890-123-4567" },
        { id: 8, firstName: "Emma", lastName: "Miller", userType: "Transport Operator", phoneNumber: "098-765-4321" },
        { id: 9, firstName: "William", lastName: "Martinez", userType: "Business Owner", phoneNumber: "456-789-0123" },
        { id: 10, firstName: "Olivia", lastName: "Garcia", userType: "Business Owner", phoneNumber: "987-654-3210" },
        { id: 11, firstName: "Daniel", lastName: "Anderson", userType: "Transport Operator", phoneNumber: "234-567-8901" },
        { id: 12, firstName: "Sophia", lastName: "Hernandez", userType: "Transport Operator", phoneNumber: "345-678-9012" },
        { id: 13, firstName: "James", lastName: "Lopez", userType: "Business Owner", phoneNumber: "456-789-0123" },
        { id: 14, firstName: "Isabella", lastName: "Gonzalez", userType: "Business Owner", phoneNumber: "567-890-1234" },
        { id: 15, firstName: "Benjamin", lastName: "Nelson", userType: "Transport Operator", phoneNumber: "678-901-2345" },
        { id: 16, firstName: "Ava", lastName: "Perez", userType: "Transport Operator", phoneNumber: "789-012-3456" },
        { id: 17, firstName: "Mason", lastName: "Rivera", userType: "Business Owner", phoneNumber: "890-123-4567" },
        { id: 18, firstName: "Ethan", lastName: "Roberts", userType: "Transport Operator", phoneNumber: "901-234-5678" },
        { id: 19, firstName: "Charlotte", lastName: "Cook", userType: "Business Owner", phoneNumber: "012-345-6789" },
        { id: 20, firstName: "Amelia", lastName: "Morgan", userType: "Business Owner", phoneNumber: "123-456-7890" }
    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Function to handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Pagination variables
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

    const filteredData = currentRows.filter((row) =>
        `${row.firstName} ${row.lastName} ${row.userType} ${row.phoneNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginRight:"-250px", padding: "8px", borderRadius: "20px", border: "1px solid #ccc", width: "200px", marginLeft: "auto" }}
                />
            </div>
            <table style={styles.table}>
                <thead>
                        <tr>
                            <th style={{ ...styles.header, width: "20%" }}>First Name</th>
                            <th style={{ ...styles.header, width: "20%" }}>Last Name</th>
                            <th style={{ ...styles.header, width: "20%" }}>User Type</th>
                            <th style={{ ...styles.header, width: "20%" }}>Phone Number</th> 
                            <th style={{ ...styles.header, width: "20%" }}>Action</th>
                        </tr>
                </thead>
                <tbody>
                    {filteredData.map((row, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f2f2f2" : "transparent", cursor: "pointer" }}>
                            <td>{row.firstName}</td>
                            <td>{row.lastName}</td>
                            <td>{row.userType}</td>
                            <td>{row.phoneNumber}</td> {/* New cell */}
                            <td>
                                <div>
                                    <button style={{ marginRight: "5px", padding: "4px 8px", borderRadius: "5px", backgroundColor: "#dc3545", color: "#fff", border: "none" }}>Delete</button>
                                    <button style={{ marginRight: "5px", padding: "4px 8px", borderRadius: "5px", backgroundColor: "#ffc107", color: "#000", border: "none" }}>Update</button>
                                    <button style={{ padding: "4px 8px", borderRadius: "5px", backgroundColor: "#28a745", color: "#fff", border: "none" }}>View</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination */}
            <div style={{ marginTop: "20px", textAlign: "center", marginLeft: "280px"}}>
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
        width: "150%",
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
};
