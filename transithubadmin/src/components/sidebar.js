import React, { useState } from "react";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { useNavigate } from "react-router-dom";
import logo from "../img/blackText.png";

export default function Sidebar() {
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

  return (
    <div style={styles.container}>
      <div style={styles.sidebarContainer}>
        <div style={{...styles.sidebar, width: expanded ? "180px" : "30px"}}>
          <div style={styles.toggleButton} onClick={toggleSidebar}>
            <MenuOutlinedIcon style={styles.menuIcon} />
          </div>
          <div style={styles.iconsContainer}>
            <div style={styles.iconItem} onClick={() => handleNavigation('/home')}>
              <HomeOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Home</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation('/manage-user')}>
              <PersonOutlineOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Manage</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation('/maintenance')}>
              <ConstructionOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Maintenance</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation('/organizer')}>
              <CalendarMonthOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Organizer</span>}
            </div>
            <div style={styles.iconItem} onClick={() => handleNavigation('/settings')}>
              <SettingsOutlinedIcon style={styles.icon} />
              {showLabels && <span style={styles.label}>Settings</span>}
            </div>
          </div>
        </div>
      </div>
      {/* <img src={logo} alt="Logo" style={styles.logo} /> */}
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
    backgroundColor: "#8A252C",
    padding: "25px",
    overflowX: "hidden",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
    height: "100vh", // Set height to 100vh to fill the full page height
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
  logo: {
    width: "200px", 
    top: 10,
    marginTop: -65,
    transition: "margin-left 0.1s ease-in-out",
  },
};

