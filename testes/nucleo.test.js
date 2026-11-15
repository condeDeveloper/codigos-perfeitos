import test from 'node:test';
import assert from 'node:assert/strict';

import {
  grafo, graus, regular, contaBits, bits, TODOS, ciclo, caminho, grade,
  toro, cubo, completo, petersen, heawood, porLCF, ehCodigoPerfeito, cobertura,
} from '../js/nucleo.js';
import { codigos, existe, porForcaBruta, resumo } from '../js/busca.js';
import {
  peneiraDaContagem, tamanhoForcado, hamming, hammingComoCodigo,
  previsaoDoCiclo, previsaoDoCaminho,
} from '../js/juiz.js';

/* --------------------------------------------------------------- grafos */

test('a vizinhanca fechada inclui o proprio vertice', () => {
  const g = ciclo(6);
  for (let v = 0; v < g.n; v++) {
    assert.equal((g.fechada[v] >> BigInt(v)) & 1n, 1n, 'v=' + v);
    assert.equal(contaBits(g.fechada[v]), 3, 'no ciclo o grau e 2');
  }
});

test('a lista de arestas sai sem repeticao e sem laco', () => {
  // A notacao LCF escreve cada corda duas vezes. O grafo de Heawood ja
  // apareceu aqui com 28 arestas em vez de 21.
  for (const g of [heawood(), porLCF(16, [5, -5]), ciclo(7), grade(3, 4)]) {
    const vistas = new Set(g.arestas.map(([a, b]) => a + ':' + b));
    assert.equal(vistas.size, g.arestas.length);
    for (const [a, b] of g.arestas) assert.notEqual(a, b);
  }
  assert.equal(heawood().arestas.length, 21);
});

test('a contagem de arestas bate com a soma dos graus dividida por dois', () => {
  for (const g of [ciclo(9), caminho(9), grade(3, 4), toro(4, 5), cubo(4), completo(6), petersen(), heawood()]) {
    const soma = graus(g).reduce((a, b) => a + b, 0);
    assert.equal(soma, 2 * g.arestas.length);
  }
});

test('os grafos cubicos do catalogo sao mesmo cubicos', () => {
  for (const g of [petersen(), heawood(), porLCF(16, [5, -5]), porLCF(18, [5, 7, -7, 7, -7, -5]), porLCF(20, [5, -5, 9, -9])]) {
    assert.equal(regular(g), 3, 'n=' + g.n);
    assert.equal(g.arestas.length, (3 * g.n) / 2);
  }
});

test('o toro e 4-regular e recusa lado menor que 3', () => {
  for (let m = 3; m <= 6; m++) for (let n = m; n <= 6; n++) assert.equal(regular(toro(m, n)), 4);
  assert.throws(() => toro(2, 5), RangeError);
});

test('o cubo de dimensao d e d-regular com 2^d vertices', () => {
  for (let d = 1; d <= 6; d++) {
    const g = cubo(d);
    assert.equal(g.n, 2 ** d);
    assert.equal(regular(g), d);
  }
});

/* --------------------------------------------------------- o que e codigo */

test('todo codigo que a busca devolve cobre cada vertice exatamente uma vez', () => {
  for (const g of [ciclo(9), caminho(11), grade(2, 5), grade(4, 4), cubo(3), completo(7), toro(5, 5)]) {
    for (const c of codigos(g).codigos) {
      assert.deepEqual(cobertura(g, c), new Array(g.n).fill(1));
      assert.ok(ehCodigoPerfeito(g, c));
    }
  }
});

test('a busca nao repete codigo nenhum', () => {
  for (const g of [ciclo(12), grade(4, 4), cubo(3), toro(5, 5), completo(6)]) {
    const lista = codigos(g).codigos;
    assert.equal(new Set(lista.map(String)).size, lista.length);
  }
});

test('num grafo regular todo codigo tem o tamanho forcado pela conta', () => {
  for (const g of [ciclo(12), cubo(3), completo(7), toro(5, 5)]) {
    const t = tamanhoForcado(g);
    for (const c of codigos(g).codigos) assert.equal(contaBits(c), t);
  }
});

test('a cobertura exata e a forca bruta acham os mesmos codigos', () => {
  for (const [nome, g] of [['C9', ciclo(9)], ['C10', ciclo(10)], ['P12', caminho(12)],
    ['2x5', grade(2, 5)], ['4x4', grade(4, 4)], ['Q4', cubo(4)], ['K5', completo(5)],
    ['Petersen', petersen()], ['toro 3x5', toro(3, 5)]]) {
    const a = codigos(g).codigos.map(String).sort();
    const b = porForcaBruta(g).codigos.map(String).sort();
    assert.deepEqual(a, b, nome);
  }
});

test('a forca bruta se recusa a passar de 22 vertices', () => {
  assert.throws(() => porForcaBruta(cubo(5)), RangeError);
});

/* ---------------------------------------------------------------- juizes */

test('a peneira da contagem so fala de grafo regular', () => {
  assert.equal(peneiraDaContagem(caminho(7)), null);
  assert.equal(peneiraDaContagem(grade(3, 4)), null);
  assert.equal(peneiraDaContagem(petersen()), false);
  assert.equal(peneiraDaContagem(cubo(3)), true);
});

test('quando a peneira barra, codigo nenhum existe', () => {
  for (const g of [petersen(), heawood(), cubo(2), cubo(4), cubo(5), toro(3, 4), toro(4, 4)]) {
    if (peneiraDaContagem(g) === false) assert.equal(existe(g), false, 'n=' + g.n);
  }
});

test('o codigo de Hamming e mesmo um codigo perfeito do cubo', () => {
  for (const r of [2, 3]) {
    const h = hammingComoCodigo(r);
    const g = cubo(h.d);
    assert.equal(h.tamanho, 2 ** (h.d - r));
    assert.ok(ehCodigoPerfeito(g, h.conjunto), 'd=' + h.d);
  }
});

test('o codigo de Hamming tem distancia minima 3', () => {
  const h = hamming(3);
  for (let i = 0; i < h.palavras.length; i++) {
    for (let j = i + 1; j < h.palavras.length; j++) {
      const d = contaBits(BigInt(h.palavras[i] ^ h.palavras[j]));
      assert.ok(d >= 3, 'duas palavras a distancia ' + d);
    }
  }
});

test('a conta do circulo acerta os ciclos', () => {
  for (let n = 3; n <= 20; n++) {
    assert.equal(resumo(ciclo(n), 'C').quantos, previsaoDoCiclo(n).quantos, 'n=' + n);
  }
});

test('a conta da fita acerta os caminhos', () => {
  for (let n = 1; n <= 20; n++) {
    assert.equal(resumo(caminho(n), 'P').quantos, previsaoDoCaminho(n).quantos, 'n=' + n);
  }
});
