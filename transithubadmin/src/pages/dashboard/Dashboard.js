import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import '../styles/style.css';
import Sidebar from "../../layout/sidebar";
import { weeklyData, userData, deliveryRate } from "../data/sampleData";

export default function Dashboard() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const totalDeliveries = weeklyData.reduce((total, day) => total + day.deliveries, 0);
    const totalSales = weeklyData.reduce((total, day) => total + day.sales, 0);

    // Calculate unique drivers
    const uniqueDrivers = new Set(deliveryRate.map(delivery => delivery.operator));
    const totalDrivers = uniqueDrivers.size;

    // Calculate delivery success rate
    const totalDeliveriesCount = deliveryRate.length;
    const successfulDeliveriesCount = deliveryRate.filter(delivery => delivery.status === "Arrived").length;
    const deliverySuccessRate = totalDeliveriesCount > 0 ? (successfulDeliveriesCount / totalDeliveriesCount * 100).toFixed(2) : 0;

    const isRecentlyCreated = (dateCreated) => {
        const accountDate = new Date(dateCreated);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - accountDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    };

    const filteredUsers = userData.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
        isRecentlyCreated(user.dateCreated)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleManageClick = (user) => {
        // Navigate to /manage-user route
        navigate('/manage-user');
    };

    return (
        <div className="page">
            <Sidebar onToggle={toggleSidebar} />
            <div className={`mainContainer ${isSidebarExpanded ? "expanded" : ""}`}>
                <div className="mainContainer">
                    <div className="cardContainer">
                        <div className="titlesContainer">
                            <h1 className="header">Weekly Sales</h1>
                            <h3 className="subHeader">Sales Summary</h3>
                        </div>
                        <div className="cardsContainer">
                            <div className="card">
                                <LocalShippingOutlinedIcon className="icon" />
                                <p>{totalDeliveries.toLocaleString()}</p>
                                <h2>Total Deliveries</h2>
                            </div>
                            <div className="card">
                                <AttachMoneyOutlinedIcon className="icon" />
                                <p>₱{totalSales.toLocaleString()}</p>
                                <h2>Total Sales</h2>
                            </div>
                            <div className="card">
                                <PersonOutlineOutlinedIcon className="icon" />
                                <p>{totalDrivers}</p>
                                <h2>Total Drivers</h2>
                            </div>
                            <div className="card">
                                <BarChartOutlinedIcon className="icon" />
                                <p>{deliverySuccessRate}% Delivery Success Rate</p>
                                <h2>Performance Overview</h2>
                            </div>
                        </div>
                    </div>

                    <div className="cardContainer">
                        <div className="titlesContainer">
                            <div className="headerWithSearch">
                                <h1 className="header">Recent Users</h1>
                                <input
                                    type="text"
                                    placeholder="Search Users"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
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
                                    {currentItems.map((user, index) => (
                                        <tr key={index} className="tbodyTr">
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.userType}</td>
                                            <td>{user.dateCreated}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleManageClick(user)}
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
        </div>
    );
}
