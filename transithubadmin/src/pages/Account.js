import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/style.css';
import Sidebar from "../layout/sidebar";
import config from "../config";

export default function Account() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountDetails, setAccountDetails] = useState({
        username: '',
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        phonenumber: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/');
        }

        const fetchAccountDetails = () => {
            const username = localStorage.getItem('username');
            const email = localStorage.getItem('email');
            const firstname = localStorage.getItem('firstname');
            const lastname = localStorage.getItem('lastname');
            const phonenumber = localStorage.getItem('phonenumber');

            // Ensure all details are available before setting state
            if (username && email && firstname && lastname && phonenumber) {
                setAccountDetails({
                    username,
                    email,
                    password: '', // Don't store password in localStorage
                    firstname,
                    lastname,
                    phonenumber,
                });
            } else {
                console.error('Incomplete account details found in localStorage');
            }
        };

        fetchAccountDetails();
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleUpdate = async () => {
        try {
            const adminUserID = localStorage.getItem('adminUserID');
            if (!adminUserID) {
                throw new Error('Admin User ID is not set in localStorage');
            }
            const response = await fetch(`${config.BASE_URL}/update-AdminDetails`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    adminUserID,
                    username: accountDetails.username,
                    email: accountDetails.email,
                    password: accountDetails.password, // Ensure password is hashed before sending
                    firstname: accountDetails.firstname,
                    lastname: accountDetails.lastname,
                    phonenumber: accountDetails.phonenumber,
                    role: 'Administrator' // Assuming role is static for admin
                }),
            });

            const result = await response.json();
            if (result.success) {
                localStorage.setItem('username', accountDetails.username);
                localStorage.setItem('email', accountDetails.email);
                localStorage.setItem('firstname', accountDetails.firstname);
                localStorage.setItem('lastname', accountDetails.lastname);
                localStorage.setItem('phonenumber', accountDetails.phonenumber);
                console.log("Account updated:", accountDetails);
                handleCloseModal();
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountDetails({
            ...accountDetails,
            [name]: value
        });
    };

    return (
        <div className="page">
            <Sidebar onToggle={toggleSidebar} />
            <div className={`mainContainer ${isSidebarExpanded ? "expanded" : ""}`}>
                <div className="mainContainer">
                    <div className="cardContainer">
                        <div className="titlesContainer">
                            <h1 className="header">Account Information</h1>
                            <p className="header">Name: {accountDetails.firstname} {accountDetails.lastname}</p>
                            <p className="header">Username: {accountDetails.username}</p>
                            <p className="header">Email: {accountDetails.email}</p>
                            <p className="header">Phone Number: {accountDetails.phonenumber}</p>
                            <button className="manageButton" onClick={handleOpenModal}>Update</button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Account Details</h2>
                            <span className="close-button" onClick={handleCloseModal}>×</span>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={accountDetails.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={accountDetails.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={accountDetails.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="firstname">First Name</label>
                                <input
                                    type="text"
                                    id="firstname"
                                    name="firstname"
                                    value={accountDetails.firstname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="lastname">Last Name</label>
                                <input
                                    type="text"
                                    id="lastname"
                                    name="lastname"
                                    value={accountDetails.lastname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="phonenumber">Phone Number</label>
                                <input
                                    type="text"
                                    id="phonenumber"
                                    name="phonenumber"
                                    value={accountDetails.phonenumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="button-container">
                            <button className="modal-button" onClick={handleUpdate}>Update</button>
                            <button className="modal-button" onClick={handleCloseModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
