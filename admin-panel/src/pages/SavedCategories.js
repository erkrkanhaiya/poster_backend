import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Switch,
  Autocomplete,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import api from '../api';

const SavedCategories = () => {
  const [savedCategories, setSavedCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSavedCategory, setSelectedSavedCategory] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subcategories: [],
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchSavedCategories();
    fetchCategories();
    fetchSubcategories();
  }, [pagination.page, searchTerm]);

  const fetchSavedCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/saved-categories', {
        params: {
          page: pagination.page,
          limit: 10,
          search: searchTerm
        }
      });
      if (response.data.status) {
        setSavedCategories(response.data.data.savedCategories);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching saved categories:', error);
      showAlert('error', 'Failed to fetch saved categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await api.get('/admin/saved-categories/subcategories', {
        params: {
          category: categoryFilter
        }
      });
      if (response.data.status) {
        setSubcategories(response.data.data.subcategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/category');
      if (response.data.status) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setSelectedSavedCategory(null);
    setFormData({
      title: '',
      description: '',
      subcategories: [],
      sortOrder: 0,
      isActive: true
    });
    setOpen(true);
  };

  const handleEdit = (savedCategory) => {
    setEditMode(true);
    setSelectedSavedCategory(savedCategory);
    setFormData({
      title: savedCategory.title,
      description: savedCategory.description || '',
      subcategories: savedCategory.subcategories,
      sortOrder: savedCategory.sortOrder,
      isActive: savedCategory.isActive
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!formData.title.trim()) {
        showAlert('error', 'Title is required');
        return;
      }

      if (formData.subcategories.length === 0) {
        showAlert('error', 'At least one subcategory must be selected');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subcategories: formData.subcategories.map(sub => sub._id || sub),
        sortOrder: Number(formData.sortOrder),
        isActive: formData.isActive
      };

      if (editMode && selectedSavedCategory) {
        await api.put(`/admin/saved-categories/${selectedSavedCategory._id}`, payload);
        showAlert('success', 'Saved category updated successfully');
      } else {
        await api.post('/admin/saved-categories', payload);
        showAlert('success', 'Saved category created successfully');
      }

      setOpen(false);
      fetchSavedCategories();
    } catch (error) {
      console.error('Error saving:', error);
      showAlert('error', error.response?.data?.message || 'Failed to save saved category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this saved category?')) {
      try {
        await api.delete(`/admin/saved-categories/${id}`);
        showAlert('success', 'Saved category deleted successfully');
        fetchSavedCategories();
      } catch (error) {
        console.error('Error deleting:', error);
        showAlert('error', 'Failed to delete saved category');
      }
    }
  };

  const handleSubcategoryChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      subcategories: newValue
    }));
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      subcategories: [],
      sortOrder: 0,
      isActive: true
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    fetchSubcategories();
  }, [categoryFilter]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
            <CategoryIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Saved Categories
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage collections of subcategories for mobile app
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
          sx={{ borderRadius: 2 }}
        >
          Create Saved Category
        </Button>
      </Box>

      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3, borderRadius: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Saved Categories"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subcategories</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sort Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : savedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No saved categories found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                savedCategories.map((savedCategory) => (
                  <TableRow key={savedCategory._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {savedCategory.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {savedCategory.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {savedCategory.subcategories?.slice(0, 3).map((sub) => (
                          <Chip
                            key={sub._id}
                            label={sub.title}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {savedCategory.subcategories?.length > 3 && (
                          <Chip
                            label={`+${savedCategory.subcategories.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={savedCategory.isActive ? 'Active' : 'Inactive'}
                        color={savedCategory.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {savedCategory.sortOrder}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(savedCategory)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(savedCategory._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={pagination.currentPage === i + 1 ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </Box>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editMode ? 'Edit Saved Category' : 'Create New Saved Category'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Filter by Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={subcategories}
                getOptionLabel={(option) => `${option.title} (${option.category?.title})`}
                value={formData.subcategories}
                onChange={handleSubcategoryChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Subcategories"
                    placeholder="Choose subcategories..."
                    variant="outlined"
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <ListItem {...props}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <CategoryIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={option.title}
                      secondary={option.category?.title}
                    />
                  </ListItem>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={`${option.title} (${option.category?.title})`}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            startIcon={<CancelIcon />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            variant="contained"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavedCategories;