# Desplegar Amplify Gym en Render (paso a paso)

Con esto tu app funcionará **desde cualquier lugar** (datos celulares incluidos), sin
depender de tu computadora. Costo: gratis el primer mes de PostgreSQL; después ~$7 USD/mes
(o gratis con limitaciones usando el plan free del web service, que se "duerme" tras
15 min sin uso y tarda ~1 min en despertar).

## Antes de empezar

1. Crea una cuenta en https://render.com (puedes entrar con tu cuenta de GitHub).
2. Ten a la mano una **clave de API** inventada por ti: una frase larga y aleatoria,
   por ejemplo `gym-perro-azul-2026-X9k4mQ`. La usarás en los pasos 2 y 3.

## Paso 1 — Crear la base de datos PostgreSQL

1. En el dashboard de Render: **New → PostgreSQL**.
2. Name: `amplify-gym-db`. Region: la más cercana (Ohio/Oregon para México).
3. Plan: **Free** para probar (expira en 30 días) o **Basic** para permanente.
4. Click **Create Database** y espera a que diga "Available".
5. Copia el campo **Internal Database URL** (empieza con `postgresql://...`).

## Paso 2 — Crear el Web Service (la API)

1. **New → Web Service** → conecta tu repositorio `Caminante` de GitHub.
2. Configura:
   - **Branch**: `main` (después de mergear el PR) o `claude/relaxed-rubin-7kdsqa`.
   - **Root Directory**: `amplify-gym/server`
   - **Runtime**: Node
   - **Build Command** (cópialo completo, es una sola línea):
     ```
     sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma && npm install --include=dev && npx prisma db push --accept-data-loss && npm run seed && npm run build
     ```
   - **Start Command**: `npm start`
   - **Plan**: Free (se duerme) o Starter (~$7/mes, siempre despierto).
3. En **Environment Variables** agrega:
   | Clave | Valor |
   |---|---|
   | `DATABASE_URL` | la Internal Database URL del Paso 1 |
   | `API_KEY` | tu clave inventada |
4. Click **Create Web Service**. El primer deploy tarda 3-5 minutos.
5. Cuando diga "Live", copia la URL pública (ej. `https://amplify-gym.onrender.com`).
6. Prueba en el navegador: `https://TU-URL.onrender.com/api/health` debe responder
   `{"ok":true}`.

## Paso 3 — Conectar tu iPhone

En la app: **Más → Ajustes**:
1. **URL del servidor**: `https://TU-URL.onrender.com/api`
2. **Clave de API**: tu clave inventada
3. Toca **Probar conexión** → debe conectar. Listo: ya no necesitas la computadora.

## Notas

- `sed` en el build cambia el provider de Prisma a PostgreSQL solo en Render;
  tu copia local sigue usando SQLite para desarrollo.
- `prisma db push` crea/actualiza las tablas directamente desde el esquema
  (más simple que migraciones para uso personal). El seed es idempotente: no
  duplica el catálogo.
- Tus datos locales (SQLite) NO se migran solos. Si ya registraste entrenamientos
  en casa y quieres conservarlos, exporta el CSV antes y vuelve a capturar lo
  esencial, o pídele a tu asistente que haga un script de migración.
- En el plan Free, la primera petición tras 15 min de inactividad tarda ~1 min
  (el servidor despierta). Abre la app un minuto antes de entrenar y listo.
