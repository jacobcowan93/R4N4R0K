require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { initFirebase } = require('./config/firebase');
const blueprintsRouter = require('./routes/blueprints');
const marketplaceRouter = require('./routes/marketplace');
const authRouter = require('./routes/auth');
const trackerRouter = require('./routes/tracker');

initFirebase();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' }));
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

app.use('/api/blueprints', blueprintsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/auth', authRouter);
app.use('/api/tracker', trackerRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
