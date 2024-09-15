import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; 
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import Sidebar from "../layout/sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import config from "../config";

export default function Assessment() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [monthlyData, setMonthlyData] = useState({
        totalSales: 0,
        totalDeliveries: 0,
        avgDeliveryDistance: 0,
        avgFeedbackRating: 0
    });
    const [chartData, setChartData] = useState([]);
    const navigate = useNavigate(); 

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        // Fetch all metrics concurrently using Promise.all
        Promise.all([
            fetch(`${config.BASE_URL}/total-sales`).then(res => res.json()),
            fetch(`${config.BASE_URL}/total-deliveries`).then(res => res.json()),
            fetch(`${config.BASE_URL}/average-delivery-distance`).then(res => res.json()),
            fetch(`${config.BASE_URL}/average-feedback-rating`).then(res => res.json())
        ])
        .then(([salesData, deliveriesData, distanceData, feedbackData]) => {
            console.log('Fetched Data:', {
                totalSales: salesData.totalSales,
                totalDeliveries: deliveriesData.totalDeliveries,
                avgDeliveryDistance: distanceData.avgDistance,
                avgFeedbackRating: feedbackData.avgRating
            });

            const formattedData = {
                totalSales: parseFloat(salesData.totalSales) || 0,
                totalDeliveries: parseInt(deliveriesData.totalDeliveries, 10) || 0,
                avgDeliveryDistance: parseFloat(distanceData.avgDistance) || 0,
                avgFeedbackRating: parseFloat(feedbackData.avgRating) || 0,
            };

            setMonthlyData(formattedData);
            setChartData([
                { month: `${currentMonth}/${currentYear}`, ...formattedData }
            ]);
        })
        .catch(error => {
            console.error('Error fetching monthly data:', error);
        });
    }, [currentYear, currentMonth]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const exportReport = () => {
        if (monthlyData) {
            const data = [
                ["Metric", "Value"],
                ["Total Sales (₱)", formatNumber(monthlyData.totalSales)],
                ["Total Deliveries", monthlyData.totalDeliveries.toLocaleString()],
                ["Average Delivery Distance (km)", formatNumber(monthlyData.avgDeliveryDistance)],
                ["Average Feedback Rating", formatNumber(monthlyData.avgFeedbackRating, 1)]
            ];
            const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "monthly_report.csv");
            document.body.appendChild(link);
            link.click();
        }
    };

    // Helper function to safely format numbers
    const formatNumber = (value, decimals = 2) => {
        if (typeof value === 'number' && !isNaN(value)) {
            return value.toFixed(decimals);
        }
        return '0.00'; // Default value if not a number
    };

    return (
        <div className="page">
            <Sidebar onToggle={toggleSidebar} />
            <div className={`mainContainer ${isSidebarExpanded ? "expanded" : ""}`}>
                <div className="mainContainer">
                    <div className="cardContainer">
                        <div className="titlesContainer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 className="header">Assessment Report</h1>
                                <h3 className="subHeader">Overview of this Month's Performance</h3>
                            </div>
                            <button className="exportButton" onClick={exportReport} style={{ display: 'flex', alignItems: 'center' }}>
                                <FileDownloadOutlinedIcon style={{ marginRight: '5px' }} /> Export
                            </button>
                        </div>
                        <div className="cardsContainer">
                            <div className="card">
                                <LocalShippingOutlinedIcon className="icon" />
                                <p>{monthlyData.totalDeliveries.toLocaleString()}</p>
                                <h2>Total Deliveries</h2>
                            </div>
                            <div className="card">
                                <AttachMoneyOutlinedIcon className="icon" />
                                <p>₱{formatNumber(monthlyData.totalSales)}</p>
                                <h2>Total Sales</h2>
                            </div>
                            <div className="card">
                                <DoneOutlinedIcon className="icon" />
                                <p>{formatNumber(monthlyData.avgDeliveryDistance)}</p>
                                <h2>Average Delivery Distance</h2>
                            </div>
                            <div className="card">
                                <ThumbUpAltOutlinedIcon className="icon" />
                                <p>{formatNumber(monthlyData.avgFeedbackRating, 1)}</p>
                                <h2>Average Feedback Rating</h2>
                            </div>
                        </div>
                    </div>

                    <div className="cardWrapper">
                        <div className="cardContainerhalf">
                            <div className="titlesContainer">
                                <h1 className="header">Total Sales</h1>
                            </div>
                            <div className="cardsContainerhalf">
                                <BarChart width={450} height={300} data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalSales" fill="#8884d8" name="Total Sales" />
                                </BarChart>
                            </div>
                        </div>
                        <div className="cardContainerotherhalf">
                            <div className="titlesContainer">
                                <h1 className="header">Deliveries Insight</h1>
                            </div>
                            <div className="cardsContainerotherhalf">
                                <BarChart width={700} height={300} data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalDeliveries" fill="#8884d8" name="Total Deliveries" />
                                    <Bar dataKey="avgDeliveryDistance" fill="#82ca9d" name="Average Delivery Distance" />
                                </BarChart>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
