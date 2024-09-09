import React, { useState } from "react";
import Sidebar from "../layout/sidebar";
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';

export default function Maintenance() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div style={styles.page}>
            <Sidebar onToggle={toggleSidebar} />
            <div style={styles.container}>
                <div style={styles.buttonGrid}>
                    <div style={styles.button}>
                        <BackupOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Backup</button>
                    </div>
                    <div style={styles.button}>
                        <SyncOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Sync</button>
                    </div>
                    <div style={styles.button}>
                        <StorageOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Database</button>
                    </div>
                    <div style={styles.button}>
                        <FeedbackOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>View Feedbacks</button>
                    </div>
                    <div style={styles.button}>
                        <ChatOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Chat Support</button>
                    </div>
                    <div style={styles.button}>
                        <DnsOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Server</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#1A1A2E",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        padding: 30,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "Almarai, sans-serif",
        flex: 1,
        marginLeft: 10,
    },
    heading: {
        color: "black", 
        fontSize: 24, 
        fontWeight: "bold", 
        fontFamily: "Almarai, sans-serif",
        marginTop: 20,
    },
    buttonGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#8A252C",
        color: "white",
        borderRadius: "15px",
        padding: "50px", // Retain original button size
        fontFamily: "Almarai, sans-serif",
        textAlign: "center",
        marginTop: 30,
    },
    buttonStyle: {
        border: "none",
        background: "none",
        color: "inherit",
        fontFamily: "inherit",
        cursor: "pointer",
        fontSize: '20px',
    },
    icon: {
        marginLeft: "5px",
        marginRight: "5px",
        fontSize: '30px', 
    },
};
