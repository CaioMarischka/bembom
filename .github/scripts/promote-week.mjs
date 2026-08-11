import fs from "fs";

const todayISO = new Date().toISOString().slice(0, 10);

if (!fs.existsSync("data/next-week.json")) {
  console.error(
    "Não existe data/next-week.json — a geração de quinta-feira não rodou " +
    "(ou falhou). Nada foi promovido; o cardápio atual continua o mesmo."
  );
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync("data/current-week.json", "utf8"));
const next = JSON.parse(fs.readFileSync("data/next-week.json", "utf8"));

// 1) arquivar a semana que está terminando
fs.writeFileSync(
  `historico/${todayISO}.json`,
  JSON.stringify(current, null, 2) + "\n"
);

const manifestPath = "historico/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.unshift({
  label: current.weekLabel,
  date: todayISO,
  file: `historico/${todayISO}.json`,
});
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

// 2) promover a prévia para ser o cardápio oficial
fs.writeFileSync("data/current-week.json", JSON.stringify(next, null, 2) + "\n");

// 3) limpar a prévia — quinta-feira que vem ela é gerada de novo
fs.unlinkSync("data/next-week.json");

console.log(`Promovido: semana "${next.weekLabel}" agora é a atual.`);
console.log(`Arquivado: semana "${current.weekLabel}" foi para historico/${todayISO}.json.`);
