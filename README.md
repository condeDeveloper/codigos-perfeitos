# Códigos perfeitos

Escolher vértices de um grafo de modo que **todo** vértice seja coberto
**exatamente uma vez** — ou está escolhido, ou tem um único vizinho escolhido.
É um ladrilhamento do grafo pelas vizinhanças fechadas, e quase nunca dá certo.

Aqui estão ciclos, caminhos, grades, toros, cubos e dez grafos de nome próprio
varridos por cobertura exata, até o cubo de 128 vértices. Todos os números saíram
de `ferramentas/medidor.js`.

**Página:** <https://condedeveloper.github.io/codigos-perfeitos/>

## Os quatro achados

1. **A condição de contagem é necessária e não basta — e falha quase metade das
   vezes.** Num grafo k-regular, `(k+1)` tem que dividir `n`. Em **13** casos ela
   deixou passar, e em **6** deles não existe código nenhum. O retrato é o grafo de
   **Desargues**: 20 vértices, grau 3, 20 ÷ 4 = 5 certinho — e a busca não acha um só.
2. **O cubo Q7 tem 240 códigos perfeitos, não um.** O código de Hamming, que é
   *construído* e não procurado, é apenas um deles. E o cubo só passa na peneira
   quando a dimensão é 1, 3, 7, 15…, isto é, `2^r − 1`.
3. **Das 36 grades até 8×8, só 12 têm algum código** — todas as 1×n, as 2×n de n
   ímpar, e o **4×4**, a única grade quadrada de lado 2 a 8 que tem. Nos toros é mais
   seco ainda: de 3×3 a 8×8, **só o 5×5**, com 10 códigos.
4. **Fechar o caminho num ciclo estraga quase tudo.** O caminho P_n tem código
   **sempre** — dois deles quando n deixa resto 2 na divisão por 3. O ciclo C_n só tem
   quando 3 divide n, e aí são exatamente 3.

## A peneira da contagem

Num grafo k-regular cada vértice escolhido cobre k+1 vértices, e as coberturas não se
tocam. Logo `(k+1) | n`, e o código, se existir, tem `n/(k+1)` vértices.

| grafo | vértices | grau | peneira | teria | códigos |
|---|---:|---:|---|---:|---:|
| K5 | 5 | 4 | passa | 1 | 5 |
| K8 | 8 | 7 | passa | 1 | 8 |
| cubo Q3 | 8 | 3 | passa | 2 | 4 |
| Petersen | 10 | 3 | barra | — | 0 |
| Heawood | 14 | 3 | barra | — | 0 |
| Möbius-Kantor | 16 | 3 | passa | 4 | 4 |
| Pappus | 18 | 3 | barra | — | 0 |
| **Desargues** | 20 | 3 | **passa** | 5 | **0** |
| Nauru | 24 | 3 | passa | 6 | 4 |
| Dyck | 32 | 3 | passa | 8 | 16 |

Os cúbicos entram pela notação LCF, e não desenhados de cabeça: desenhar de memória
uma figura conhecida já custou caro neste acervo.

## O cubo e o código de Hamming

| cubo | vértices | peneira | códigos | tamanho | Hamming está entre eles |
|---|---:|---|---:|---:|---|
| Q1 | 2 | passa | 2 | 1 | sim |
| Q2 | 4 | barra | 0 | — | — |
| Q3 | 8 | passa | 4 | 2 | sim |
| Q4 | 16 | barra | 0 | — | — |
| Q5 | 32 | barra | 0 | — | — |
| Q6 | 64 | barra | 0 | — | — |
| **Q7** | 128 | passa | **240** | 16 | **sim** |

O Hamming é construído: a palavra entra no código quando o XOR das posições acesas dá
zero. A busca não sabe disso e chega aos mesmos 16 vértices — mais outros 239 conjuntos
que também funcionam. Custo: **24.392 nós**, contra os 2^128 subconjuntos que a força
bruta precisaria.

## Grades, toros, ciclos e caminhos

Quantos códigos perfeitos tem cada grade m × n:

```
       1    2    3    4    5    6    7    8
  1    1    2    1    1    2    1    1    2
  2    .    0    2    0    2    0    2    0
  3    .    .    0    0    0    0    0    0
  4    .    .    .    2    0    0    0    0
  5    .    .    .    .    0    0    0    0
  6    .    .    .    .    .    0    0    0
  7    .    .    .    .    .    .    0    0
  8    .    .    .    .    .    .    .    0
```

Nos toros, de 3×3 a 8×8, o único com código é o **5×5**, com 10 deles, de 5 vértices
cada — que é o ladrilhamento do plano por cruzes de cinco casas, enrolado.

| família | existe quando | quantos |
|---|---|---|
| ciclo C_n | 3 divide n | exatamente 3 |
| caminho P_n | sempre | 2 se n ≡ 2 (mod 3), senão 1 |
| toro m×n (3..8) | só 5×5 | 10 |
| grade m×n (1..8) | 1×n, 2×ímpar, 4×4 | 1 ou 2 |

## A cobertura exata contra a força bruta

A busca não testa subconjunto: ela pega o menor vértice ainda descoberto, sabe que
**alguém da vizinhança fechada dele** tem que cobri-lo, e abre um galho por candidato.
Cada código sai uma vez só, sem conjunto de vistos.

| grafo | vértices | nós da cobertura | subconjuntos da força bruta | razão |
|---|---:|---:|---:|---:|
| C9 | 9 | 21 | 512 | 24× |
| grade 2×5 | 10 | 32 | 1.024 | 32× |
| Petersen | 10 | 20 | 1.024 | 51× |
| grade 4×4 | 16 | 45 | 65.536 | 1.456× |
| Q4 | 16 | 80 | 65.536 | 819× |
| toro 4×5 | 20 | 130 | 1.048.576 | 8.066× |

Nos dez grafos em que as duas rodaram, os conjuntos encontrados foram **exatamente os
mesmos**, um a um — não só o mesmo número.

## O que as medidas me corrigiram

- **Escrevi "a faixa 3 × n nunca tem código", lendo uma tabela truncada.** A tabela só
  mostra `n ≥ m`, então a coluna 3×2 não aparecia — e 3×2 é a grade 2×3 deitada, que
  tem **dois** códigos. A frase caiu; o que ficou foi "a 3×n não tem, de n = 3 a 8".
- **O grafo de Heawood nasceu com 28 arestas em vez de 21.** A notação LCF escreve cada
  corda duas vezes, uma de cada ponta. A adjacência estava certa o tempo todo: era a
  **contagem** que mentia, e só apareceu porque um teste compara a soma dos graus com o
  dobro do número de arestas.
- **Esperava que a peneira da contagem fosse quase suficiente.** Ela falha em 6 dos 13
  casos em que passa — e o Desargues, que é vértice-transitivo e bonito, é um deles.

## Rodando

```bash
node --test testes/*.test.js      # 39 testes
node ferramentas/medidor.js       # todas as tabelas
node ferramentas/medidor.js cubos
```

A página é JavaScript puro: sem framework, sem build, sem dependência.

## Arquivos

| arquivo | o que faz |
|---|---|
| `js/nucleo.js` | grafos, vizinhanças fechadas e as famílias |
| `js/busca.js` | a cobertura exata, e a força bruta para comparar |
| `js/juiz.js` | a peneira da contagem, o código de Hamming e as contas das famílias |
| `js/medidas.js` | as tabelas deste README |
| `testes/pesados.test.js` | o Q7 e o catálogo de nome próprio |

## Licença

MIT.
