import React from "react";
import Logo from "../img/blackText.png";

export default function NoPage() {
    const goBack = () => {
        window.history.back(); 
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <img src={Logo} alt="Logo" style={styles.logo}/>
                <h1 style={styles.heading}>404 Page not found</h1>
                <div style={styles.button}>
                    <button style={styles.buttonStyle} onClick={goBack}>Go Back</button>
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
        flexDirection: "column", 
        justifyContent: "center",
        alignItems: "center", 
    },
    container: {
        padding: 20,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Almarai, sans-serif",
        marginTop: -300,
    },
    heading: {
        fontSize: "48px", 
        marginTop: -200,
    },
    logo: {
        width: "50%", 
        top: -100,
    },
    buttonStyle: {
        border: "none",
        background: "none",
        color: "inherit",
        fontFamily: "inherit",
        cursor: "pointer",
        fontSize: '20px',
    },
    button: {
        backgroundColor: "#8A252C",
        color: "white",
        borderRadius: "15px",
        padding: "20px",
        fontFamily: "Almarai, sans-serif",
        textAlign: "center",
    },
};
