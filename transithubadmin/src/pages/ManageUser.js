import React from "react";
import Sidebar from "../components/sidebar"; 
import Table from "../components/table";

export default function ManageUser() {
    return (
        <div style={styles.page}>
            <Sidebar />
            <div style={styles.container}>
                <Table style={styles.tab}/>
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
        marginTop: 130,
        //marginLeft: -280, // Add left margin
       // marginRight: 280, // Add right margin
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Almarai, sans-serif",
        flex: 1,
        justifyContent: "center", // Center the content vertically
    },
};
