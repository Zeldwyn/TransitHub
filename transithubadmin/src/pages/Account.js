import React, { useState } from "react";
import './styles/style.css';
import Sidebar from "../layout/sidebar";


export default function Account() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

        return (
            <div className="page">
                <Sidebar onToggle={toggleSidebar} />
                <div className={`mainContainer ${isSidebarExpanded ? "expanded" : ""}`}>
                    <div className="mainContainer">
                        <div className="cardContainer">
                            <div className="titlesContainer">
                                <h1 className="header">Personal Information</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
 }