// index.js (tu archivo original)
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { PORT } = require('./env');
const { authOptional } = require('./middleware/auth');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(authOptional);

// Rutas existentes
app.use('/users', require('./routes/users'));
app.use('/me', require('./routes/me'));
app.use('/meditation', require('./routes/meditation'));
app.use('/users', require('./routes/nutrition'));
app.use('/users', require('./routes/diet'));
app.use('/trainers', require('./routes/trainers'));
app.use('/user-trainer', require('./routes/user-trainer'));
app.use('/program', require('./routes/program'));
app.use('/', require('./routes/assignment'));
app.use('/', require('./routes/logs'));
app.use('/ai', require('./routes/ai'));

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
