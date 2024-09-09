import React, { useState } from "react";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [showLabels, setShowLabels] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setExpanded(!expanded);
    setShowLabels(!showLabels);
  };

  const handleNavigation = (path) => {
    navigate(path); 
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebarContainer}>
        <div style={{ ...styles.sidebar, width: expanded ? "180px" : "30px" }}>
          <div style={styles.toggleButton} onClick={toggleSidebar}>
            <MenuOutlinedIcon style={styles.menuIcon} />
          </div>
          <div style={styles.logoContainer}></div>
          <div style={styles.iconsContainer}>
            <div style={styles.iconItem} onClick={() => handleNavigation("/dashboard")}>
              <DashboardOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Dashboard</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation("/manage-user")}>
              <PersonOutlineOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Manage</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation("/assessment")}>
              <AssessmentOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Assessment</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation("/account")}>
              <AccountBoxOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Account</span>}
            </div>
            <div style={styles.iconItem} onClick={handleLogout}>
              <LogoutOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Logout</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    position: "relative",
    fontFamily: "Almarai, sans-serif",
  },
  sidebarContainer: {
    position: "fixed",
    top: 0,
    bottom: 0,
  },
  sidebar: {
    backgroundColor: "#1A1A2E",
    padding: "25px",
    overflowX: "hidden",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
    height: "100vh", 
    transition: "width 0.1s ease-in-out", 
  },
  toggleButton: {
    cursor: "pointer",
    marginBottom: "30px",
    textAlign: "center",
    color: "white",
    display: "flex",
    height: "40px",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logo: {
    position: "fixed",
    marginLeft: 30, 
    marginTop: -110,
    top: 50,
    left: 50,
    width: "200px", 
    height: "200px",
  },
  
  iconsContainer: {
    display: "flex",
    flexDirection: "column",
  },
  iconItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "40px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  icon: {
    color: "white",
  },
  label: {
    marginLeft: "40px",
    color: "white",
  },
  menuIcon: {
    fontSize: "24px",
    marginRight: "10px",
  },
};

export default Sidebar;
