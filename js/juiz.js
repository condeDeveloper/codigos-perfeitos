// Os juizes. Tres, e nenhum deles usa a cobertura exata da busca.
//
// 1. A FORCA BRUTA (em busca.js, porque e a mesma pergunta pelo caminho
//    caro) confere subconjunto por subconjunto.
//
// 2. A PENEIRA DA CONTAGEM. Num grafo k-regular com n vertices, cada
//    vertice do codigo cobre exatamente k+1 vertices, e as coberturas nao
//    se tocam. Logo (k+1) tem que dividir n. E uma condicao NECESSARIA, e
//    o interessante dela e justamente o tanto que ela NAO basta.
//
// 3. O CODIGO DE HAMMING. Para o cubo de dimensao d = 2^r - 1 existe um
//    codigo perfeito construido, nao procurado: as palavras cujo sindrome
//    pela matriz de paridade e zero. A construcao nao procura nada, e
//    mesmo assim tem que cair exatamente num dos codigos que a busca
//    achou.

import { regular, contaBits, bits, cubo } from './nucleo.js';

/* --------------------------------------------------- 2. peneira da contagem */

/**
 * A condicao necessaria do grafo regular. Devolve `null` quando o grafo
 * nao e regular (ai ela nao se aplica), e true/false quando se aplica.
 */
export function peneiraDaContagem(g) {
  const k = regular(g);
  if (k === null) return null;
  return g.n % (k + 1) === 0;
}

/** O tamanho que o codigo teria, se existisse, num grafo regular. */
export function tamanhoForcado(g) {
  const k = regular(g);
  if (k === null) return null;
  return g.n % (k + 1) === 0 ? g.n / (k + 1) : null;
}

/* ------------------------------------------------------- 3. Hamming */

/**
 * O codigo de Hamming de comprimento d = 2^r - 1, como conjunto de
 * palavras de d bits. A matriz de paridade tem por colunas todos os
 * numeros de 1 a d; a palavra entra no codigo quando o XOR das posicoes
 * acesas da zero.
 *
 * Isto NAO procura: ele constroi. E a diferenca entre os dois que torna a
 * concordancia uma informacao.
 */
export function hamming(r) {
  const d = (1 << r) - 1;
  const fora = [];
  for (let p = 0; p < (1 << d); p++) {
    let sindrome = 0;
    for (let i = 0; i < d; i++) if ((p >> i) & 1) sindrome ^= i + 1;
    if (sindrome === 0) fora.push(p);
  }
  return { d, palavras: fora, tamanho: fora.length };
}

/**
 * O codigo de Hamming como conjunto de VERTICES do cubo de dimensao d.
 * Como os vertices do cubo sao os numeros de 0 a 2^d - 1, e a mesma coisa
 * com outro nome.
 */
export function hammingComoCodigo(r) {
  const h = hamming(r);
  let s = 0n;
  for (const p of h.palavras) s |= 1n << BigInt(p);
  return { d: h.d, conjunto: s, tamanho: h.tamanho };
}

/** As dimensoes de cubo em que a peneira da contagem deixa passar. */
export function cubosQuePassamNaPeneira(ate) {
  const fora = [];
  for (let d = 1; d <= ate; d++) {
    const g = { n: 1 << d };
    // No cubo de dimensao d o grau e d, entao a peneira pede (d+1) | 2^d,
    // ou seja, d+1 potencia de 2, ou seja, d = 2^r - 1.
    if ((1 << d) % (d + 1) === 0) fora.push(d);
  }
  return fora;
}

/* ------------------------------------------- a formula conhecida dos ciclos */

/**
 * No ciclo C_n, as vizinhancas fechadas tem 3 vertices e nao se tocam,
 * entao um codigo perfeito e uma maneira de ladrilhar o circulo com
 * pedacos de 3: existe exatamente quando 3 divide n, e as solucoes sao as
 * 3 rotacoes. Isto e uma conta, nao uma busca.
 */
export function previsaoDoCiclo(n) {
  if (n < 3) return { existe: null, quantos: null, motivo: 'C_n so a partir de 3' };
  return n % 3 === 0
    ? { existe: true, quantos: 3, tamanho: n / 3 }
    : { existe: false, quantos: 0, tamanho: null };
}

/**
 * No caminho P_n nao ha rotacao: o ladrilhamento tem que comecar no
 * primeiro ou no segundo vertice, e dai em diante fica forcado. A previsao
 * sai de contar quantos inicios fecham a conta.
 */
export function previsaoDoCaminho(n) {
  let quantos = 0;
  // o primeiro escolhido e 0 ou 1; depois disso, de 3 em 3
  for (const inicio of [0, 1]) {
    if (inicio >= n) continue;
    let v = inicio;
    while (v + 3 < n) v += 3;
    // depois do ultimo escolhido sobram n - 1 - v vertices; precisa ser <= 1
    if (n - 1 - v <= 1) quantos++;
  }
  return { existe: quantos > 0, quantos };
}

export { cubo, contaBits, bits };
