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

 


const apiV1Router = express.Router();

apiV1Router.use('/admin', require('./admin/admin.routes'));
apiV1Router.use('/admin/settings', require('./admin/settings.routes'));
apiV1Router.use('/admin/home-categories', require('./admin/homeCategory.routes'));
  // apiV1Router.use('/admin/signed-url', require('./admin/signedUrl.routes'));
  // apiV1Router.use('/admin/upload-url', require('./admin/simpleSignedUrl.routes'));
apiV1Router.use('/users/settings', require('./users/settings.routes'));
apiV1Router.use('/users/pages', require('./users/page.routes'));
apiV1Router.use('/users/categories', require('./users/category.routes'));
apiV1Router.use('/users/banners', require('./users/banner.routes'));
apiV1Router.use('/users/home-categories', require('./users/homeCategory.routes'));
console.log('Loading upload-url routes...');
apiV1Router.use('/users/upload-url', require('./users/simpleSignedUrl.routes'));
console.log('Upload-url routes loaded successfully');

apiV1Router.use('/users', require('./users/users.routes'));



// Test route to verify basic routing
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Basic routing is working!' });
});

app.use('/api/v1', apiV1Router);

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