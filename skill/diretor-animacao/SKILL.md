---
name: diretor-animacao
description: O Diretor de Animação — transforma IMAGENS PRONTAS (fotos reais e/ou ilustrações) + NARRAÇÃO em um FILME profissional, sem IA generativa de vídeo. Analisa cada imagem (visão), segmenta a narração em beats, e decide POR imagem a câmera (18 movimentos + framing from/to), duração, transição, look e parallax, seguindo gramática cinematográfica. Render via pixflow (motor v2.3). Use quando o usuário der um conjunto de imagens + narração (áudio ou texto) e pedir "vira filme", "anima essas imagens", "dirige esse material", "filme com essas fotos", "motion film das imagens".
---

# Diretor de Animação

Entrada: **N imagens prontas** (mistas: foto/ilustração) + **narração** (WAVs por trecho, 1 WAV único, ou TEXTO → TTS local).
Saída: **filme MP4** com decupagem profissional. O segredo: **cada imagem recebe a SUA dinâmica** — e imagens ricas viram 2–4 shots.

## Motor
`pixflow` v2.3+ (`~/projetos/pixflow/skill`): 18 movimentos + `framing` from/to + transições
`cut/whip/whip_left/zoom_blur/dip_to_black/crossfade` + parallax 2.5D + looks + respiração.
Spec YAML `pixflow.movie/v1`. Render: `node cli/pixflow-motion.mjs render spec.yaml out.mp4`.

## Fluxo (sempre nesta ordem)

1. **VER** — abrir CADA imagem (Read/visão) e anotar: tipo (**foto → parallax pleno; desenho →
   `effects: {parallax: 0}`**), conteúdo (retrato/paisagem/objeto/dois-sujeitos/…), emoção, e o
   **ponto de interesse** `at: [x,y]` (0..1) p/ framing.
2. **OUVIR** — narração: medir duração de cada trecho (ffprobe). Se vier texto: gerar TTS antes
   (`npx hyperframes tts --voice pf_dora`). Se vier 1 WAV único: segmentar por beats.
3. **DECIDIR** — aplicar [references/gramatica-direcao.md](references/gramatica-direcao.md):
   movimento por beat (tabela mestra), regras duras (alternância, amplitude ≤2 dramáticos, fim
   suspenso), transição POR fronteira (nunca uniforme), curva de 3 atos, multi-shot nas imagens
   ricas (narração pode atravessar o corte).
4. **MOSTRAR A DECUPAGEM** ao usuário (tabela: cena · imagem · beat · movimento · transição ·
   duração) e pedir OK antes do render (pular só se ele disser "direto").
5. **TRILHA** — `node scripts/montar-trilha.mjs decupagem.json narracao.wav` (compensa overlaps
   de transição; NUNCA calcular starts na mão).
6. **SPEC + RENDER** — escrever o YAML, `validate`, render. Durações de cena = as da decupagem.
7. **VERIFICAR** — frames por cena + brilho frame-a-frame em 2 fronteiras (anti-pisca; receita em
   `~/projetos/diretor-animacao/DICAS-CORRECOES.md` nº 1). Entregar com tabela do que foi decidido.

## Regras de ouro
- **Timing de fonte única**: a narração governa as durações; transição com overlap encurta a
  timeline — por isso o montar-trilha existe.
- **Foto = parallax pleno · desenho = parallax 0** (A/B validado). Imagem ≥1920 se zoom >1.6×.
- **Transição nunca uniforme**; corte seco é o padrão (~70%).
- **Fim suspenso** — o último plano é o mais calmo, não o mais forte.
- **Conferir cada imagem** antes de dirigir (ponto de interesse certo > movimento bonito).
- 16:9 padrão; 9:16 sob pedido (safe zones).

## Referências
- [references/gramatica-direcao.md](references/gramatica-direcao.md) — a gramática completa.
- `~/projetos/diretor-animacao/DICAS-CORRECOES.md` — armadilhas de render e diagnósticos.
- `~/projetos/diretor-animacao/piloto-f0/` — pilotos e A/Bs que validaram cada regra.
