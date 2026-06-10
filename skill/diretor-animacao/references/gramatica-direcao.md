# Gramática de direção — o knowledge pack do Diretor

> Destilado de: mdd (biblioteca de tomadas), aifilmmaking (plano/luz/corte), gramática Ken Burns,
> Ring Spark Burst (ritmo/setup), fpfilmv1 (vocabulário) e as regras VALIDADAS nos pilotos.

## 1. Conteúdo da imagem → movimento (a tabela mestra)

| Conteúdo / beat | Movimento | Por quê |
|---|---|---|
| abertura / estabelecer mundo | `aerial` ou `pull_out` ou `crane` invertida | revelar escala |
| retrato / rosto / emoção | `framing` wide→close no rosto, ou `push_in` lento | aproximação = humanidade |
| objeto de valor / detalhe citado | `push_in` 1.0–1.2 ou `framing` no detalhe | foco = importância |
| mundo/objeto 3D (planeta, produto) | `orbit` | tridimensionalidade |
| dois sujeitos / relação | `tracking` ou `pan` entre eles | desdobra a conexão |
| paisagem ampla | `pan` lento ou `tilt` | leitura do espaço |
| tensão crescente / revelação | `push_in` lento (quanto mais lento, mais tensão) | pressão |
| virada súbita / impacto | `crash_zoom` ou `whip_pan` | choque |
| inquietação / vertigem | `dolly_zoom` (raro! 1× por filme no máx.) | desconforto |
| documental / urgência | `handheld` | imperfeição = realismo |
| clímax reflexivo / fim | `crane` subindo, ou `push_in` 0.6 + hold | ascensão / peso |
| tristeza / contemplação | quase-static (breath) ou `push_in` 0.5 muito lento | respeito |

## 2. Regras duras (não-negociáveis)
1. **Alternância**: nunca 2 movimentos iguais vizinhos; alternar também ENERGIA (in/out), EIXO
   (h/v) e DISTÂNCIA (wide/close).
2. **Parallax por tipo** (A/B validado): foto real → pleno; desenho → `effects: {parallax: 0}`.
3. **Duração**: narração + 0.6s lead + 0.8–1.0s tail. Nunca <2s (exceto burst 0.8–1.5s). Sem
   narração: 3–5s.
4. **Movimento completa o percurso** em 80–100% do plano (nada de chegar e ficar morto — a
   respiração cobre o resto).
5. **Amplitude**: `dramatico` só 1–2×/filme (abertura ou clímax); base `normal`; contemplativo `sutil`.
6. **Fim suspenso**: o último plano NUNCA é o movimento mais forte — é hold/quase-static ou
   crane lenta ("preserve unresolved energy").

## 3. Transições (decisão POR fronteira — nunca uniforme)
| Intenção | Transição |
|---|---|
| continuidade de energia (padrão, ~70%) | `cut` |
| virada de energia / mudança brusca | `whip` (0.25–0.35s) ou `zoom_blur` (0.3–0.4s) |
| mudança de ato / tempo / lugar | `dip_to_black` (0.8–1.2s) |
| respiro contemplativo (raro, ≤1×) | `crossfade` curto (≤0.5s) |
**Proibido:** a mesma transição em todas as fronteiras ("pisca igual" cansa); crossfade entre
cenas de movimento forte (dupla exposição).

## 4. Multi-shot por imagem (burst / decomposição)
Uma imagem rica pode virar 2–4 shots (`framing` com `at` diferente): wide estabelece → cut/whip →
close no ponto de interesse. Usar quando: a narração cita um detalhe; o beat pede ênfase; o filme
precisa de ritmo. A narração pode ATRAVESSAR o corte (montagem sobre fala contínua).

## 5. Curva dramática (escalation map)
Distribuir intensidade em 3 atos: abre forte (1 movimento `dramatico`) → desenvolve em `normal`
com 1 vale contemplativo → cresce ao clímax (burst/whip) → fecha suspenso (regra 6).

## 6. Look / luz por emoção
| Emoção do beat | Look |
|---|---|
| drama / peso / abertura | `cinema-dramatico` |
| encanto / sonho / ternura | `sonho-etereo` |
| dureza / perda | `noir-film` |
| energia / ação | `acao-epico` |
Trocar de look NO MÁXIMO a cada 2 cenas; o filme precisa de uma identidade dominante.

## 7. Enquadramento (`framing.at`) — onde mirar
Olhar a imagem e identificar o ponto de interesse REAL (rosto, objeto citado, fonte de luz).
`at` = coordenadas dele (0..1, origem topo-esquerda). Validar: zoom alto exige `at` longe da borda
(o motor clampa, mas melhor mirar certo). Foto ≥1920 para zoom >1.6×.

## 8. Checklist antes do render (as 4 perguntas + técnica)
- Por que ESTE movimento neste beat? (se não souber justificar, troque)
- Duração casa com a narração? (timing de fonte única)
- Fronteiras variadas e com intenção?
- Parallax certo por tipo de imagem? Amplitude com no máx. 2 `dramatico`?
- Fim suspenso?
