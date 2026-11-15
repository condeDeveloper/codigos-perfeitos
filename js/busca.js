// A varredura: todos os codigos perfeitos de um grafo, por cobertura exata.
//
// A ideia que faz a busca caber: um codigo perfeito e uma PARTICAO do
// grafo em vizinhancas fechadas. Entao, pegando o vertice de menor indice
// que ainda nao foi coberto, ele tem que ser coberto por alguem da
// vizinhanca fechada DELE, e por mais ninguem. Isso da um galho por
// candidato, e nenhum ramo se repete — cada codigo sai uma vez so, sem
// precisar de conjunto de vistos.
//
// O corte que paga: se escolher `v` cobre alguma casa duas vezes, aquele
// galho morre na hora, antes de descer.

import { contaBits, bits, TODOS, ehCodigoPerfeito } from './nucleo.js';

/**
 * Todos os codigos perfeitos de g. `limite` corta a lista (mas nao a
 * contagem de nos), para quem so quer saber se existe algum.
 */
export function codigos(g, { limite = Infinity } = {}) {
  const todos = TODOS(g.n);
  const fora = [];
  let nos = 0;
  let podas = 0;

  function passo(cobertos, escolhidos) {
    if (cobertos === todos) {
      fora.push(escolhidos);
      return fora.length >= limite;
    }
    // O menor vertice ainda descoberto. Ele TEM que ser coberto por
    // alguem da vizinhanca fechada dele.
    let v = 0;
    while ((cobertos >> BigInt(v)) & 1n) v++;
    for (const c of bits(g.fechada[v], g.n)) {
      nos++;
      const nova = g.fechada[c];
      if ((nova & cobertos) !== 0n) { podas++; continue; } // cobriria duas vezes
      if (passo(cobertos | nova, escolhidos | (1n << BigInt(c)))) return true;
    }
    return false;
  }

  passo(0n, 0n);
  return { codigos: fora, quantos: fora.length, nos, podas };
}

export function existe(g) {
  return codigos(g, { limite: 1 }).quantos > 0;
}

export function quantos(g) {
  return codigos(g).quantos;
}

/** Os tamanhos dos codigos encontrados, sem repeticao. */
export function tamanhos(g) {
  const r = codigos(g);
  return [...new Set(r.codigos.map((c) => contaBits(c)))].sort((a, b) => a - b);
}

/** O resumo de um grafo: existe, quantos, de que tamanho, e a que preco. */
export function resumo(g, nome) {
  const r = codigos(g);
  const tam = [...new Set(r.codigos.map((c) => contaBits(c)))].sort((a, b) => a - b);
  return {
    nome,
    n: g.n,
    arestas: g.arestas.length,
    existe: r.quantos > 0,
    quantos: r.quantos,
    tamanhos: tam,
    nos: r.nos,
    podas: r.podas,
  };
}

/**
 * A mesma pergunta pela forca bruta: varre os 2^n subconjuntos e confere
 * cada um. So ate 22 vertices — e e esse o ponto da comparacao.
 */
export function porForcaBruta(g) {
  if (g.n > 22) throw new RangeError('a forca bruta vai ate 22 vertices; este tem ' + g.n);
  const fora = [];
  let testados = 0;
  const limite = 1 << g.n;
  for (let s = 0; s < limite; s++) {
    testados++;
    if (ehCodigoPerfeito(g, BigInt(s))) fora.push(BigInt(s));
  }
  return { codigos: fora, quantos: fora.length, testados };
}
