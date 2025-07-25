import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Edit, Delete, Logout } from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

const API_URL = '/admin/category';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiGet(API_URL);
      const data = res.data;
      if (data.status) setCategories(data.data.categories || []);
      else setSnackbar({ open: true, message: data.message || 'Failed to fetch categories', severity: 'error' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setSnackbar({ open: true, message: 'Title and slug are required', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        // Update
        const res = await apiPut(`${API_URL}/${editingId}`, form);
        const data = res.data;
        if (data.status) {
          setSnackbar({ open: true, message: 'Category updated', severity: 'success' });
          fetchCategories();
        } else {
          setSnackbar({ open: true, message: data.message || 'Update failed', severity: 'error' });
        }
        setEditingId(null);
      } else {
        // Add
        const res = await apiPost(API_URL, form);
        const data = res.data;
        if (data.status) {
          setSnackbar({ open: true, message: 'Category added', severity: 'success' });
          fetchCategories();
        } else {
          setSnackbar({ open: true, message: data.message || 'Add failed', severity: 'error' });
        }
      }
      setForm({ title: '', slug: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setForm({ title: cat.title, slug: cat.slug });
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await apiDelete(`${API_URL}/${id}`);
      const data = res.data;
      if (data.status) {
        setSnackbar({ open: true, message: 'Category deleted', severity: 'info' });
        fetchCategories();
      } else {
        setSnackbar({ open: true, message: data.message || 'Delete failed', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
    setLoading(false);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Category Management</Typography>
        <Button variant="outlined" color="secondary" startIcon={<Logout />} onClick={handleLogout}>Logout</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 4 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16 }}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <TextField
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {editingId ? 'Update' : 'Add'}
          </Button>
        </form>
      </Paper>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat._id}>
                  <TableCell>{cat.title}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(cat)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(cat._id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Category; 