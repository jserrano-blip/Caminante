# Amplify Gym — Contrato de API REST

Base URL: `http://<host>:4000/api`. Todas las respuestas son JSON (`Content-Type: application/json`), excepto la exportación CSV. Fechas en ISO 8601. Pesos **siempre en kg** en la API; la conversión KG/LB es responsabilidad del cliente.

Errores: `{ "error": string }` con status 400/404/500.

## Usuarios (perfiles privados)
- `GET    /users` → `User[]`
- `POST   /users` body `{ name, avatarColor?, weightUnit?, sex? }` → `User`
- `PATCH  /users/:id` → `User`
- `DELETE /users/:id` → `{ ok: true }`

## Gimnasios y equipo
- `GET    /gyms?userId=` → `(Gym & { equipment: EquipmentItem[] })[]`
- `POST   /gyms` body `{ userId, name, notes? }` → `Gym`
- `PATCH  /gyms/:id` / `DELETE /gyms/:id`
- `PUT    /gyms/:id/equipment` body `{ equipment: EquipmentItemInput[] }` — reemplaza el inventario completo → `EquipmentItem[]`
  - `EquipmentItemInput = { type: 'BARBELL'|'PLATE'|'DUMBBELL'|'MACHINE', name?, weightKg?, count?, stackStepKg?, stackMaxKg? }`

## Ejercicios (catálogo + variantes)
- `GET    /exercises?userId=` → globales (userId null) + propios, con `variants` incluidas
- `POST   /exercises` body `{ userId, name, muscleGroup, category, variantOfId?, notes?, isPowerlift? }`
- `PATCH  /exercises/:id` / `DELETE /exercises/:id`

## Rutinas (plantillas)
- `GET    /routines?userId=` → `(Routine & { exercises: (RoutineExercise & { exercise: Exercise })[] })[]`
- `POST   /routines` body `{ userId, name, description?, exercises: [{ exerciseId, order, targetSets, targetReps, targetRpe?, restSeconds }] }`
- `PUT    /routines/:id` — mismo body, reemplaza ejercicios
- `DELETE /routines/:id`

## Sesiones de entrenamiento
- `GET    /sessions?userId=&limit=` → sesiones con `sets` (incl. `exercise`) ordenadas por fecha desc
- `GET    /sessions/:id` → sesión completa
- `POST   /sessions` body `{ userId, gymId?, routineId?, name }` → sesión iniciada
- `PATCH  /sessions/:id` body `{ name?, notes?, gymId? }`
- `DELETE /sessions/:id`
- `POST   /sessions/:id/sets` body `{ exerciseId, setNumber, reps, weightKg, unit?, rpe?, rir?, isWarmup? }` → `WorkoutSet`
- `PATCH  /sets/:id` / `DELETE /sets/:id`
- `POST   /sessions/:id/finish` → cierra la sesión, detecta PRs nuevos y devuelve
  `{ session, summary: { durationMin, totalVolumeKg, totalSets, newRecords: (PersonalRecord & { exercise })[] } }`
  - Detección de PR por ejercicio (solo series efectivas, no warmup): peso máximo (WEIGHT), e1RM Epley (E1RM), volumen de sesión por ejercicio (VOLUME), reps máximas a cualquier peso ≥ peso del récord anterior (REPS — opcional, mínimo implementar WEIGHT, E1RM y VOLUME).

## Sobrecarga progresiva inteligente
- `GET /suggestions?userId=&exerciseId=` →
  `{ last: { date, sets: [{ reps, weightKg, rpe }] } | null, suggestion: { weightKg, reps, rationale } | null }`
  - Regla: toma la última sesión con ese ejercicio. Si todas las series efectivas alcanzaron el tope de reps con RPE ≤ 8 (o RIR ≥ 2), sugiere +2.5 kg (+5 kg en patrones de pierna: ejercicios con muscleGroup PIERNA). Si RPE ≥ 9.5 en alguna serie, sugiere mantener peso y -1 rep o mismo esquema. En otro caso, repetir peso buscando +1 rep.

## Récords personales
- `GET /records?userId=&exerciseId?=` → `(PersonalRecord & { exercise })[]`

## Métricas corporales y fuerza relativa
- `GET    /metrics?userId=` / `POST /metrics` body `{ userId, weightKg, heightCm?, bodyFatPct?, date? }` / `DELETE /metrics/:id`
- `GET    /relative-strength?userId=` →
  `{ bodyWeightKg, sex, lifts: [{ exerciseId, name, bestE1rmKg, wilks, dots }], totalWilks?, totalDots? }`
  - Solo ejercicios `isPowerlift`. Fórmulas Wilks (coeficientes 2020) y DOTS estándar.

## Recuperación
- `GET /recovery?userId=` / `POST /recovery` body `{ userId, sleepHours, soreness, fatigue, notes?, date? }` / `DELETE /recovery/:id`

## Meal Prep
- `GET    /meals?userId=` → globales + propios
- `POST   /meals` / `PATCH /meals/:id` / `DELETE /meals/:id`

## Analítica (dashboard)
- `GET /analytics/dashboard?userId=` →
  ```json
  {
    "weeklyVolume": [{ "weekStart": "...", "volumeKg": 0, "sessions": 0 }],
    "recentRecords": [],
    "bodyWeightTrend": [{ "date": "...", "weightKg": 0 }],
    "recoveryTrend": [{ "date": "...", "sleepHours": 0, "soreness": 0, "fatigue": 0 }],
    "lastSession": null
  }
  ```
- `GET /analytics/strength?userId=&exerciseId=` → `{ points: [{ date, bestSetKg, e1rmKg, volumeKg }] }` (una entrada por sesión)

## Exportación de datos (CSV crudo para Excel)
- `GET /export.csv?userId=&dataset=sets|sessions|metrics|recovery|records|all`
  - `text/csv; charset=utf-8` con BOM UTF-8 (compatibilidad Excel), separador coma, header en la primera fila.
  - `dataset=sets` (default): una fila por serie con columnas planas:
    `date,session_name,gym,exercise,muscle_group,set_number,is_warmup,reps,weight_kg,weight_lb,rpe,rir,e1rm_kg,volume_kg`
  - `dataset=all`: concatena todas las tablas separadas por una línea con `# <dataset>`.

## Seed (datos globales)
`npm run seed` crea: catálogo de ~30 ejercicios con variantes (Bench Press → Incline/Close Grip; Squat → Front Squat; Deadlift → RDL; etc., con `isPowerlift` en SBD), y 4 plantillas MealPrep globales optimizadas para olla de presión digital: Pechuga de pollo (10 min alta presión + 5 NPR), Arroz blanco (4 min + 10 NPR), Lentejas (12 min + 10 NPR), Avena cortada (4 min + 10 NPR), con macros por porción.
