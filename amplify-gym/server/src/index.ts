import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { HttpError } from './lib/http';
import usersRouter from './routes/users';
import gymsRouter from './routes/gyms';
import exercisesRouter from './routes/exercises';
import routinesRouter from './routes/routines';
import sessionsRouter from './routes/sessions';
import suggestionsRouter from './routes/suggestions';
import recordsRouter from './routes/records';
import metricsRouter from './routes/metrics';
import recoveryRouter from './routes/recovery';
import mealsRouter from './routes/meals';
import analyticsRouter from './routes/analytics';
import exportRouter from './routes/export';

const app = express();

app.use(cors());
app.use(express.json());

const api = express.Router();

api.get('/health', (_req, res) => {
  res.json({ ok: true });
});

api.use('/users', usersRouter);
api.use('/gyms', gymsRouter);
api.use('/exercises', exercisesRouter);
api.use('/routines', routinesRouter);
api.use(sessionsRouter); // /sessions y /sets
api.use(suggestionsRouter); // /suggestions
api.use('/records', recordsRouter);
api.use(metricsRouter); // /metrics y /relative-strength
api.use('/recovery', recoveryRouter);
api.use('/meals', mealsRouter);
api.use('/analytics', analyticsRouter);
api.use(exportRouter); // /export.csv

app.use('/api', api);

// 404 para rutas no definidas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo centralizado de errores → { error: string }
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Errores conocidos de Prisma (registro no encontrado en update/delete)
  const code = (err as { code?: string })?.code;
  if (code === 'P2025') {
    res.status(404).json({ error: 'Recurso no encontrado' });
    return;
  }
  if (code === 'P2003') {
    res.status(400).json({ error: 'Referencia inválida (clave foránea)' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Amplify Gym API escuchando en http://localhost:${PORT}/api`);
});
