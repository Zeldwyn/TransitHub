import React, { useState } from "react";
import Sidebar from "../components/sidebar"; 
import Table from "../components/table";

export default function ManageUser() {
    const [users, setUsers] = useState([
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ]);

    const handleUpdate = (id) => {
        // Logic to update the user with the given id
        const updatedUsers = users.map(user => 
            user.id === id ? { ...user, name: "Updated Name" } : user
        );
        setUsers(updatedUsers);
    };

    const handleDelete = (id) => {
        // Logic to delete the user with the given id
        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
    };

    return (
        <div style={styles.page}>
            <Sidebar />
            <div style={styles.container}>
                <Table 
                    style={styles.tab}
                    users={users}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
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
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Almarai, sans-serif",
        flex: 1,
        justifyContent: "center",
    },
};
