import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import '../styles/style.css';
import Sidebar from "../../layout/sidebar";
import config from "../../config";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

export default function Dashboard() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weeklySales, setWeeklySales] = useState([]);
    const [metrics, setMetrics] = useState({});
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchWeeklySales = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/weekly-sales`);
                const data = await response.json();
                setWeeklySales(data.data);
                setMetrics(data.metrics);
            } catch (error) {
                console.error('Error fetching weekly sales:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklySales();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/premiumUsers`);
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const isRecentlyCreated = (dateCreated) => {
        const accountDate = new Date(dateCreated);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - accountDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    };

    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
        isRecentlyCreated(user.created_at)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleManageClick = (user) => {
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
                                <p>{metrics.totalDeliveries?.toLocaleString() || 0}</p>
                                <h2>Total Deliveries</h2>
                            </div>
                            <div className="card">
                                <AttachMoneyOutlinedIcon className="icon" />
                                <p>₱{parseFloat(metrics.totalSales || 0).toFixed(2).toLocaleString()}</p>
                                <h2>Total Sales</h2>
                            </div>
                            <div className="card">
                                <BarChartOutlinedIcon className="icon" />
                                <p>₱{parseFloat(metrics.highestSalesDay || 0).toFixed(2).toLocaleString()}</p>
                                <h2>Highest Sale</h2>
                            </div>
                            <div className="card">
                                <BarChartOutlinedIcon className="icon" />
                                <p>₱{parseFloat(metrics.lowestSalesDay || 0).toFixed(2).toLocaleString()}</p>
                                <h2>Lowest Sale</h2>
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5">Loading...</td>
                                        </tr>
                                    ) : (
                                        currentItems.map((user, index) => (
                                            <tr key={index} className="tbodyTr">
                                                <td>{user.firstName} {user.lastName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.userType}</td>
                                                <td>{formatDate(user.created_at)}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleManageClick(user)}
                                                        className="manageButton"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="paginationContainer">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className="paginationButton"
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
