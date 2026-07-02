import { PrismaClient, MatchPhase, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeder...');

  // Crear Partidos del Mundial 2026 (Mock)
  const matches = [
    {
      homeTeam: 'México',
      awayTeam: 'Polonia',
      stadiumCity: 'Ciudad de México',
      stadiumName: 'Estadio Azteca',
      phase: MatchPhase.GROUP_STAGE,
      status: MatchStatus.SCHEDULED,
      matchDate: new Date('2026-06-11T12:00:00Z'),
    },
    {
      homeTeam: 'Estados Unidos',
      awayTeam: 'Inglaterra',
      stadiumCity: 'Nueva York',
      stadiumName: 'MetLife Stadium',
      phase: MatchPhase.GROUP_STAGE,
      status: MatchStatus.SCHEDULED,
      matchDate: new Date('2026-06-12T15:00:00Z'),
    },
    {
      homeTeam: 'Argentina',
      awayTeam: 'Arabia Saudita',
      stadiumCity: 'Miami',
      stadiumName: 'Hard Rock Stadium',
      phase: MatchPhase.GROUP_STAGE,
      status: MatchStatus.SCHEDULED,
      matchDate: new Date('2026-06-13T16:00:00Z'),
    },
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: m,
    });
  }

  console.log('Seeder completado. Datos insertados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
