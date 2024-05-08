import React from "react";
import Sidebar from "../components/sidebar"; 

export default function Organizer() {
    return (
        <div style={styles.page}>
            <Sidebar />
            <div style={styles.container}>
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
        padding: 20,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Almarai, sans-serif",
        flex: 1,
    }
};
