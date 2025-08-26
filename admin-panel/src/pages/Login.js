import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, CircularProgress } from '@mui/material';
import { apiPost } from '../api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    try {
      const res = await apiPost('/admin/login', { email, password });
      const data = res.data;
      if (!data.status) {
        setError(data.message || 'Login failed');
        setSnackbar({ open: true, message: data.message || 'Login failed', severity: 'error' });
        setLoading(false);
        return;
      }
      localStorage.setItem('adminToken', data.data.token);
      setSnackbar({ open: true, message: 'Login successful', severity: 'success' });
      setLoading(false);
      if (onLogin) onLogin();
    } catch (err) {
      setError('Server error');
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Token expiration check (simple, for demo)
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('adminToken');
          setSnackbar({ open: true, message: 'Session expired. Please login again.', severity: 'warning' });
        }
      } catch { }
    }
  }, []);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setSnackbar({ open: true, message: 'Logged out', severity: 'info' });
    setEmail('');
    setPassword('');
  };

  const isLoggedIn = !!localStorage.getItem('adminToken');

  if (isLoggedIn) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h6">You are already logged in.</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 2 }}>Logout</Button>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2} align="center">Admin Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Box mt={2} position="relative">
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </form>


        <Typography
          variant="body2"
          align="center"
          sx={{ color: 'text.secondary', mt: 4, fontSize: '8px' }}
        >
          Latest 26.2-Aug-25
        </Typography>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Paper>

    </Box>
  );
};

export default Login; 