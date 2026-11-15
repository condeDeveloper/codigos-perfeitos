#!/usr/bin/env node
// O medidor: roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js          todas
//   node ferramentas/medidor.js cubos    so uma

import {
  ATE_CICLO, ATE_CAMINHO, LADOS_DA_GRADE, CUBOS, NOMEADOS,
  linhaCiclo, linhaCaminho, linhaGrade, linhaToro, linhaCubo, linhaNomeado,
  contaDaPeneira, linhaForcaBruta, ondeNaGrade,
} from '../js/medidas.js';
import { ciclo, caminho, grade, toro, cubo, completo, petersen } from '../js/nucleo.js';

const n = (x) => x.toLocaleString('pt-BR');

function titulo(t) {
  console.log('');
  console.log(t);
  console.log('-'.repeat(t.length));
}

function familias() {
  titulo('Ciclos e caminhos: a busca contra a conta');
  console.log('ciclos C3 a C' + ATE_CICLO + ':');
  let dif = 0;
  const comCodigo = [];
  for (let i = 3; i <= ATE_CICLO; i++) {
    const r = linhaCiclo(i);
    if (!r.bate) dif++;
    if (r.existe) comCodigo.push(i + ' (' + r.quantos + ' codigos de ' + r.tamanhos.join('/') + ')');
  }
  console.log('   tem codigo em: ' + comCodigo.join(', '));
  console.log('   divergencias contra a conta do circulo: ' + dif);
  console.log('');
  console.log('caminhos P1 a P' + ATE_CAMINHO + ' (quantos codigos cada um):');
  const linha = [];
  let dif2 = 0;
  for (let i = 1; i <= ATE_CAMINHO; i++) {
    const r = linhaCaminho(i);
    if (!r.bate) dif2++;
    linha.push(i + ':' + r.quantos);
  }
  console.log('   ' + linha.join('  '));
  console.log('   divergencias contra a conta da fita: ' + dif2);
  console.log('   o caminho SEMPRE tem codigo; o ciclo so quando 3 divide n.');
}

function grades() {
  titulo('Grades m x n: quantos codigos perfeitos');
  let cabeca = '     ';
  for (let j = 1; j <= LADOS_DA_GRADE; j++) cabeca += String(j).padStart(5);
  console.log(cabeca);
  for (let i = 1; i <= LADOS_DA_GRADE; i++) {
    let l = String(i).padStart(4) + ' ';
    for (let j = 1; j <= LADOS_DA_GRADE; j++) {
      l += (j < i ? '.' : String(linhaGrade(i, j).quantos)).padStart(5);
    }
    console.log(l);
  }
  const tem = ondeNaGrade();
  console.log('');
  console.log('das ' + (LADOS_DA_GRADE * (LADOS_DA_GRADE + 1) / 2) + ' grades ate ' +
    LADOS_DA_GRADE + 'x' + LADOS_DA_GRADE + ', ' + tem.length + ' tem codigo: ' +
    tem.map((x) => x.m + 'x' + x.n).join(', '));
}

function toros() {
  titulo('Toros m x n: a peneira da contagem contra a existencia');
  console.log('toro   vertices  peneira   tamanho forcado   codigos');
  for (let m = 3; m <= 8; m++) {
    for (let j = m; j <= 8; j++) {
      const r = linhaToro(m, j);
      if (!r.peneira && r.quantos === 0) continue;
      console.log(
        (m + 'x' + j).padStart(5) +
        String(r.n).padStart(10) +
        (r.peneira ? 'passa' : 'barra').padStart(9) +
        String(r.forcado === null ? '-' : r.forcado).padStart(18) +
        n(r.quantos).padStart(10));
    }
  }
}

function cubos() {
  titulo('Cubos Q_d: a peneira, a busca e o codigo de Hamming');
  console.log(' d  vertices  peneira   codigos  tamanho   Hamming   Hamming esta entre eles');
  for (const d of CUBOS) {
    const r = linhaCubo(d);
    console.log(
      String(d).padStart(2) +
      String(r.n).padStart(10) +
      (r.peneira ? 'passa' : 'barra').padStart(9) +
      n(r.quantos).padStart(10) +
      String(r.tamanhos.join('/') || '-').padStart(9) +
      String(r.tamanhoDeHamming === null ? '-' : r.tamanhoDeHamming).padStart(10) +
      (r.hammingEstaLa === null ? '  -' : (r.hammingEstaLa ? '  sim' : '  NAO')).padStart(25));
  }
}

function nomeados() {
  titulo('Grafos de nome proprio');
  console.log('grafo           vertices  grau  peneira  tamanho forcado  codigos');
  for (const [nome, faz] of NOMEADOS) {
    const r = linhaNomeado(nome, faz);
    console.log(
      nome.padEnd(16) +
      String(r.n).padStart(8) +
      String(r.grau === null ? '-' : r.grau).padStart(6) +
      (r.peneira === null ? '  -' : (r.peneira ? 'passa' : 'barra')).padStart(9) +
      String(r.forcado === null ? '-' : r.forcado).padStart(17) +
      n(r.quantos).padStart(9));
  }
}

function peneira() {
  titulo('A peneira da contagem e necessaria, e nao basta');
  const c = contaDaPeneira();
  console.log('casos em que (grau+1) divide o numero de vertices: ' + c.passam);
  console.log('   destes, COM codigo perfeito:  ' + c.tem);
  console.log('   destes, SEM codigo nenhum:    ' + c.naoTem);
  console.log('');
  console.log('os que passam e nao tem:');
  for (const x of c.casos) if (!x.existe) console.log('   ' + x.qual);
}

function preco() {
  titulo('A cobertura exata contra a forca bruta');
  console.log('grafo          vertices  pela cobertura  pela forca bruta  bate  nos    subconjuntos  razao');
  const casos = [
    ['C9', ciclo(9)], ['C12', ciclo(12)], ['P12', caminho(12)],
    ['grade 2x5', grade(2, 5)], ['grade 4x4', grade(4, 4)],
    ['Q4', cubo(4)], ['K5', completo(5)], ['Petersen', petersen()],
    ['toro 3x5', toro(3, 5)], ['toro 4x5', toro(4, 5)],
  ];
  for (const [nome, g] of casos) {
    const r = linhaForcaBruta(nome, g);
    console.log(
      nome.padEnd(15) +
      String(r.n).padStart(8) +
      n(r.pelaCobertura).padStart(16) +
      n(r.pelaForcaBruta).padStart(18) +
      (r.bate ? '  sim' : '  NAO') +
      n(r.nosDaCobertura).padStart(7) +
      n(r.testadosPelaBruta).padStart(14) +
      (Math.round(r.razao) + 'x').padStart(9));
  }
}

const TABELAS = { familias, grades, toros, cubos, nomeados, peneira, preco };

const pedido = process.argv[2];
if (pedido) {
  if (!TABELAS[pedido]) {
    console.error('nao conheco a tabela "' + pedido + '". tenho: ' + Object.keys(TABELAS).join(', '));
    process.exit(1);
  }
  TABELAS[pedido]();
} else {
  for (const f of Object.values(TABELAS)) f();
}
console.log('');
