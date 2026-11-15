// Grafos e vizinhancas fechadas. Nada de busca aqui.
//
// Um CODIGO PERFEITO de um grafo e um conjunto S de vertices tal que as
// vizinhancas fechadas dos vertices de S PARTICIONAM o grafo: todo
// vertice e coberto, e coberto uma vez so. Quem esta em S nao tem vizinho
// em S, e quem nao esta tem exatamente um.
//
// Um grafo e guardado como lista de vizinhancas fechadas em mascara de
// bits, uma por vertice — que e exatamente o que a busca precisa, e evita
// recalcular N(v) ∪ {v} milhares de vezes la dentro.

export function grafo(n, arestas) {
  const fechada = new Array(n).fill(0n);
  for (let v = 0; v < n; v++) fechada[v] = 1n << BigInt(v);
  for (const [a, b] of arestas) {
    if (a === b) continue;
    fechada[a] |= 1n << BigInt(b);
    fechada[b] |= 1n << BigInt(a);
  }
  // A lista de arestas sai sem repeticao e sem laco. Nao e preciosismo:
  // a notacao LCF escreve cada corda duas vezes, uma de cada ponta, e o
  // grafo de Heawood apareceu com 28 arestas em vez de 21 — a adjacencia
  // estava certa, a CONTAGEM e que mentia.
  const vistas = new Set();
  const limpas = [];
  for (const [a, b] of arestas) {
    if (a === b) continue;
    const ch = Math.min(a, b) + ':' + Math.max(a, b);
    if (vistas.has(ch)) continue;
    vistas.add(ch);
    limpas.push([Math.min(a, b), Math.max(a, b)]);
  }
  return { n, fechada, arestas: limpas };
}

export function graus(g) {
  return g.fechada.map((f) => contaBits(f) - 1);
}

export function regular(g) {
  const d = graus(g);
  return d.every((x) => x === d[0]) ? d[0] : null;
}

export function contaBits(x) {
  let c = 0;
  let v = x;
  while (v > 0n) { v &= v - 1n; c++; }
  return c;
}

export function bits(x, n) {
  const fora = [];
  for (let i = 0; i < n; i++) if ((x >> BigInt(i)) & 1n) fora.push(i);
  return fora;
}

export const TODOS = (n) => (1n << BigInt(n)) - 1n;

/* --------------------------------------------------------- as familias */

export function ciclo(n) {
  const arestas = [];
  for (let i = 0; i < n; i++) arestas.push([i, (i + 1) % n]);
  return grafo(n, n === 2 ? [[0, 1]] : arestas);
}

export function caminho(n) {
  const arestas = [];
  for (let i = 0; i + 1 < n; i++) arestas.push([i, i + 1]);
  return grafo(n, arestas);
}

export function grade(m, n) {
  const arestas = [];
  const id = (i, j) => i * n + j;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (j + 1 < n) arestas.push([id(i, j), id(i, j + 1)]);
      if (i + 1 < m) arestas.push([id(i, j), id(i + 1, j)]);
    }
  }
  return grafo(m * n, arestas);
}

/**
 * O toro m x n: a grade com as bordas coladas, que e 4-regular. So de 3
 * para cima: com m ou n igual a 2 a colagem duplicaria aresta e o grafo
 * deixaria de ser 4-regular sem avisar.
 */
export function toro(m, n) {
  if (m < 3 || n < 3) throw new RangeError('o toro pede lados de 3 para cima');
  const arestas = [];
  const id = (i, j) => i * n + j;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      arestas.push([id(i, j), id(i, (j + 1) % n)]);
      arestas.push([id(i, j), id((i + 1) % m, j)]);
    }
  }
  return grafo(m * n, arestas);
}

/** O cubo de dimensao d: 2^d vertices, vizinhos quando diferem num bit. */
export function cubo(d) {
  const n = 1 << d;
  const arestas = [];
  for (let v = 0; v < n; v++) {
    for (let b = 0; b < d; b++) {
      const u = v ^ (1 << b);
      if (u > v) arestas.push([v, u]);
    }
  }
  return grafo(n, arestas);
}

export function completo(n) {
  const arestas = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) arestas.push([a, b]);
  return grafo(n, arestas);
}

export function petersen() {
  const arestas = [];
  for (let i = 0; i < 5; i++) {
    arestas.push([i, (i + 1) % 5]);          // o pentagono de fora
    arestas.push([i, i + 5]);                // os raios
    arestas.push([5 + i, 5 + ((i + 2) % 5)]); // a estrela de dentro
  }
  return grafo(10, arestas);
}

/**
 * Grafo pela notacao LCF: um ciclo hamiltoniano de n vertices mais uma
 * corda por vertice, do vertice i para i + saltos[i]. E assim que os
 * cubicos de nome proprio sao escritos, e assim eles entram aqui — em vez
 * de eu desenhar de cabeca, que ja deu errado no acervo.
 */
export function porLCF(n, saltos) {
  const arestas = [];
  for (let i = 0; i < n; i++) arestas.push([i, (i + 1) % n]);
  for (let i = 0; i < n; i++) {
    arestas.push([i, ((i + saltos[i % saltos.length]) % n + n) % n]);
  }
  return grafo(n, arestas);
}

/** O grafo de Heawood: 14 vertices, cubico, cintura 6. LCF [5,-5]^7. */
export function heawood() {
  return porLCF(14, [5, -5]);
}

/** O grafo de Mobius-Kantor: 16 vertices, cubico. LCF [5,-5]^8. */
export function mobiusKantor() {
  return porLCF(16, [5, -5]);
}

/** O grafo de Pappus: 18 vertices, cubico. LCF [5,7,-7,7,-7,-5]^3. */
export function pappus() {
  return porLCF(18, [5, 7, -7, 7, -7, -5]);
}

/** O grafo de Desargues: 20 vertices, cubico. LCF [5,-5,9,-9]^5. */
export function desargues() {
  return porLCF(20, [5, -5, 9, -9]);
}

/** Confere se S e mesmo um codigo perfeito, contando cobertura por vertice. */
export function ehCodigoPerfeito(g, s) {
  const cobertura = new Array(g.n).fill(0);
  for (const v of bits(s, g.n)) {
    for (const u of bits(g.fechada[v], g.n)) cobertura[u]++;
  }
  return cobertura.every((c) => c === 1);
}

/** Quantas vezes cada vertice e coberto por S. */
export function cobertura(g, s) {
  const fora = new Array(g.n).fill(0);
  for (const v of bits(s, g.n)) {
    for (const u of bits(g.fechada[v], g.n)) fora[u]++;
  }
  return fora;
}
