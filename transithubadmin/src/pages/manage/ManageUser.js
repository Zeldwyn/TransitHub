import React, { useState } from "react";
import Sidebar from "../../layout/sidebar";
import { userData } from "../data/sampleData";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import '../styles/style.css';
import Modal from '../../layout/manageModal';

export default function ManageUser() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false); 
    const [selectedUser, setSelectedUser] = useState(null); 
    const itemsPerPage = 15;

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const handleManageClick = (user) => {
        setSelectedUser(user); 
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false); // Close the modal
        setSelectedUser(null); // Clear selected user
    };

    const filteredOwners = userData.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOwners.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'User Type', 'Date Account Created'];
        const rows = filteredOwners.map(user => [
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.userType,
            user.dateCreated
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", "user_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page">
            <Sidebar onToggle={toggleSidebar} />
            <div className={`mainContainer ${isSidebarExpanded ? "expanded" : ""}`}>
                <div className="mainContainer">
                    <div className="cardContainer">
                        <div className="titlesContainer">
                            <div className="headerWithSearch">
                                <h1 className="header">Manage Users</h1>
                                <div className="searchExportContainer">
                                    <input
                                        type="text"
                                        placeholder="Search Users"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="searchInput"
                                    />
                                    <button onClick={exportToCSV} className="exportButton">
                                        <FileDownloadOutlinedIcon style={{ marginRight: '5px' }} /> Export
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="tableContainer">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="th">Name</th>
                                        <th className="th">Email</th>
                                        <th className="th">User Type</th>
                                        <th className="th">Date Account Created</th>
                                        <th className="th">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((owner, index) => (
                                        <tr key={index} className="tbodyTr">
                                            <td>{owner.firstName} {owner.lastName}</td>
                                            <td>{owner.email}</td>
                                            <td>{owner.userType}</td>
                                            <td>{owner.dateCreated}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleManageClick(owner)}
                                                    className="manageButton"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="paginationContainer">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className="paginationButton"
                                        style={{
                                            backgroundColor: currentPage === index + 1 ? '#4DB6AC' : '#21222D',
                                        }}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Component */}
            {modalOpen && selectedUser && (
                <Modal user={selectedUser} onClose={handleCloseModal} />
            )}
        </div>
    );
}
