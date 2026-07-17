# 📱 Guía de uso — Amplify Gym

Tu app es **privada**: no está en la App Store. Corre dentro de **Expo Go** (app gratuita)
y el código se ejecuta desde tu computadora (o desde Render, cuando la despliegues).

---

## PARTE 1 — Instalación (solo la primera vez, ~15 min)

### En tu iPhone
1. Abre la **App Store**, busca **"Expo Go"** e instálala. No la abras todavía.

### En tu computadora
2. Instala **Node.js**: entra a https://nodejs.org, descarga el botón **LTS** e instala
   con "Siguiente" a todo.
   - *Windows*: instala también **Git** desde https://git-scm.com si no lo tienes.
3. Abre la Terminal (**Mac**: Cmd+Espacio → "Terminal" · **Windows**: Inicio → "PowerShell").
4. Copia y pega estas líneas **una por una** (Enter después de cada una, espera a que termine):

```bash
git clone https://github.com/jserrano-blip/Caminante.git
cd Caminante
git checkout claude/relaxed-rubin-7kdsqa
cd amplify-gym/server
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

✅ Debe terminar diciendo: `Amplify Gym API escuchando en http://localhost:4000/api`.
**Deja esta ventana abierta** (es tu base de datos).

> Si ya mergeaste el PR a `main`, usa `git checkout main` en su lugar.

5. Abre una **SEGUNDA** ventana de Terminal (sin cerrar la primera):

```bash
cd Caminante/amplify-gym/mobile
npm install
npx expo start
```

✅ Aparece un **código QR** grande.

### Conectar el iPhone
6. iPhone y computadora en el **mismo WiFi**.
7. Abre la **cámara** del iPhone, apunta al QR y toca la notificación → se abre Amplify Gym.
8. En la terminal del QR verás algo como `exp://192.168.1.50:8081`. Esos números son la
   IP de tu computadora. En la app: **Más → Ajustes → URL del servidor** escribe:
   `http://TU-IP:4000/api` (ej. `http://192.168.1.50:4000/api`) y toca
   **Guardar y probar conexión**. Debe conectar. ✅

---

## PARTE 2 — Las siguientes veces (2 minutos)

- Terminal 1: `cd Caminante/amplify-gym/server` → `npm run dev`
- Terminal 2: `cd Caminante/amplify-gym/mobile` → `npx expo start`
- Escanea el QR. Ya no se instala nada.

> ¿Cansado de depender de la computadora? Sigue `docs/DEPLOY_RENDER.md` (30 min) y la app
> funcionará desde cualquier lugar con la URL de Render en Ajustes.

---

## PARTE 3 — Primer uso dentro de la app

1. **Perfil** — crea tu perfil (nombre, sexo para Wilks/DOTS, unidad KG/LB). Cada persona
   de tu casa puede crear el suyo.
2. **Gimnasio** — Más → Gimnasios → crea tu gym y captura su equipo: peso de la barra,
   discos disponibles (peso y pares), mancuernas y máquinas. *Esto alimenta la calculadora
   de discos y el generador de calentamiento.*
3. **Rutina** — pestaña Rutinas: usa una plantilla de un toque (**Push/Pull/Legs**,
   **Full Body 3x** o **Torso/Pierna**) o crea la tuya.
4. **Cuerpo** — registra tu peso/altura/% grasa (necesario para fuerza relativa y macros).
5. **¡A entrenar!** — pestaña Entrenar → elige rutina → en cada ejercicio verás la
   **sugerencia de sobrecarga** ("sube 2.5 kg…"); usa **Calentamiento** para generar
   aproximaciones y **Discos** para ver qué ponerle a la barra; registra reps, peso y
   RPE; al completar una serie arranca el **timer** (te avisa con notificación aunque
   bloquees el teléfono). Al terminar: **Finalizar** → verás tus **PRs** 🏆.
6. **Diario** — en Inicio haz tu check-in de sueño/dolor/fatiga; si acumulas fatiga,
   el dashboard te sugerirá **descargar** (banner de Readiness).
7. **Extras** — Cuerpo → Fotos de progreso (comparador) · Más → Meal Prep (recetas de
   olla de presión + calculadora de macros) · Herramientas (RM, discos, Wilks/DOTS) ·
   Ajustes → **Exportar CSV** para tus macros de Excel · Ajustes → Apariencia
   (**modo oscuro**).

---

## Errores comunes

| Problema | Solución |
|---|---|
| "git no se reconoce" (Windows) | Instala Git desde https://git-scm.com |
| La app dice "Sin conexión con el servidor" | ¿Terminal 1 sigue abierta? ¿La URL en Ajustes tiene TU IP y termina en `:4000/api`? |
| El QR no conecta | iPhone y computadora deben estar en el **mismo WiFi** (no datos celulares) |
| Serie con nube ☁️ en vez de ✓ | Se guardó offline; se sincroniza sola al volver la señal |
| Cambió tu IP (otro WiFi) | Actualiza la URL en Ajustes con la IP nueva |
