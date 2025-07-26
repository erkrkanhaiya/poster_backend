import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete, Logout } from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

const API_URL = '/admin/category';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

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
    setDeleteDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await apiDelete(`${API_URL}/${deleteDialog.id}`);
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
    setDeleteDialog({ open: false, id: null });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const handleReset = () => {
    setForm({ title: '', slug: '' });
    setEditingId(null);
  };

  return (
    <Box p={4}>
      
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
          {editingId && (
            <Button type="button" variant="outlined" color="secondary" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          )}
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
                <TableCell>Banners</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat._id}>
                  <TableCell>{cat.title}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat.bannerCount || 0}</TableCell>
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
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this category? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Category; 