import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Box,

  Paper,
  Chip,
  CardHeader,
  Avatar,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material';
import {
  Settings as SettingsIcon,
  PhoneAndroid,
  Apple,
  Update,
  Build,
  Info,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import api from '../api';

const Settings = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    isForceUpdate: false,
    appVersion: '',
    isMaintenance: false,
    maintenanceMessage: '',
    minVersion: '',
    updateMessage: '',
    playStoreUrl: '',
    appStoreUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.status) {
        setSettings(response.data.data.settings);
      } else {
        showAlert('error', 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showAlert('error', 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', settings);
      if (response.data.status) {
        showAlert('success', 'Settings updated successfully');
        setSettings(response.data.data.settings);
      } else {
        showAlert('error', 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.primary.main, 
            mr: 2,
            width: 56,
            height: 56
          }}>
            <SettingsIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              App Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your application configuration and preferences
            </Typography>
          </Box>
        </Box>
        
        {/* Status Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={settings.isMaintenance ? <Warning /> : <CheckCircle />}
            label={settings.isMaintenance ? 'Maintenance Mode' : 'App Online'}
            color={settings.isMaintenance ? 'warning' : 'success'}
            variant="outlined"
          />
          <Chip
            icon={settings.isForceUpdate ? <ErrorIcon /> : <Info />}
            label={settings.isForceUpdate ? 'Force Update Active' : 'Normal Updates'}
            color={settings.isForceUpdate ? 'error' : 'info'}
            variant="outlined"
          />
          <Chip
            icon={<Update />}
            label={`Version ${settings.appVersion}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
      
      {alert.show && (
        <Alert 
          severity={alert.type} 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          {alert.message}
        </Alert>
      )}

      {/* App Version Settings Card */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 3,
        boxShadow: theme.shadows[8],
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <Update />
            </Avatar>
          }
          title="App Version Management"
          subheader="Control app updates and version requirements"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current App Version"
                value={settings.appVersion}
                onChange={(e) => handleInputChange('appVersion', e.target.value)}
                helperText="Latest version of the app (e.g., 1.2.0)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Required Version"
                value={settings.minVersion}
                onChange={(e) => handleInputChange('minVersion', e.target.value)}
                helperText="Minimum version users must have"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.isForceUpdate}
                    onChange={handleSwitchChange('isForceUpdate')}
                    color="primary"
                  />
                }
                label="Force Update Required"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Update Message"
                value={settings.updateMessage}
                onChange={(e) => handleInputChange('updateMessage', e.target.value)}
                helperText="Message shown when users need to update"
              />
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* Store URLs Card */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 3,
        boxShadow: theme.shadows[8],
        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.success.main }}>
              <PhoneAndroid />
            </Avatar>
          }
          title="App Store URLs"
          subheader="Configure download links for mobile platforms"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Google Play Store URL"
                value={settings.playStoreUrl}
                onChange={(e) => handleInputChange('playStoreUrl', e.target.value)}
                helperText="Android app download link"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneAndroid sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apple App Store URL"
                value={settings.appStoreUrl}
                onChange={(e) => handleInputChange('appStoreUrl', e.target.value)}
                helperText="iOS app download link"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Apple sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Maintenance Mode Card */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 3,
        boxShadow: theme.shadows[8],
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.02)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
              <Build />
            </Avatar>
          }
          title="Maintenance Mode"
          subheader="Control app availability and maintenance messaging"
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.isMaintenance}
                    onChange={handleSwitchChange('isMaintenance')}
                    color="warning"
                    size="large"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1, color: settings.isMaintenance ? 'warning.main' : 'action.disabled' }} />
                    <Typography variant="body1">
                      {settings.isMaintenance ? 'Maintenance Active' : 'Maintenance Inactive'}
                    </Typography>
                  </Box>
                }
                sx={{ 
                  '& .MuiFormControlLabel-label': { 
                    fontSize: '1rem', 
                    fontWeight: 500 
                  } 
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Maintenance Message"
                value={settings.maintenanceMessage}
                onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                helperText="Message shown to users during maintenance"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: alpha(theme.palette.primary.main, 0.04),
        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ready to save changes?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your changes will be applied immediately after saving
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>

      {/* Current Settings Summary */}
      <Card sx={{ 
        mt: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.info.main }}>
              <Info />
            </Avatar>
          }
          title="Configuration Summary"
          subheader="Current application settings overview"
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                  Version Control
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">App Version:</Typography>
                  <Chip label={settings.appVersion || 'Not set'} size="small" color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Min Version:</Typography>
                  <Chip label={settings.minVersion || 'Not set'} size="small" color="secondary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Force Update:</Typography>
                  <Chip 
                    label={settings.isForceUpdate ? 'Enabled' : 'Disabled'} 
                    size="small" 
                    color={settings.isForceUpdate ? 'error' : 'success'} 
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                  App Status & Store Links
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Maintenance:</Typography>
                  <Chip 
                    label={settings.isMaintenance ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={settings.isMaintenance ? 'warning' : 'success'} 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Play Store:</Typography>
                  <Chip 
                    label={settings.playStoreUrl ? 'Configured' : 'Not set'} 
                    size="small" 
                    color={settings.playStoreUrl ? 'success' : 'default'} 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">App Store:</Typography>
                  <Chip 
                    label={settings.appStoreUrl ? 'Configured' : 'Not set'} 
                    size="small" 
                    color={settings.appStoreUrl ? 'success' : 'default'} 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Settings;