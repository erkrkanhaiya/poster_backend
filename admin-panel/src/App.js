import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton, Menu, MenuItem, Switch } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import CollectionsIcon from '@mui/icons-material/Collections';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SettingsIcon from '@mui/icons-material/Settings';
import Home from './pages/Home';
import Category from './pages/Category';
import SubCategory from './pages/SubCategory';
import AddBanner from './pages/AddBanner';
import Banners from './pages/Banners';
import SavedCategories from './pages/SavedCategories';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const drawerWidth = 220;

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Banners', icon: <CollectionsIcon />, path: '/banners' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/category' },
  { text: 'Add Banner', icon: <SubdirectoryArrowRightIcon />, path: '/subcategory' },
  { text: 'Saved Categories', icon: <BookmarkIcon />, path: '/saved-categories' },
];

function MainApp() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };
  const handleThemeToggle = () => {
    setDarkMode((prev) => !prev);
  };
  const handleNavigateToSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>
            <IconButton color="inherit" onClick={handleSettingsClick} size="large">
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleNavigateToSettings}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Switch checked={darkMode} onChange={handleThemeToggle} />
                </ListItemIcon>
                <ListItemText primary="Dark Theme" />
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem button key={item.text} component={Link} to={item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }}>
          <Toolbar />
                      <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/banners" element={<Banners />} />
              <Route path="/add-banner" element={<AddBanner />} />
              <Route path="/category" element={<Category />} />
              <Route path="/subcategory" element={<SubCategory />} />
              <Route path="/saved-categories" element={<SavedCategories />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
