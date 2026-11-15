// A pagina. O grafo e desenhado em SVG e a cobertura e contada pelo mesmo
// codigo dos testes: clicar num vertice acende a vizinhanca fechada dele,
// e a cor diz se alguma casa foi coberta duas vezes.

import {
  ciclo, grade, toro, cubo, petersen, heawood, mobiusKantor, desargues,
  bits, contaBits, cobertura,
} from './nucleo.js';
import { codigos } from './busca.js';
import { peneiraDaContagem, tamanhoForcado } from './juiz.js';

const tela = document.getElementById('tela');
const escolha = document.getElementById('grafo');
const recado = document.getElementById('recado');
const btMostrar = document.getElementById('mostrar');
const btLimpar = document.getElementById('limpar');
const btProximo = document.getElementById('proximo');

const CATALOGO = {
  'ciclo-9': { nome: 'ciclo C9', faz: () => ciclo(9), jeito: 'roda' },
  'ciclo-10': { nome: 'ciclo C10', faz: () => ciclo(10), jeito: 'roda' },
  'grade-4x4': { nome: 'grade 4x4', faz: () => grade(4, 4), jeito: 'grade', m: 4, n: 4 },
  'grade-3x5': { nome: 'grade 3x5', faz: () => grade(3, 5), jeito: 'grade', m: 3, n: 5 },
  'toro-5x5': { nome: 'toro 5x5', faz: () => toro(5, 5), jeito: 'grade', m: 5, n: 5 },
  'cubo-3': { nome: 'cubo Q3', faz: () => cubo(3), jeito: 'roda' },
  'petersen': { nome: 'Petersen', faz: () => petersen(), jeito: 'petersen' },
  'heawood': { nome: 'Heawood', faz: () => heawood(), jeito: 'roda' },
  'mobius': { nome: 'Mobius-Kantor', faz: () => mobiusKantor(), jeito: 'roda' },
  'desargues': { nome: 'Desargues', faz: () => desargues(), jeito: 'roda' },
};

let atual = CATALOGO['grade-4x4'];
let g = atual.faz();
let escolhidos = 0n;
let lista = [];
let qual = 0;

const L = 440;

function posicoes() {
  const p = [];
  if (atual.jeito === 'grade') {
    const { m, n } = atual;
    const passo = Math.min(360 / Math.max(m, n, 2), 90);
    const x0 = L / 2 - (passo * (n - 1)) / 2;
    const y0 = L / 2 - (passo * (m - 1)) / 2;
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) p.push([x0 + j * passo, y0 + i * passo]);
  } else if (atual.jeito === 'petersen') {
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      p.push([L / 2 + 170 * Math.cos(a), L / 2 + 170 * Math.sin(a)]);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      p.push([L / 2 + 85 * Math.cos(a), L / 2 + 85 * Math.sin(a)]);
    }
  } else {
    for (let i = 0; i < g.n; i++) {
      const a = (i * 2 * Math.PI) / g.n - Math.PI / 2;
      p.push([L / 2 + 175 * Math.cos(a), L / 2 + 175 * Math.sin(a)]);
    }
  }
  return p;
}

function desenha() {
  const p = posicoes();
  const cob = cobertura(g, escolhidos);
  const svg = ['<svg viewBox="0 0 ' + L + ' ' + L + '" role="img" aria-label="o grafo ' + atual.nome + '">'];
  for (const [a, b] of g.arestas) {
    svg.push('<line x1="' + p[a][0].toFixed(1) + '" y1="' + p[a][1].toFixed(1) +
      '" x2="' + p[b][0].toFixed(1) + '" y2="' + p[b][1].toFixed(1) + '" class="aresta"/>');
  }
  for (let v = 0; v < g.n; v++) {
    const dentro = (escolhidos >> BigInt(v)) & 1n;
    const classe = dentro ? 'no escolhido' : cob[v] === 0 ? 'no' : cob[v] === 1 ? 'no coberto' : 'no demais';
    svg.push('<circle cx="' + p[v][0].toFixed(1) + '" cy="' + p[v][1].toFixed(1) +
      '" r="11" class="' + classe + '" data-v="' + v + '"><title>vertice ' + v +
      ', coberto ' + cob[v] + ' vez(es)</title></circle>');
  }
  svg.push('</svg>');
  tela.innerHTML = svg.join('');
  for (const c of tela.querySelectorAll('circle')) {
    c.addEventListener('click', () => {
      escolhidos ^= 1n << BigInt(Number(c.dataset.v));
      atualiza();
    });
  }
}

function atualiza() {
  desenha();
  const cob = cobertura(g, escolhidos);
  const demais = cob.filter((x) => x > 1).length;
  const vazios = cob.filter((x) => x === 0).length;
  const partes = ['<strong>' + contaBits(escolhidos) + '</strong> vertices escolhidos'];
  if (escolhidos === 0n) {
    partes.push('clique nos vertices para montar um codigo');
  } else if (demais === 0 && vazios === 0) {
    partes.push('<span class="ok">e um codigo perfeito</span>: todo vertice coberto uma vez');
  } else {
    if (demais) partes.push('<span class="aviso">' + demais + ' coberto(s) duas vezes ou mais</span>');
    if (vazios) partes.push(vazios + ' ainda descoberto(s)');
  }
  recado.innerHTML = partes.join(' · ');
}

function troca() {
  atual = CATALOGO[escolha.value];
  g = atual.faz();
  escolhidos = 0n;
  lista = codigos(g).codigos;
  qual = 0;
  const k = peneiraDaContagem(g);
  const t = tamanhoForcado(g);
  const info = document.getElementById('info');
  const partes = ['<strong>' + g.n + '</strong> vertices, <strong>' + g.arestas.length + '</strong> arestas'];
  if (k !== null) {
    partes.push('regular: a peneira da contagem ' + (k ? 'passa' : '<span class="aviso">barra</span>'));
    if (t !== null) partes.push('um codigo teria <strong>' + t + '</strong> vertices');
  }
  partes.push(lista.length === 0
    ? '<span class="aviso">nao existe codigo perfeito neste grafo</span>'
    : '<strong>' + lista.length + '</strong> codigos perfeitos');
  info.innerHTML = partes.join(' · ');
  btMostrar.disabled = lista.length === 0;
  btProximo.disabled = lista.length < 2;
  atualiza();
}

btMostrar.addEventListener('click', () => {
  if (lista.length === 0) return;
  escolhidos = lista[qual % lista.length];
  atualiza();
});

btProximo.addEventListener('click', () => {
  if (lista.length < 2) return;
  qual = (qual + 1) % lista.length;
  escolhidos = lista[qual];
  atualiza();
});

btLimpar.addEventListener('click', () => { escolhidos = 0n; atualiza(); });
escolha.addEventListener('change', troca);

troca();
