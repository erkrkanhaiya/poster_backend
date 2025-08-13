import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogContent, DialogTitle, Button, Stack, Tooltip } from '@mui/material';
import { apiGet, apiDelete } from '../api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [openImg, setOpenImg] = useState(null); // {src, title}
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await apiGet('/admin/banner');
      const data = res.data;
      if (data.status) setBanners(data.data.banners || []);
    } catch {}
  };

  const handleImageClick = (src, title) => {
    setOpenImg({ src, title });
  };
  const handleCloseImg = () => setOpenImg(null);

  const handleDeleteImage = async (bannerId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await apiDelete(`/admin/banner/${bannerId}/image`, { data: { imageUrl } });
      fetchBanners();
    } catch {
      alert('Failed to delete image');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await apiDelete(`/admin/banner/${bannerId}`);
      fetchBanners();
    } catch {
      alert('Failed to delete banner');
    }
  };

  const dummyBanners = [
    {
      _id: 'dummy1',
      title: 'Summer Sale',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
      ],
      category: { title: 'Fashion' }
    },
    {
      _id: 'dummy2',
      title: 'Electronics Fest',
      images: [
        'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80'
      ],
      category: { title: 'Electronics' }
    },
    {
      _id: 'dummy3',
      title: 'Book Bonanza',
      images: [
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=400&q=80'
      ],
      category: { title: 'Books' }
    }
  ];

  return (
    <Box p={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Banners</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/add-banner')}>
          Add Banner
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Images</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="center"># Images</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <>
                      <Typography variant="body1" mb={2}>No banners found. Showing demo data:</Typography>
                      <Table size="small">
                        <TableBody>
                          {dummyBanners.map(banner => (
                            <TableRow key={banner._id}>
                              <TableCell sx={{ minWidth: 180 }}>
                                <Box display="flex" gap={1} sx={{ overflowX: 'auto', maxWidth: 220 }}>
                                  {banner.images.map((img, idx) => (
                                    <Box key={idx} position="relative" display="inline-block">
                                      <Tooltip title="Click to enlarge">
                                        <img
                                          src={img}
                                          alt={banner.title}
                                          style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #eee' }}
                                          onClick={() => handleImageClick(img, banner.title)}
                                        />
                                      </Tooltip>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        style={{ position: 'absolute', top: -8, right: -8, background: 'white' }}
                                        onClick={() => handleDeleteImage(banner._id, img)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ))}
                                </Box>
                              </TableCell>
                              <TableCell>{banner.title}</TableCell>
                              <TableCell>{banner.category?.title || ''}</TableCell>
                              <TableCell align="center">{banner.images.length}</TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit">
                                  <IconButton><EditIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton color="error" onClick={() => handleDeleteBanner(banner._id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  </TableCell>
                </TableRow>
              ) : banners.map(banner => (
                <TableRow key={banner._id}>
                  <TableCell sx={{ minWidth: 180 }}>
                    <Box display="flex" gap={1} sx={{ overflowX: 'auto', maxWidth: 220 }}>
                      {banner.images.map((img, idx) => (
                        <Box key={idx} position="relative" display="inline-block">
                          <Tooltip title="Click to enlarge">
                            <img
                              src={img}
                              alt={banner.title}
                              style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #eee' }}
                              onClick={() => handleImageClick(img, banner.title)}
                            />
                          </Tooltip>
                          <IconButton
                            size="small"
                            color="error"
                            style={{ position: 'absolute', top: -8, right: -8, background: 'white' }}
                            onClick={() => handleDeleteImage(banner._id, img)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{banner.title}</TableCell>
                  <TableCell>{banner.category?.title || ''}</TableCell>
                  <TableCell align="center">{banner.images.length}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDeleteBanner(banner._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={!!openImg} onClose={handleCloseImg} maxWidth="md">
        <DialogTitle>{openImg?.title}</DialogTitle>
        <DialogContent>
          {openImg && (
            <img src={openImg.src} alt={openImg.title} style={{ width: '100%', maxWidth: 600, borderRadius: 8 }} />
          )}
          <Box mt={2} textAlign="right">
            <Button onClick={handleCloseImg} variant="contained">Close</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Banners; 