// Calcula a proteína estimada (campo "p", em gramas) de cada refeição de uma semana.
//
// Uso:  node .github/scripts/add-protein.mjs data/next-week.json
//
// Lê o campo "g" de cada refeição (ex.: "150g sobrecoxa · 100g arroz · 80g feijão"),
// procura cada ingrediente em data/proteina-referencia.json e grava "p" (inteiro) na refeição.
// Vale para qualquer lista de dias do arquivo (adults, kids, ...).
// Se algum ingrediente não for reconhecido, mostra qual e sai com erro SEM gravar nada —
// aí é só acrescentar a linha em data/proteina-referencia.json.

import fs from "fs";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node .github/scripts/add-protein.mjs <arquivo.json>");
  process.exit(2);
}

const ref = JSON.parse(fs.readFileSync("data/proteina-referencia.json", "utf8"));
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

// índice: palavra-chave normalizada -> proteína por 100 g (a chave mais longa que aparecer no texto vence)
const keys = [];
for (const item of ref.itens) {
  for (const nome of item.nomes) keys.push({ k: norm(nome), p100: item.p100 });
}
keys.sort((a, b) => b.k.length - a.k.length);

function findItem(text) {
  // palavra inteira (aceita plural com "s"): evita que "sal" case com "salmão", por exemplo
  return keys.find(({ k }) => new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?(?![a-z])`).test(text));
}

function segmentProtein(seg) {
  const t = norm(seg);
  const hit = findItem(t);
  if (!hit) return { error: `ingrediente não reconhecido: "${seg.trim()}"` };
  if (hit.p100 === 0) return { p: 0 }; // temperos, água, azeite…

  let grams = null;
  const g = t.match(/(\d+(?:[.,]\d+)?)\s*(?:g|ml)\b/);
  if (g) {
    grams = parseFloat(g[1].replace(",", "."));
  } else {
    const q = t.match(/(\d+(?:[.,]\d+)?)\s*(scoops?|ovos?|fatias?)/);
    if (q) {
      const unit = q[2].startsWith("scoop") ? "scoop" : q[2].startsWith("ovo") ? "ovo" : "fatia";
      grams = parseFloat(q[1].replace(",", ".")) * ref.unidades[unit];
    } else {
      const bare = t.match(/(\d+)\s*(?:x\s*)?(?:ovos?|scoop)/);
      if (bare) grams = parseFloat(bare[1]) * (t.includes("scoop") ? ref.unidades.scoop : ref.unidades.ovo);
    }
  }
  if (grams === null) return { error: `sem quantidade em gramas: "${seg.trim()}"` };
  return { p: (grams * hit.p100) / 100 };
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
let count = 0;

for (const [grupo, lista] of Object.entries(data)) {
  if (!Array.isArray(lista) || !lista.every((d) => d && typeof d === "object" && d.meals)) continue;
  for (const dia of lista) {
    for (const [refeicao, m] of Object.entries(dia.meals)) {
      let total = 0;
      for (const seg of String(m.g || "").split("·")) {
        if (!seg.trim()) continue;
        const r = segmentProtein(seg);
        if (r.error) errors.push(`${grupo} · ${dia.day} · ${refeicao}: ${r.error}`);
        else total += r.p;
      }
      m.p = Math.round(total);
      count++;
    }
  }
}

if (errors.length) {
  console.error("Não gravei nada. Corrija:\n - " + errors.join("\n - "));
  process.exit(1);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`Proteína calculada para ${count} refeições em ${file}.`);
