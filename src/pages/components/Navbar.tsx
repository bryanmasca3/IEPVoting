import React, { useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
} from "@mui/icons-material";
import FlexBetween from "./../components/FlexBetween";
import { useDispatch } from "react-redux";
import { setMode } from "./../../state";
import profileImage from "./../assets/profile.jpeg";
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../../context/AuthContext';
const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = async () => {
    await logout();
    navigate('/login');
    setAnchorEl(null)
  };

  return (
    <AppBar
      sx= {{
    position: "static",
      background: "none",
        boxShadow: "none",
      }
}
    >
  <Toolbar sx={ { justifyContent: "space-between" } }>
    {/* LEFT SIDE */ }
    < FlexBetween >
    <IconButton onClick={ () => setIsSidebarOpen(!isSidebarOpen) }>
      <MenuIcon />
      </IconButton>
      </FlexBetween>

{/* RIGHT SIDE */ }
<FlexBetween gap="1.5rem" >
  <IconButton onClick={ () => dispatch(setMode()) }>
  {
    theme.palette.mode === "dark" ? (
      <DarkModeOutlined sx= {{ fontSize: "25px" }} />
            ) : (
  <LightModeOutlined sx= {{ fontSize: "25px" }} />
            )}
</IconButton>

  < FlexBetween >
  <Button
              onClick={ handleClick }
sx = {{
  display: "flex",
    justifyContent: "space-between",
      alignItems: "center",
        textTransform: "none",
          gap: "1rem",
              }}
            >
  <Box
                component="img"
alt = "profile"
src = { profileImage }
height = "32px"
width = "32px"
borderRadius = "50%"
sx = {{ objectFit: "cover" }}
              />
  < Box textAlign = "left" >
    <Typography
                  fontWeight="bold"
fontSize = "0.85rem"
sx = {{ color: theme.palette.secondary[100] }}
                >
  { user? user.email : "Cargando"}
  </Typography>
  < Typography
fontSize = "0.75rem"
sx = {{ color: theme.palette.secondary[200] }}
                >
  hermano
  </Typography>
  </Box>
  < ArrowDropDownOutlined
sx = {{ color: theme.palette.secondary[300], fontSize: "25px" }}
              />
  </Button>
  < Menu
anchorEl = { anchorEl }
open = { isOpen }
onClose = {()=> setAnchorEl(null)}
anchorOrigin = {{ vertical: "bottom", horizontal: "center" }}
            >
  <MenuItem onClick={ handleClose }> Log Out </MenuItem>
    </Menu>
    </FlexBetween>
    </FlexBetween>
    </Toolbar>
    </AppBar>
  );
};

export default Navbar;