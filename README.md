# diretor-animacao

**O Diretor de Animação** — transforma **imagens prontas** (fotos reais e/ou ilustrações) + **narração** (áudio ou texto) em um **filme MP4 profissional, sem IA generativa de vídeo**. A skill analisa cada imagem com visão, segmenta a narração em beats e decide por imagem a câmera, duração, transição, look e parallax, seguindo gramática cinematográfica. O render é determinístico, via motor [pixflow](../pixflow) v2.3+.

## Recursos

- **Skill `diretor-animacao`** (`skill/diretor-animacao/SKILL.md`) — fluxo completo VER → OUVIR → DECIDIR → DECUPAGEM → TRILHA → SPEC + RENDER → VERIFICAR.
- **Análise visual por imagem**: tipo (foto → parallax 2.5D pleno; desenho → parallax 0 — regra validada por A/B), conteúdo, emoção e ponto de interesse `at: [x,y]` para framing.
- **Direção por beat de narração**: 18 movimentos de câmera (incl. crane, aerial, dolly zoom, whip pan) + `framing` from/to, com regras duras de alternância, amplitude (≤2 dramáticos seguidos) e **fim suspenso** (último plano é o mais calmo).
- **Transições por fronteira, nunca uniformes**: `cut` (padrão, ~70%) / `whip` / `whip_left` / `zoom_blur` / `dip_to_black` / `crossfade`.
- **Multi-shot**: imagens ricas viram 2–4 shots, com a narração podendo atravessar o corte.
- **Gramática cinematográfica** completa em `skill/diretor-animacao/references/gramatica-direcao.md` (tabela mestra movimento × beat, curva de 3 atos).
- **`montar-trilha.mjs`** — monta a trilha de áudio a partir da decupagem compensando os overlaps de transição (timing de fonte única: a narração governa as durações).
- **`DICAS-CORRECOES.md`** — 9 lições de render cross-projeto (anti-pisca, frames pretos, anti-fantasma etc.).
- **`piloto-f0/`** — pilotos F0…F1d, experimentos (fotos reais, sem depth) e demo F2, com specs `*.movie.yaml` e decupagens que validaram cada regra.
- **`referencias/`** — estudo Ring Spark Burst (storyboard, prompt e lições).
- **`PLANO.md`** — plano de viabilidade, adendos de cada decisão e backlog (upgrade de transições, eventos de luz, partículas, speed-ramp…).

## Dependências

| Dependência | Para quê | Onde |
|---|---|---|
| **pixflow v2.3+** | Motor de render (spec YAML `pixflow.movie/v1`): parallax 2.5D, 18 movimentos, transições, looks, respiração | `~/projetos/pixflow/skill` — `node cli/pixflow-motion.mjs render spec.yaml out.mp4` |
| **Node.js** (≥18) | Scripts `.mjs` (montar-trilha, gen-fotos) e CLI do pixflow | — |
| **FFmpeg / ffprobe** | Medir duração da narração, encode final, verificação de frames | sistema |
| **Depth-Anything-V2** | Mapas de profundidade do parallax (via pixflow) | dependência do pixflow |
| **Remotion + Three.js/WebGL** | Composição e render dos shaders (via pixflow) | dependência do pixflow |
| **HyperFrames TTS** (Kokoro, voz `pf_dora`) | Gerar narração quando a entrada é texto: `npx hyperframes tts` | opcional |
| **flux2-klein** (`localhost:8000`) | Geração das imagens dos pilotos (`piloto-f0/gen-fotos.mjs`) | opcional, só p/ pilotos |
| **Claude Code com visão** | A skill abre cada imagem (Read/visão) antes de dirigir | — |

Checagem rápida: `cd ~/projetos/pixflow/skill && node cli/pixflow-motion.mjs check-deps`.

## Uso

1. Instale a skill (symlink): `ln -s $(pwd)/skill/diretor-animacao ~/.claude/skills/diretor-animacao`
2. No Claude Code, dê um conjunto de imagens + narração e peça: *"vira filme"*, *"anima essas imagens"*, *"dirige esse material"*.
3. A skill mostra a **decupagem** (cena · imagem · beat · movimento · transição · duração) para aprovação antes do render.

## Regras de ouro (validadas por A/B)

- Foto real = parallax pleno · desenho = parallax 0.
- Transição nunca uniforme; corte seco é o padrão.
- Fim suspenso — terminar no plano mais calmo.
- Imagem ≥1920px se zoom >1.6×; 16:9 padrão, 9:16 sob pedido.
- Nunca calcular starts de áudio na mão — sempre `montar-trilha.mjs`.

## Estrutura

```
skill/diretor-animacao/   # a skill (SKILL.md, gramática, montar-trilha.mjs)
piloto-f0/                # pilotos, experimentos e specs .movie.yaml
referencias/              # estudos de referência (Ring Spark Burst)
PLANO.md                  # plano de viabilidade + adendos + backlog
DICAS-CORRECOES.md        # lições de render
HANDOFF.md                # estado da última sessão
```

> MP4s, imagens e áudios dos pilotos ficam fora do git (ver `.gitignore`).
