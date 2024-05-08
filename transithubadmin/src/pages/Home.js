import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';

export default function Home() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div style={styles.page}>
            <Sidebar onToggle={toggleSidebar} />
            <div style={styles.container}>
                <h1 style={styles.heading}>Good day Admin!</h1>
                <div style={styles.buttonGrid}>
                    <div style={styles.button}>
                        <PersonOutlineOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Active users</button>
                    </div>
                    <div style={styles.button}>
                        <PersonOutlineOutlinedIcon style={styles.icon}/>
                        <button style={styles.buttonStyle}>Total users</button>
                    </div>
                    <div style={styles.button}>
                        <button style={styles.buttonStyle}>View full report</button>
                        <ArrowCircleRightOutlinedIcon style={styles.icon}/>
                    </div>
                    <div style={styles.button}>
                        <button style={styles.buttonStyle}>Feedbacks</button>
                        <ArrowCircleRightOutlinedIcon style={styles.icon}/>
                    </div>
                    <div style={styles.button}>
                        <button style={styles.buttonStyle}>Support</button>
                        <ArrowCircleRightOutlinedIcon style={styles.icon}/>
                    </div>
                    <div style={styles.button}>
                        <button style={styles.buttonStyle}>Maintenance</button>
                        <ArrowCircleRightOutlinedIcon style={styles.icon}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    container: {
        padding: 30,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "left",
        fontFamily: "Almarai, sans-serif",
        flex: 1,
        marginLeft: 10,
    },
    heading: {
        color: "black", 
        fontSize: 24, 
        fontWeight: "bold", 
        fontFamily: "Almarai, sans-serif",
        marginTop: 110,
        marginLeft: -100,
    },
    buttonGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        justifyContent: "center", // Align horizontally to the center
        alignItems: "center", // Align vertically to the center
    },
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#8A252C",
        color: "white",
        borderRadius: "15px",
        padding: "50px",
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
