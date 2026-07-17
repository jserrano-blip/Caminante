// Seed de datos globales (userId = null): catálogo de ejercicios con variantes
// y plantillas MealPrep para olla de presión digital.
// Idempotente: borra los registros globales y los vuelve a crear.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ExerciseSeed = {
  name: string;
  muscleGroup: 'PECHO' | 'ESPALDA' | 'PIERNA' | 'HOMBRO' | 'BRAZO' | 'CORE' | 'OTRO';
  category: 'BARBELL' | 'DUMBBELL' | 'MACHINE' | 'CABLE' | 'BODYWEIGHT';
  isPowerlift?: boolean;
  notes?: string;
  variants?: ExerciseSeed[];
};

const EXERCISES: ExerciseSeed[] = [
  {
    name: 'Press de Banca',
    muscleGroup: 'PECHO',
    category: 'BARBELL',
    isPowerlift: true,
    notes: 'Levantamiento básico de powerlifting. Retrae escápulas y mantén los pies firmes.',
    variants: [
      {
        name: 'Press Inclinado',
        muscleGroup: 'PECHO',
        category: 'BARBELL',
        notes: 'Banco a 30-45°. Mayor énfasis en pectoral superior.',
      },
      {
        name: 'Press Agarre Cerrado',
        muscleGroup: 'PECHO',
        category: 'BARBELL',
        notes: 'Agarre al ancho de hombros. Mayor trabajo de tríceps.',
      },
      {
        name: 'Press de Banca con Mancuernas',
        muscleGroup: 'PECHO',
        category: 'DUMBBELL',
        notes: 'Mayor rango de movimiento y trabajo de estabilización.',
      },
    ],
  },
  {
    name: 'Sentadilla',
    muscleGroup: 'PIERNA',
    category: 'BARBELL',
    isPowerlift: true,
    notes: 'Back squat. Rompe la paralela manteniendo el torso firme.',
    variants: [
      {
        name: 'Sentadilla Frontal',
        muscleGroup: 'PIERNA',
        category: 'BARBELL',
        notes: 'Barra al frente sobre los deltoides. Torso más vertical, más cuádriceps.',
      },
    ],
  },
  {
    name: 'Peso Muerto',
    muscleGroup: 'ESPALDA',
    category: 'BARBELL',
    isPowerlift: true,
    notes: 'Convencional. Espalda neutra, empuja el piso con las piernas.',
    variants: [
      {
        name: 'Peso Muerto Rumano',
        muscleGroup: 'PIERNA',
        category: 'BARBELL',
        notes: 'Piernas semirrígidas, bisagra de cadera. Énfasis en femorales y glúteos.',
      },
      {
        name: 'Peso Muerto Sumo',
        muscleGroup: 'PIERNA',
        category: 'BARBELL',
        notes: 'Postura amplia, agarre por dentro de las rodillas. Menor recorrido.',
      },
    ],
  },
  { name: 'Press Militar', muscleGroup: 'HOMBRO', category: 'BARBELL', notes: 'De pie, sin impulso de piernas.' },
  { name: 'Dominadas', muscleGroup: 'ESPALDA', category: 'BODYWEIGHT', notes: 'Pull-up con agarre prono. Lastra peso cuando superes 10-12 reps.' },
  { name: 'Remo con Barra', muscleGroup: 'ESPALDA', category: 'BARBELL', notes: 'Torso a ~45°, lleva la barra al abdomen bajo.' },
  { name: 'Remo con Mancuerna', muscleGroup: 'ESPALDA', category: 'DUMBBELL', notes: 'Una mano apoyada en el banco. Codo pegado al cuerpo.' },
  { name: 'Remo en Máquina', muscleGroup: 'ESPALDA', category: 'MACHINE', notes: 'Pecho apoyado en el respaldo, controla la negativa.' },
  { name: 'Jalón al Pecho', muscleGroup: 'ESPALDA', category: 'CABLE', notes: 'Lat pulldown. Lleva la barra a la clavícula sin balanceo.' },
  { name: 'Pull-over en Polea', muscleGroup: 'ESPALDA', category: 'CABLE', notes: 'Brazos casi rectos, gran estiramiento del dorsal.' },
  { name: 'Encogimientos con Barra', muscleGroup: 'ESPALDA', category: 'BARBELL', notes: 'Shrugs para trapecios. Sube los hombros sin rotar.' },
  { name: 'Face Pull', muscleGroup: 'HOMBRO', category: 'CABLE', notes: 'Cuerda a la cara, codos altos. Salud de hombro y deltoide posterior.' },
  { name: 'Elevaciones Laterales', muscleGroup: 'HOMBRO', category: 'DUMBBELL', notes: 'Codos ligeramente flexionados, sube hasta la horizontal.' },
  { name: 'Press de Hombro con Mancuernas', muscleGroup: 'HOMBRO', category: 'DUMBBELL', notes: 'Sentado con respaldo. Baja hasta la altura de las orejas.' },
  { name: 'Curl con Barra', muscleGroup: 'BRAZO', category: 'BARBELL', notes: 'Codos fijos a los costados, sin balanceo de cadera.' },
  { name: 'Curl Martillo', muscleGroup: 'BRAZO', category: 'DUMBBELL', notes: 'Agarre neutro. Trabaja braquial y antebrazo.' },
  { name: 'Curl en Predicador', muscleGroup: 'BRAZO', category: 'MACHINE', notes: 'Banco Scott. Extiende casi por completo en cada repetición.' },
  { name: 'Extensión de Tríceps en Polea', muscleGroup: 'BRAZO', category: 'CABLE', notes: 'Pushdown con barra o cuerda. Codos pegados al torso.' },
  { name: 'Press Francés', muscleGroup: 'BRAZO', category: 'BARBELL', notes: 'Skull crusher con barra EZ. Baja a la frente con control.' },
  { name: 'Fondos en Paralelas', muscleGroup: 'PECHO', category: 'BODYWEIGHT', notes: 'Dips. Inclínate adelante para más pecho, vertical para más tríceps.' },
  { name: 'Aperturas con Mancuernas', muscleGroup: 'PECHO', category: 'DUMBBELL', notes: 'Arco amplio, codos semiflexionados. No bajes en exceso.' },
  { name: 'Prensa de Pierna', muscleGroup: 'PIERNA', category: 'MACHINE', notes: 'Leg press. Baja hasta ~90° sin despegar la cadera.' },
  { name: 'Hip Thrust', muscleGroup: 'PIERNA', category: 'BARBELL', notes: 'Espalda alta en el banco, extensión completa de cadera.' },
  { name: 'Zancadas', muscleGroup: 'PIERNA', category: 'DUMBBELL', notes: 'Lunges caminando o estáticas. Rodilla trasera casi al piso.' },
  { name: 'Buenos Días', muscleGroup: 'PIERNA', category: 'BARBELL', notes: 'Good morning. Bisagra de cadera con barra en la espalda, cargas moderadas.' },
  { name: 'Extensión de Cuádriceps', muscleGroup: 'PIERNA', category: 'MACHINE', notes: 'Leg extension. Pausa breve arriba.' },
  { name: 'Curl Femoral', muscleGroup: 'PIERNA', category: 'MACHINE', notes: 'Leg curl tumbado o sentado. Controla la fase excéntrica.' },
  { name: 'Pantorrillas de Pie', muscleGroup: 'PIERNA', category: 'MACHINE', notes: 'Standing calf raise. Estiramiento completo abajo, pausa arriba.' },
  { name: 'Plancha', muscleGroup: 'CORE', category: 'BODYWEIGHT', notes: 'Cadera alineada, abdomen y glúteo apretados. Registra segundos como reps.' },
  { name: 'Crunch en Polea', muscleGroup: 'CORE', category: 'CABLE', notes: 'De rodillas frente a la polea alta, flexiona el torso con la cuerda.' },
  { name: 'Elevaciones de Piernas Colgado', muscleGroup: 'CORE', category: 'BODYWEIGHT', notes: 'Colgado de la barra, sube las piernas sin balanceo.' },
];

const MEALS = [
  {
    name: 'Pechuga de pollo en olla de presión',
    servings: 6,
    proteinG: 38,
    carbsG: 0,
    fatG: 4.5,
    calories: 195,
    cookMinutes: 15,
    applianceNote: 'Olla de presión digital: 10 min alta presión + 5 min liberación natural',
    instructions:
      '1. Coloca 1.2 kg de pechuga de pollo sin piel en la olla con 1 taza de agua o caldo.\n' +
      '2. Sazona con sal, pimienta, ajo en polvo y paprika.\n' +
      '3. Cierra la tapa con la válvula en posición de sellado.\n' +
      '4. Cocina 10 minutos a alta presión.\n' +
      '5. Deja 5 minutos de liberación natural de presión y luego libera el resto manualmente.\n' +
      '6. Verifica 74 °C internos, desmenuza o rebana y guarda en 6 porciones (refrigerador 4 días, congelador 3 meses).',
  },
  {
    name: 'Arroz blanco en olla de presión',
    servings: 6,
    proteinG: 4,
    carbsG: 45,
    fatG: 0.4,
    calories: 205,
    cookMinutes: 14,
    applianceNote: 'Olla de presión digital: 4 min alta presión + 10 min liberación natural',
    instructions:
      '1. Enjuaga 2 tazas de arroz blanco hasta que el agua salga clara.\n' +
      '2. Agrega el arroz a la olla con 2 tazas de agua y una pizca de sal (proporción 1:1).\n' +
      '3. Cierra la tapa con la válvula en sellado.\n' +
      '4. Cocina 4 minutos a alta presión.\n' +
      '5. Deja 10 minutos de liberación natural antes de abrir.\n' +
      '6. Esponja con un tenedor y divide en 6 porciones de ~150 g.',
  },
  {
    name: 'Lentejas en olla de presión',
    servings: 6,
    proteinG: 13,
    carbsG: 28,
    fatG: 0.7,
    calories: 170,
    cookMinutes: 22,
    applianceNote: 'Olla de presión digital: 12 min alta presión + 10 min liberación natural',
    instructions:
      '1. Enjuaga 2 tazas de lentejas secas (no requieren remojo).\n' +
      '2. Agrégalas a la olla con 6 tazas de agua o caldo, media cebolla, 2 dientes de ajo, comino y sal.\n' +
      '3. Cierra la tapa con la válvula en sellado.\n' +
      '4. Cocina 12 minutos a alta presión.\n' +
      '5. Deja 10 minutos de liberación natural y libera el resto.\n' +
      '6. Ajusta sal, retira la cebolla y reparte en 6 porciones.',
  },
  {
    name: 'Avena cortada (steel cut) en olla de presión',
    servings: 4,
    proteinG: 7,
    carbsG: 29,
    fatG: 3,
    calories: 170,
    cookMinutes: 14,
    applianceNote: 'Olla de presión digital: 4 min alta presión + 10 min liberación natural',
    instructions:
      '1. Engrasa ligeramente el fondo de la olla para evitar que se pegue.\n' +
      '2. Agrega 1 taza de avena cortada (steel cut), 3 tazas de agua, canela y una pizca de sal.\n' +
      '3. Cierra la tapa con la válvula en sellado.\n' +
      '4. Cocina 4 minutos a alta presión.\n' +
      '5. Deja 10 minutos de liberación natural — no abras antes, salpica.\n' +
      '6. Revuelve, reparte en 4 porciones y completa con fruta o proteína en polvo al servir.',
  },
];

async function main() {
  // ── Ejercicios globales ────────────────────────────────────────────────────
  await prisma.exercise.deleteMany({ where: { userId: null } });

  let baseCount = 0;
  let variantCount = 0;
  for (const ex of EXERCISES) {
    const base = await prisma.exercise.create({
      data: {
        userId: null,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        category: ex.category,
        isPowerlift: ex.isPowerlift ?? false,
        notes: ex.notes ?? null,
      },
    });
    baseCount++;
    for (const v of ex.variants ?? []) {
      await prisma.exercise.create({
        data: {
          userId: null,
          name: v.name,
          muscleGroup: v.muscleGroup,
          category: v.category,
          isPowerlift: v.isPowerlift ?? false,
          notes: v.notes ?? null,
          variantOfId: base.id,
        },
      });
      variantCount++;
    }
  }

  // ── Plantillas MealPrep globales ───────────────────────────────────────────
  await prisma.mealPrep.deleteMany({ where: { userId: null } });
  for (const meal of MEALS) {
    await prisma.mealPrep.create({ data: { userId: null, ...meal } });
  }

  console.log(
    `Seed completado: ${baseCount} ejercicios base + ${variantCount} variantes, ${MEALS.length} plantillas MealPrep.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
