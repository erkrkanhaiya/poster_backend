import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, MenuItem, Snackbar, Alert, Grid, IconButton, LinearProgress } from '@mui/material';
import { apiGet } from '../api';
import DeleteIcon from '@mui/icons-material/Close';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_FRONTEND_IP}/admin/category`;


const AddBanner = () => {
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // Data URLs
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadProgress, setUploadProgress] = useState(0);
  // Category add form
  const [catTitle, setCatTitle] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiGet(API_URL);
      const data = res.data;
      if (data.status) setCategories(data.data.categories || []);
    } catch {}
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })).then(setPreviews);
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || images.length === 0) {
      setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    images.forEach(img => formData.append('images', img));
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${process.env.REACT_APP_FRONTEND_IP}/admin/banner`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      setSnackbar({ open: true, message: 'Banner added', severity: 'success' });
      setTitle('');
      setImages([]);
      setPreviews([]);
      setCategory('');
      setUploadProgress(0);
    } catch {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
      setUploadProgress(0);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catTitle || !catSlug) return;
    setCatLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: catTitle, slug: catSlug })
      });
      const data = await res.json();
      if (data.status) {
        setSnackbar({ open: true, message: 'Category added', severity: 'success' });
        setCatTitle('');
        setCatSlug('');
        fetchCategories();
      } else {
        setSnackbar({ open: true, message: data.message || 'Add category failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
    setCatLoading(false);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>Add Banner</Typography>
      <Box display="flex" gap={4}>
        <Paper sx={{ p: 3, maxWidth: 500, flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ my: 2 }}
            >
              Select Images
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {previews.length > 0 && (
              <Grid container spacing={2} mb={2}>
                {previews.map((src, idx) => (
                  <Grid item xs={4} key={idx} sx={{ position: 'relative' }}>
                    <img src={src} alt={`Preview ${idx}`} style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 4 }} />
                    <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.7)' }} onClick={() => handleRemoveImage(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ my: 2 }} />
            )}
            <TextField
              label="Category"
              select
              fullWidth
              margin="normal"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>{cat.title}</MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={images.length === 0}>
              Submit
            </Button>
          </form>
        </Paper>
        <Paper sx={{ p: 3, maxWidth: 350, flex: 1 }}>
          <Typography variant="h6" mb={2}>Add Category</Typography>
          <form onSubmit={handleAddCategory}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={catTitle}
              onChange={e => setCatTitle(e.target.value)}
              required
            />
            <TextField
              label="Slug"
              fullWidth
              margin="normal"
              value={catSlug}
              onChange={e => setCatSlug(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="secondary" fullWidth disabled={catLoading}>
              {catLoading ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </Paper>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddBanner; 