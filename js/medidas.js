// As tabelas do README. Nenhum numero deste projeto e digitado a mao.

import {
  ciclo, caminho, grade, toro, cubo, completo, petersen, heawood,
  mobiusKantor, pappus, desargues, porLCF, regular, contaBits,
} from './nucleo.js';
import { codigos, resumo, porForcaBruta } from './busca.js';
import {
  peneiraDaContagem, tamanhoForcado, hammingComoCodigo, previsaoDoCiclo,
  previsaoDoCaminho,
} from './juiz.js';

export const ATE_CICLO = 24;
export const ATE_CAMINHO = 20;
export const LADOS_DA_GRADE = 8;
export const CUBOS = [1, 2, 3, 4, 5, 6, 7];

/** O catalogo de grafos de nome proprio. */
export const NOMEADOS = [
  ['K5', () => completo(5)],
  ['K8', () => completo(8)],
  ['cubo Q3', () => cubo(3)],
  ['Petersen', () => petersen()],
  ['Heawood', () => heawood()],
  ['Mobius-Kantor', () => mobiusKantor()],
  ['Pappus', () => pappus()],
  ['Desargues', () => desargues()],
  ['Nauru', () => porLCF(24, [5, -9, 7, -7, 9, -5])],
  ['Dyck', () => porLCF(32, [5, -5, 13, -13])],
];

// Q7 tem 128 vertices e tres tabelas perguntam sobre ele.
const guardado = new Map();
const umaVez = (ch, f) => {
  if (!guardado.has(ch)) guardado.set(ch, f());
  return guardado.get(ch);
};

export function linhaCiclo(n) {
  return umaVez('ciclo:' + n, () => {
    const r = resumo(ciclo(n), 'C' + n);
    const p = previsaoDoCiclo(n);
    return { ...r, previstos: p.quantos, bate: r.quantos === p.quantos };
  });
}

export function linhaCaminho(n) {
  return umaVez('caminho:' + n, () => {
    const r = resumo(caminho(n), 'P' + n);
    const p = previsaoDoCaminho(n);
    return { ...r, previstos: p.quantos, bate: r.quantos === p.quantos };
  });
}

export function linhaGrade(m, n) {
  return umaVez('grade:' + m + 'x' + n, () => resumo(grade(m, n), m + 'x' + n));
}

export function linhaToro(m, n) {
  return umaVez('toro:' + m + 'x' + n, () => {
    const g = toro(m, n);
    return { ...resumo(g, 'T' + m + 'x' + n), peneira: peneiraDaContagem(g), forcado: tamanhoForcado(g) };
  });
}

export function linhaCubo(d) {
  return umaVez('cubo:' + d, () => {
    const g = cubo(d);
    const r = resumo(g, 'Q' + d);
    // Hamming so existe quando d = 2^r - 1.
    const r2 = Math.round(Math.log2(d + 1));
    const temHamming = (1 << r2) - 1 === d;
    const h = temHamming ? hammingComoCodigo(r2) : null;
    return {
      ...r,
      peneira: peneiraDaContagem(g),
      forcado: tamanhoForcado(g),
      temHamming,
      tamanhoDeHamming: h ? h.tamanho : null,
      hammingEstaLa: h ? codigos(g).codigos.some((c) => c === h.conjunto) : null,
    };
  });
}

export function linhaNomeado(nome, faz) {
  return umaVez('nome:' + nome, () => {
    const g = faz();
    return {
      ...resumo(g, nome),
      grau: regular(g),
      peneira: peneiraDaContagem(g),
      forcado: tamanhoForcado(g),
    };
  });
}

/** A peneira passa, e mesmo assim nao existe codigo: quantas vezes? */
export function contaDaPeneira() {
  const casos = [];
  for (let m = 3; m <= 8; m++) {
    for (let n = m; n <= 8; n++) {
      const r = linhaToro(m, n);
      if (r.peneira) casos.push({ qual: 'toro ' + m + 'x' + n, existe: r.existe, quantos: r.quantos });
    }
  }
  for (const [nome, faz] of NOMEADOS) {
    const r = linhaNomeado(nome, faz);
    if (r.peneira) casos.push({ qual: nome, existe: r.existe, quantos: r.quantos });
  }
  return {
    passam: casos.length,
    tem: casos.filter((c) => c.existe).length,
    naoTem: casos.filter((c) => !c.existe).length,
    casos,
  };
}

/** A cobertura exata contra a forca bruta, no mesmo grafo. */
export function linhaForcaBruta(nome, g) {
  const a = codigos(g);
  const b = porForcaBruta(g);
  return {
    nome,
    n: g.n,
    pelaCobertura: a.quantos,
    pelaForcaBruta: b.quantos,
    bate: a.quantos === b.quantos,
    nosDaCobertura: a.nos,
    testadosPelaBruta: b.testados,
    razao: b.testados / a.nos,
  };
}

/** Onde existe codigo na tabela das grades. */
export function ondeNaGrade() {
  const tem = [];
  for (let m = 1; m <= LADOS_DA_GRADE; m++) {
    for (let n = m; n <= LADOS_DA_GRADE; n++) {
      const r = linhaGrade(m, n);
      if (r.existe) tem.push({ m, n, quantos: r.quantos, tamanhos: r.tamanhos });
    }
  }
  return tem;
}

export { contaBits };
