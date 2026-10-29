// Ayudas de la entrada del contenedor (sin necesitar el programa psql):
//   node scripts/base.mjs esperar   espera hasta 2 minutos a que la base acepte conexiones (MIGRATION_DATABASE_URL)
//   node scripts/base.mjs vacia     termina con 0 si la base no tiene ninguna empresa, con 10 si ya tiene datos
import pg from 'pg';

const url = process.env.MIGRATION_DATABASE_URL;
if (!url) {
  console.error('Falta MIGRATION_DATABASE_URL');
  process.exit(2);
}

async function consultar(sql) {
  const c = new pg.Client({ connectionString: url, connectionTimeoutMillis: 3000 });
  await c.connect();
  try {
    return (await c.query(sql)).rows;
  } finally {
    await c.end();
  }
}

const orden = process.argv[2];
if (orden === 'esperar') {
  for (let i = 0; i < 60; i++) {
    try {
      await consultar('select 1');
      process.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('La base de datos no respondió en 2 minutos.');
  process.exit(1);
} else if (orden === 'vacia') {
  const filas = await consultar(
    "select case when to_regclass('public.empresa') is null then 0 else (select count(*) from public.empresa) end as n",
  );
  process.exit(Number(filas[0].n) === 0 ? 0 : 10);
} else {
  console.error('Uso: node scripts/base.mjs esperar | vacia');
  process.exit(2);
}
