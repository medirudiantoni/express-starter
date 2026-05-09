import express from 'express';
import "dotenv/config";
import userRoutes from './routes/user.route.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use(express.json());

// Import and use user routes
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use('/api', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});