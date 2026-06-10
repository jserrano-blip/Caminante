# 💪 Amplify Gym

App privada de seguimiento de entrenamiento y rendimiento. Monorepo con dos paquetes:

```
amplify-gym/
├── server/   # API REST — Node.js + Express + Prisma (SQLite dev / PostgreSQL prod)
├── mobile/   # App iPhone — React Native + Expo (Expo Go), TypeScript
└── docs/     # Contrato de API y documentación
```

- **Paleta**: estrictamente azul y blanco (`#1D4ED8` primario, `#2563EB` acento, `#EFF6FF` superficies, blanco fondo).
- **Datos**: el peso se guarda **siempre en kg**; el toggle KG/LB es solo de presentación.
- **Fuente de verdad**: `server/prisma/schema.prisma` (base de datos) y `docs/API.md` (contrato REST).

## Funcionalidades

| Módulo | Detalle |
|---|---|
| Multiusuario privado | Perfiles independientes en el mismo dispositivo |
| Multigimnasio | Inventario por gimnasio: barras, discos, mancuernas, máquinas |
| Ejercicios y rutinas | Catálogo con variantes, plantillas de rutina |
| Ejecución avanzada | Reps/peso con toggle KG-LB, RPE y RIR, generador de calentamiento |
| Herramientas en vivo | Calculadora de discos según equipo del gym, timer de descanso, calculadora 1/3/5RM |
| Automatización | Sugerencia de sobrecarga progresiva leyendo la sesión anterior; detección automática de PRs al finalizar |
| Cuerpo | Peso, altura, % grasa; fuerza relativa con Wilks y DOTS |
| Nutrición y recuperación | Meal Prep con macros y tiempos de olla de presión digital; slider diario de sueño/dolor/fatiga |
| Exportación | CSV crudo (compatible Excel, BOM UTF-8) de todo el histórico |
| Dashboard | Gráficas de volumen semanal, progresión de fuerza (e1RM) y evolución corporal |

## Flujo de pantallas (mobile)

```
Selector de Perfil (multiusuario)
└── Tabs
    ├── Inicio      → Dashboard: volumen semanal, PRs recientes, tendencia corporal,
    │                 check-in rápido de recuperación
    ├── Entrenar    → Iniciar desde rutina o vacío
    │   └── Entrenamiento en vivo: series (reps/peso/RPE/RIR), sugerencia de
    │       sobrecarga, generador de calentamiento, calculadora de discos,
    │       timer de descanso → Resumen final con PRs detectados
    ├── Rutinas     → Plantillas (crear/editar) · Catálogo de ejercicios y variantes
    ├── Cuerpo      → Métricas corporales + gráficas · Fuerza relativa (Wilks/DOTS)
    │                 · Registro de recuperación
    └── Más         → Gimnasios y equipo · Meal Prep · Herramientas (RM, discos)
                      · Exportar CSV · Ajustes (perfil, unidad, URL del servidor)
```

## Cómo correrla

### Backend (local)
```bash
cd server
npm install
npx prisma migrate dev   # crea la BD SQLite
npm run seed             # catálogo de ejercicios + meal preps
npm run dev              # http://localhost:4000
```

### Backend (Render)
1. Crea un PostgreSQL en Render y un Web Service apuntando a `amplify-gym/server`.
2. En `prisma/schema.prisma` cambia `provider = "sqlite"` → `"postgresql"`.
3. Variables: `DATABASE_URL` (la de Render), `PORT` (Render la inyecta).
4. Build: `npm install && npx prisma migrate deploy && npm run build` · Start: `npm start`.

### App móvil (iPhone con Expo Go)
```bash
cd mobile
npm install
npx expo start
```
Escanea el QR con la cámara del iPhone (requiere la app Expo Go). En **Más → Ajustes** configura la URL del servidor (tu IP local `http://192.168.x.x:4000` o la URL de Render).
