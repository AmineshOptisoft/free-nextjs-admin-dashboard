import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kandi Ride App API',
      version: '1.0.0',
      description:
        'Complete API documentation for the Kandi Ride Hailing App. Use this reference to integrate the **Customer App** and **Rider App** in React Native.',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Common authentication (find-role)' },
      { name: 'Customer Auth', description: 'Customer registration & login' },
      { name: 'Customer Profile', description: 'Customer profile management' },
      { name: 'Customer Ride', description: 'Ride status, cancel, rate & history' },
      { name: 'Customer Actions', description: 'Fare estimate & ride actions' },
      { name: 'Ride Booking', description: 'Book a new ride (Customer)' },
      { name: 'Rider Auth', description: 'Rider login & authentication' },
      { name: 'Rider Profile', description: 'Rider profile & stats' },
      { name: 'Rider Actions', description: 'Accept, arrive, start, complete rides, location sync & earnings' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token you received from login. Example: **Bearer eyJhbGci...**',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(process.cwd(), 'src/app/api/**/*.ts'),
    path.join(process.cwd(), 'src/app/api/*.ts'),
  ],
};

export const getApiDocs = () => {
  const spec = swaggerJsdoc(options);
  return spec;
};