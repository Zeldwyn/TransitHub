import React, { useState } from "react";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Sidebar from "../layout/sidebar";
import { weeklyData, deliveryRate } from "./data/sampleData";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
export default function Assessment() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    // Calculate total deliveries and sales for the week
    const totalDeliveries = weeklyData.reduce((total, day) => total + day.deliveries, 0);
    const totalSales = weeklyData.reduce((total, day) => total + day.sales, 0);

    // Calculate delivery statuses
    const totalArrived = deliveryRate.filter(delivery => delivery.status === "Arrived").length;
    const totalCancelled = deliveryRate.filter(delivery => delivery.status === "Cancelled").length;

    // Sample data for the charts (replace this with actual previous month data)
    const monthlySalesData = [
        { name: 'Week 1', thisMonth: 5000, lastMonth: 4500 },
        { name: 'Week 2', thisMonth: 7000, lastMonth: 6000 },
        { name: 'Week 3', thisMonth: 8000, lastMonth: 7000 },
        { name: 'Week 4', thisMonth: totalSales, lastMonth: 12000 },
    ];

    const deliveryData = [
        { name: 'Week 1', thisMonth: 10, lastMonth: 9 },
        { name: 'Week 2', thisMonth: 7, lastMonth: 7 },
        { name: 'Week 3', thisMonth: 12, lastMonth: 11 },
        { name: 'Week 4', thisMonth: totalDeliveries, lastMonth: 16 },
    ];

    const totalDeliveryLastMonth = 43;
    const totalDeliveryThisMonth = 29 + totalDeliveries;

    // Calculate percentage change for deliveries
    const percentageChangeDeliveries = ((totalDeliveryThisMonth - totalDeliveryLastMonth) / totalDeliveryLastMonth * 100).toFixed(2);

    // Calculate percentage change for sales
    const lastMonthSales = monthlySalesData[monthlySalesData.length - 1]?.lastMonth || 0;
    const percentageChangeSales = ((totalSales - lastMonthSales) / lastMonthSales * 100).toFixed(2);

    const exportReport = () => {
        const data = [
            ["Month", "Total Sales (₱)", "Total Deliveries"],
            ...monthlySalesData.map((item, index) => [item.name, item.thisMonth, deliveryData[index].thisMonth])
        ];
        const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "assessment_report.csv");
        document.body.appendChild(link);
        link.click();
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
                                <p>{totalDeliveries.toLocaleString()}</p>
                                <h2>Total Deliveries</h2>
                                <h4 style={{ color: "#4DB6AC" }}>
                                    {percentageChangeDeliveries > 0 ? `+${percentageChangeDeliveries}% from last month` : `${percentageChangeDeliveries}% from last month`}
                                </h4>
                            </div>
                            <div className="card">
                                <AttachMoneyOutlinedIcon className="icon" />
                                <p>₱{totalSales.toLocaleString()}</p>
                                <h2>Total Sales</h2>
                                <h4 style={{ color: "#4DB6AC" }}>
                                    {percentageChangeSales > 0 ? `+${percentageChangeSales}% from last month` : `${percentageChangeSales}% from last month`}
                                </h4>
                            </div>
                            <div className="card">
                                <DoneOutlinedIcon className="icon" />
                                <p>{totalArrived} Arrived</p>
                                <h2>Successful Delivery</h2>
                            </div>
                            <div className="card">
                                <CancelOutlinedIcon className="icon" />
                                <p>{totalCancelled} Cancelled</p>
                                <h2>Failed Delivery</h2>
                            </div>
                        </div>
                    </div>

                    <div className="cardWrapper">
                        <div className="cardContainerhalf">
                            <div className="titlesContainer">
                                <h1 className="header">Total Sales</h1>
                            </div>
                            <div className="cardsContainerhalf">
                            <BarChart width={450} height={300} data={monthlySalesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="thisMonth" fill="#8884d8" name="Current Month" />
                                <Bar dataKey="lastMonth" fill="#82ca9d" name="Previous Month" />
                            </BarChart>
                            </div>
                        </div>
                        <div className="cardContainerotherhalf">
                            <div className="titlesContainer">
                                <h1 className="header">Deliveries Insight</h1>
                            </div>
                            <div className="cardsContainerotherhalf">
                                <LineChart width={700} height={300} data={deliveryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" name="Current Month" dataKey="thisMonth" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    <Line type="monotone" name="Previous Month" dataKey="lastMonth" stroke="#82ca9d" />
                                </LineChart>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
