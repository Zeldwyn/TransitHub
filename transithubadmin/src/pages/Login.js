import React, { useState } from "react";
import logo from "../img/whiteText.png";
import { useNavigate } from 'react-router-dom';
import config from '../config';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async () => {
        if (!username || !password) {
            setErrorMessage('Please enter both username and password.');
            return;
        }
        try {
            const response = await fetch(`${config.BASE_URL}/validate-AdminLogin`, { //change ip
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.isValid) {
                console.log('Login successful');
                navigate('/dashboard');
            } else {
                console.log('Invalid login credentials');
                setErrorMessage('Invalid login credentials. Please try again.');
            }
        } catch (error) {
            console.error('Error occurred during login:', error);
            setErrorMessage('An unexpected error occurred. Please try again later.');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.logoBanner}>
                    <img src={logo} alt="Logo" style={{ width: "50%" }} />
                </div>
                <label style={styles.label}>Username:</label>
                <input
                    style={styles.input}
                    placeholder={usernameFocused || username ? "" : "Enter Username"}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                />
                <label style={styles.label}>Password:</label>
                <input
                    style={styles.input}
                    placeholder={passwordFocused || password ? "" : "Enter Password"}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                />
                {errorMessage && <p style={styles.error}>{errorMessage}</p>}
                <button
                    onClick={handleLogin}
                    style={styles.button}
                >
                   Submit
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#1A1A2E",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        backgroundColor: "#1A1A2E",
        padding: 20,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Almarai, sans-serif",
    },
    logoBanner: {
        marginTop: -200,
        marginBottom: -180,
        display: "flex",
        justifyContent: "center",
    },
    label: {
        marginBottom: 5,
        color: "white",
    },
    input: {
        width: "30%",
        height: 40,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        border: "1px solid #ccc",
        textAlign: "center",
        fontFamily: "Almarai, sans-serif",
    },
    button: {
        marginTop: 10,
        backgroundColor: "#8A252C",
        color: "#fff",
        borderRadius: 5,
        padding: "10px 20px",
        border: "none",
        cursor: "pointer",
        fontFamily: "Almarai, sans-serif",
        fontWeight: "bold",
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
};
