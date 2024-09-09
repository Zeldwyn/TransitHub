import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../layout/sidebar";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import '../styles/style.css';
import ManageUserModal from '../../layout/manageUserModal';
import UpdateUserModal from '../../layout/updateUserModal';
import FilterModal from '../../layout/filterModal';
import config from "../../config";

export default function ManageUser() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [userTypeFilter, setUserTypeFilter] = useState(""); 
    const [dateRange, setDateRange] = useState({ start: "", end: "" }); 
    const [userData, setUserData] = useState([]);
    const itemsPerPage = 15;
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        fetch(`${config.BASE_URL}/premiumUsers`)
            .then(response => response.json())
            .then(data => setUserData(data))
            .catch(error => console.error('Error fetching user data:', error));
    }, []);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const handleManageClick = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleCloseManageModal = () => {
        setModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = () => {
        setModalOpen(false);
        setUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setUpdateModalOpen(false);
    };

    const handleSave = (updatedUser) => {
        console.log("Updated user:", updatedUser);
        setUpdateModalOpen(false);
    };

    const applyFilters = (user) => {
        const matchesSearchTerm = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUserType = userTypeFilter ? user.userType === userTypeFilter : true;
        const matchesDateRange = dateRange.start && dateRange.end
            ? new Date(user.created_at) >= new Date(dateRange.start) &&
              new Date(user.created_at) <= new Date(dateRange.end)
            : true;
        return matchesSearchTerm && matchesUserType && matchesDateRange;
    };

    const filteredOwners = userData.filter(applyFilters);

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
            formatDate(user.created_at)
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

    const handleFilterClick = () => {
        setFilterModalOpen(true);
    };

    const handleCloseFilterModal = () => {
        setFilterModalOpen(false);
    };

    const handleApplyFilters = (filters) => {
        setUserTypeFilter(filters.userType);
        setDateRange({ start: filters.startDate, end: filters.endDate });
    };

    // Date formatting function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
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
                                    <button onClick={handleFilterClick} className="filterButton">
                                        Filter
                                    </button>
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
                                            <td>{formatDate(owner.created_at)}</td>
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

            {/* Manage User Modal */}
            {modalOpen && selectedUser && (
                <ManageUserModal
                    user={selectedUser}
                    onClose={handleCloseManageModal}
                    onUpdate={handleUpdateUser}
                />
            )}
            {/* Update User Modal */}
            {updateModalOpen && selectedUser && (
                <UpdateUserModal
                    user={selectedUser}
                    onClose={handleCloseUpdateModal}
                    onSave={handleSave}
                />
            )}
            {/* Filter Modal */}
            <FilterModal
                open={filterModalOpen}
                onClose={handleCloseFilterModal}
                onApply={handleApplyFilters}
            />
        </div>
    );
}
