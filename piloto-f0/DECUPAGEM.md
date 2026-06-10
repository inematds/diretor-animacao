# F0 — Decupagem do piloto (diretor manual)

> Este arquivo registra COMO o diretor (humano, nesta fase) decidiu cada cena.
> Na F2, a skill fará exatamente este raciocínio automaticamente — este é o gabarito.

## Material
- **5 imagens mistas**: c1 = **foto-realista** (flux2-klein, seed 201) · c2–c5 = ilustrações
  storybook (do projeto pequeno-principe).
- **Narração**: 5 trechos já gravados (Kokoro pf_dora), montados numa trilha única com offsets
  calculados para compensar o overlap dos crossfades (`fromFrame = cursor - fadeIn`).

## Timing (fonte única)
| cena | narração | dur. cena (0.6 lead + áudio + 1.0 tail) | start na timeline | offset da fala |
|---|---|---|---|---|
| c1 | 4.565s | 6.165s | 0.000 | 0.600 |
| c2 | 5.483s | 7.083s | 5.365 | 5.965 |
| c3 | 4.267s | 5.867s | 11.648 | 12.248 |
| c4 | 5.205s | 6.805s | 16.715 | 17.315 |
| c5 | 5.205s | 6.805s | 22.720 | 23.320 |

Total: **29.5s** (crossfade 0.8s encurta a soma).

## As decisões de direção (a gramática aplicada)
| cena | beat | conteúdo | câmera | por quê (regra) |
|---|---|---|---|---|
| c1 | estabelecer | deserto + avião caído (FOTO) | **pull_out** 1.2 | abertura ampla revela escala; zoom out = contexto |
| c2 | encanto | planeta minúsculo | **orbit** 1.0 + sonho-etereo | objeto/mundo → órbita mostra tridimensionalidade |
| c3 | importância | a rosa única | **push_in** 1.1 | detalhe de valor → aproximação cria tensão/foco |
| c4 | ternura | menino + raposa | **pan right** 1.0 + sonho-etereo | conexão entre dois sujeitos → pan desdobra a relação |
| c5 | contemplação | aviador sob estrelas | **push_in** 0.7 (lento, ease_out) + dip_to_black | clímax reflexivo → aproximação mínima, peso |

**Regra de alternância respeitada:** out → orbit → in → pan → in (nunca dois iguais vizinhos).
**Looks:** cinema-dramatico como base; sonho-etereo nos beats de encanto/ternura.

## O que o F0 deve responder (avaliar no resultado)
1. O parallax 2.5D segura nas **ilustrações** (depth bom?) e na **foto**?
2. O ritmo narração↔movimento convence ou precisa de mais variação (F1)?
3. Que efeitos fizeram mais falta? (hipótese do plano: rack focus, eventos de luz, transições GLSL)
4. Sync da narração com offsets calculados funcionou?
