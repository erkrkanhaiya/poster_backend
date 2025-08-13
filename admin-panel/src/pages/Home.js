import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiGet } from '../api';

const monthlyData = [
  { month: 'Jan', transactions: 120 },
  { month: 'Feb', transactions: 98 },
  { month: 'Mar', transactions: 150 },
  { month: 'Apr', transactions: 200 },
  { month: 'May', transactions: 170 },
  { month: 'Jun', transactions: 210 },
];

const recentTransactions = [
  { id: 1, date: '2024-06-01', amount: 120, user: 'Alice' },
  { id: 2, date: '2024-06-02', amount: 98, user: 'Bob' },
  { id: 3, date: '2024-06-03', amount: 150, user: 'Charlie' },
  { id: 4, date: '2024-06-04', amount: 200, user: 'David' },
];

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/admin/banner');
      const data = res.data;
      if (data.status) setBanners(data.data.banners || []);
    } catch {}
    setLoading(false);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>Dashboard</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>Monthly Transactions</Typography>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={250} />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="transactions" stroke="#1976d2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>Recent Transactions</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                  </TableRow>
                ))
              ) : (
                recentTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.user}</TableCell>
                    <TableCell>${tx.amount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Banners</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={80} height={40} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  </TableRow>
                ))
              ) : (
                banners.map(banner => (
                  <TableRow key={banner._id}>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell>
                      {banner.images && banner.images.length > 0 ? (
                        <img src={banner.images[0]} alt={banner.title} style={{ maxWidth: 80, maxHeight: 40 }} />
                      ) : (
                        <span style={{ color: '#aaa' }}>No image</span>
                      )}
                    </TableCell>
                    <TableCell>{banner.category?.title || ''}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Home; 