import React from "react";
import Sidebar from "../layout/sidebar"; 

export default function Assessment() {
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
        backgroundColor: "#1A1A2E",
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
