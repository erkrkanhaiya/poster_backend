require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Serve static files from public directory
app.use(express.static('public'));

// MongoDB Connection
console.log('process.env.MONGODB_URI', "MONGODB_URIMONGODB_URIMONGODB_URI");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/admin', require('./admin/admin.routes'));
app.use('/admin/settings', require('./admin/settings.routes'));
app.use('/users/settings', require('./users/settings.routes'));
app.use('/users/pages', require('./users/page.routes'));
app.use('/users/payment', require('./users/payment.routes'));
app.use('/users/categories', require('./users/category.routes'));
app.use('/users', require('./users/users.routes'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banner API',
      version: '1.0.0',
      description: 'API documentation for Banner project',
    },
    servers: [
      { url: 'http://localhost:' + (process.env.PORT || 5000) }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./admin/*.js', './users/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 