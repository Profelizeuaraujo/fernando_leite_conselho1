import { db } from './index';
import { users, students } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding data...');

  const passwordHash = await bcrypt.hash('FLC2026@', 10);
  await db.insert(users).values({
    username: 'GestaoFLC',
    passwordHash,
    name: 'Gestor(a)'
  }).onConflictDoNothing();

  const count = await db.select().from(students);
  if (count.length === 0) {
    const data = [
      {cod: '2525712', nome: 'ADRIAN KAUE SILVA DOS SANTOS', paed: false, turma: '6° ANO A', turno: 'Matutino', serie: '6° ANO', curso: 'Fundamental', modalidade: 'Regular'},
      {cod: '2837372', nome: 'ADRYAN YAN DE CASTILHO GAMA', paed: false, turma: '6° ANO A', turno: 'Matutino', serie: '6° ANO', curso: 'Fundamental', modalidade: 'Regular'},
      {cod: '2704533', nome: 'VITOR HUGO SOARES PACHECO', paed: false, turma: '9° ANO D', turno: 'Vespertino', serie: '9° ANO', curso: 'Fundamental', modalidade: 'Regular'},
    ];
    await db.insert(students).values(data);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
