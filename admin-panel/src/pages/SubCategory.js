import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import api from '../api';

const SubCategory = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    sortOrder: 0,
    images: []
  });

  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        api.get('/admin/subcategories'),
        api.get('/admin/category')
      ]);
      
      setSubcategories(subcategoriesRes.data.data.subcategories || []);
      setCategories(categoriesRes.data.data.categories || []);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategoriesByCategory = async (categoryId) => {
    if (!categoryId) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/admin/subcategories/by-category/${categoryId}`);
      setSubcategories(response.data.data.subcategories || []);
    } catch (err) {
      setError('Failed to fetch add banners');
      console.error('Error fetching add banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    fetchSubcategoriesByCategory(categoryId);
  };

  const handleOpenDialog = (subcategory = null) => {
    setEditingSubcategory(subcategory);
    
    if (subcategory) {
      // Editing existing subcategory - populate with existing data
      setFormData({
        title: subcategory.title,
        category: subcategory.category._id,
        sortOrder: subcategory.sortOrder || 0,
        images: (subcategory.images || []).map(img => ({
          ...img,
          language: img.language || 'english',
          // Don't set file property for existing images
          file: null,
          originalUrl: img.url, // Store original URL for replacement cancel
          isReplacement: false
        }))
      });
    } else {
      // Creating new subcategory
      setFormData({
        title: '',
        category: selectedCategory || '',
        sortOrder: 0,
        images: []
      });
    }
    
    setOpenDialog(true);
  };

  const handleViewDetails = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setDetailsDialog(true);
  };



  const handleCloseDialog = () => {
    // Clean up blob URLs to prevent memory leaks
    formData.images.forEach(image => {
      if (image.url && image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });
    
    setOpenDialog(false);
    setEditingSubcategory(null);
    setSubmitting(false);
    setFormData({
      title: '',
      category: '',
      sortOrder: 0,
      images: []
    });
  };

  const uploadImages = async () => {
    const uploadedImages = [];
    
    for (let i = 0; i < formData.images.length; i++) {
      const image = formData.images[i];
      
      if (image.file) {
        // For files (both new and replacement files), upload via multer
        try {
          const formDataForFile = new FormData();
          formDataForFile.append('images', image.file);
          
          const token = localStorage.getItem('adminToken');
          const uploadResponse = await fetch(`${process.env.REACT_APP_FRONTEND_IP}/admin/subcategories/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formDataForFile
          });
          
          const uploadData = await uploadResponse.json();
          if (uploadData.status && uploadData.data.imageUrl) {
            uploadedImages.push({
              url: uploadData.data.imageUrl,
              alt: image.alt || image.file.name.split('.')[0],
              language: image.language || 'english'
            });
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          throw new Error(`Failed to upload ${image.file.name}`);
        }
      } else if (image.url && !image.url.startsWith('blob:')) {
        // Existing image that hasn't been replaced
        uploadedImages.push({
          url: image.url,
          alt: image.alt,
          language: image.language || 'english'
        });
      }
    }
    
    return uploadedImages;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      setSubmitting(true);

      if (!formData.title.trim() || !formData.category) {
        setError('Title and category are required');
        setSubmitting(false);
        return;
      }

      // Show upload progress for files
      const hasFiles = formData.images.some(img => img.file);
      if (hasFiles) {
        setSuccess('Uploading images...');
      }

      // Upload images first
      const uploadedImages = await uploadImages();

      setSuccess('Saving banner...');

      const data = {
        title: formData.title.trim(),
        category: formData.category,
        sortOrder: parseInt(formData.sortOrder) || 0,
        images: uploadedImages
      };

      let response;
      if (editingSubcategory) {
        response = await api.put(`/admin/subcategories/${editingSubcategory._id}`, data);
        setSuccess('Add banner updated successfully');
      } else {
        response = await api.post('/admin/subcategories', data);
        setSuccess('Add banner created successfully');
      }

      handleCloseDialog();
      if (selectedCategory) {
        fetchSubcategoriesByCategory(selectedCategory);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error('Error saving add banner:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save add banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (subcategory) => {
    try {
      setError('');
      await api.patch(`/admin/subcategories/${subcategory._id}/toggle-status`);
      setSuccess(`Add banner ${subcategory.isSuspended ? 'activated' : 'suspended'} successfully`);
      
      if (selectedCategory) {
        fetchSubcategoriesByCategory(selectedCategory);
      } else {
        fetchData();
      }
    } catch (err) {
      setError('Failed to toggle add banner status');
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (subcategory) => {
    if (!window.confirm(`Are you sure you want to delete "${subcategory.title}"?`)) {
      return;
    }

    try {
      setError('');
      await api.delete(`/admin/subcategories/${subcategory._id}`);
      setSuccess('Add banner deleted successfully');
      
      if (selectedCategory) {
        fetchSubcategoriesByCategory(selectedCategory);
      } else {
        fetchData();
      }
    } catch (err) {
      setError('Failed to delete add banner');
      console.error('Error deleting add banner:', err);
    }
  };



  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', language: 'english' }]
    }));
  };

  const updateImageField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const replaceImageFile = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => 
          i === index ? { 
            ...img, 
            file: file,
            url: newUrl,
            alt: img.alt || file.name.split('.')[0],
            isReplacement: true, // Flag to indicate this is a replacement
            originalUrl: img.originalUrl || img.url // Store original URL for cancel
          } : img
        )
      }));
    }
  };

  const cancelReplacement = (index) => {
    const imageToCancel = formData.images[index];
    // Clean up blob URL from replacement file
    if (imageToCancel.url && imageToCancel.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToCancel.url);
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index && img.isReplacement ? { 
          ...img, 
          file: null,
          url: img.originalUrl,
          isReplacement: false
        } : img
      )
    }));
  };

  const removeImageField = (index) => {
    // Clean up blob URL to prevent memory leaks
    const imageToRemove = formData.images[index];
    if (imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Create preview URLs and store files
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file), // Preview URL
      alt: file.name.split('.')[0],
      language: 'english',
      file: file // Store the actual file
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };



  if (loading && subcategories.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Add Banner Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Banner
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filter by Category</Typography>
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryFilter}
              label="Select Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Add Banners
              </Typography>
              <Typography variant="h4">
                {subcategories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" color="success.main">
                {subcategories.filter(s => !s.isSuspended).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Suspended
              </Typography>
              <Typography variant="h4" color="warning.main">
                {subcategories.filter(s => s.isSuspended).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                With Images
              </Typography>
              <Typography variant="h4" color="info.main">
                {subcategories.filter(s => s.images && s.images.length > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Banners Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Main Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcategories.map((subcategory) => (
              <TableRow key={subcategory._id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {subcategory.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {subcategory.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  {subcategory.category?.title || 'N/A'}
                </TableCell>
                <TableCell>
                  {subcategory.isSuspended ? 'Suspended' : 'Active'}
                </TableCell>
                <TableCell>
                  {subcategory.images?.length || 0} images
                </TableCell>
                <TableCell>{subcategory.sortOrder || 0}</TableCell>
                <TableCell>
                  {new Date(subcategory.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(subcategory)}
                    title="View Details"
                    color="info"
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleStatus(subcategory)}
                    title={subcategory.isSuspended ? 'Activate' : 'Suspend'}
                  >
                    {subcategory.isSuspended ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(subcategory)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(subcategory)}
                    title="Delete"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {subcategories.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No add banners found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingSubcategory ? (
              <>
                <EditIcon />
                Edit Add Banner: {editingSubcategory.title}
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  ({editingSubcategory.images?.length || 0} existing images)
                </Typography>
              </>
            ) : (
              <>
                <AddIcon />
                Add New Add Banner
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>

            <Grid item xs={12} md={8}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel id="category-select-label" sx={{ bgcolor: 'background.paper', px: 1 }}>
                    Main Category *
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    label="Main Category *"
                    variant="outlined"
                    sx={{ 
                      minHeight: 56,
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 'auto'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          minWidth: 250,
                        },
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                    }}
                  >
                    {categories.length === 0 ? (
                      <MenuItem disabled>
                        <em>No categories available</em>
                      </MenuItem>
                    ) : (
                      categories.map((category) => (
                        <MenuItem key={category._id} value={category._id} sx={{ py: 1.5 }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {category.title}
                            </Typography>
                            {/* <Typography variant="caption" color="text.secondary">
                              {category.slug}
                            </Typography> */}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {!formData.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      Please select a main category
                    </Typography>
                  )}
                </FormControl>
              </Grid>



              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title *"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  variant="outlined"
                  required
                  placeholder="Enter banner title"
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                  variant="outlined"
                  placeholder="0"
                  helperText="Lower numbers appear first"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Images Section */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Images</Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    startIcon={<AddIcon />}
                  >
                    Select Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={handleFileSelect}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addImageField}
                    startIcon={<AddIcon />}
                  >
                    Add URL
                  </Button>
                </Box>
              </Box>
              
              {formData.images.map((image, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Image Preview */}
                    {image.url && (
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={image.url}
                            alt={image.alt || 'Preview'}
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: 1,
                              borderColor: image.isReplacement ? 'success.main' : 'divider',
                              opacity: image.isReplacement ? 0.8 : 1
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {/* Replacement indicator */}
                          {image.isReplacement && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 2,
                                left: 2,
                                bgcolor: 'success.main',
                                color: 'white',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                            >
                              NEW
                            </Box>
                          )}
                          {/* File type indicator */}
                          {image.file && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                            >
                              FILE
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={image.url ? 3 : 4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          fullWidth
                          label={image.file ? "File Selected" : "Image URL"}
                          value={image.file ? image.file.name : image.url}
                          onChange={(e) => updateImageField(index, 'url', e.target.value)}
                          size="small"
                          disabled={!!image.file}
                          helperText={
                            image.file ? 
                              (image.isReplacement ? "Replacement file selected" : "Local file selected") : 
                              "Enter image URL"
                          }
                        />
                        {/* Replace button for existing images */}
                        {image.url && !image.url.startsWith('blob:') && !image.file && !image.isReplacement && (
                          <Button
                            variant="outlined"
                            size="small"
                            component="label"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Replace with File
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => replaceImageFile(index, e)}
                            />
                          </Button>
                        )}
                        {/* Cancel replacement button */}
                        {image.isReplacement && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="warning"
                            onClick={() => cancelReplacement(index)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Cancel Replacement
                          </Button>
                        )}
                        {/* Show replacement indicator */}
                        {image.isReplacement && (
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                            ✓ Will be replaced with new file
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Alt Text"
                        value={image.alt}
                        onChange={(e) => updateImageField(index, 'alt', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={image.language || 'english'}
                          onChange={(e) => updateImageField(index, 'language', e.target.value)}
                          label="Language"
                        >
                          <MenuItem value="english">English</MenuItem>
                          <MenuItem value="hindi">Hindi</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        onClick={() => removeImageField(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              {formData.images.length === 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No images added yet
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title.trim() || !formData.category || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Uploading...' : (editingSubcategory ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Banner Details</DialogTitle>
        <DialogContent>
          {selectedSubcategory && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography variant="body1"><strong>Title:</strong> {selectedSubcategory.title}</Typography>
                  <Typography variant="body1"><strong>Slug:</strong> {selectedSubcategory.slug}</Typography>
                  <Typography variant="body1"><strong>Category:</strong> {selectedSubcategory.category?.title || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Sort Order:</strong> {selectedSubcategory.sortOrder || 0}</Typography>
                  <Typography variant="body1"><strong>Status:</strong> {selectedSubcategory.isSuspended ? 'Suspended' : 'Active'}</Typography>
                  <Typography variant="body1"><strong>ID:</strong> {selectedSubcategory._id}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Timestamps</Typography>
                  <Typography variant="body1"><strong>Created:</strong> {new Date(selectedSubcategory.createdAt).toLocaleString()}</Typography>
                  <Typography variant="body1"><strong>Updated:</strong> {new Date(selectedSubcategory.updatedAt).toLocaleString()}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Images ({selectedSubcategory.images?.length || 0})</Typography>
                  {selectedSubcategory.images && selectedSubcategory.images.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedSubcategory.images.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card sx={{ height: '100%' }}>
                            <Box
                              component="img"
                              src={image.url}
                              alt={image.alt || 'Image'}
                              sx={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <CardContent>
                              <Typography variant="body2"><strong>Language:</strong> {image.language || 'english'}</Typography>
                              <Typography variant="body2"><strong>Alt Text:</strong> {image.alt || 'No alt text'}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ wordBreak: 'break-all' }}>
                                {image.url}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No images available</Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategory;