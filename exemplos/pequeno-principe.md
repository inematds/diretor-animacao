# Exemplo completo — "O Pequeno Príncipe" (21 imagens + narração → filme 2min11)

> Primeiro filme real dirigido pela skill `diretor-animacao` (F2), 2026-06-11.
> Material: `~/projetos/pequeno-principe/` · Saída: `filme/pequeno-principe-filme.mp4` (1080p30, 130.8s).

## 1. Material de entrada

| Item | O quê |
|---|---|
| Imagens | 21 ilustrações aquarela 1280×720 (flux2-klein, estilo coeso) — `assets/img/s1..s21.png` |
| Narração | 22 WAVs prontos (`assets/audio/s1..s22.wav`), 104.4s total; s22 = CTA "inema.club" |
| Pedido | "filme impactante, com músicas e efeitos de som" |

**Análise (passo VER):** todas as imagens são **desenho ⇒ `effects: {parallax: 0}`** (regra A/B).
Por serem 1280×720 (< 1920), zooms ficaram ≤1.6×.

## 2. Decupagem final (26 shots de 21 imagens)

**Ato 1 — O deserto** (`cinema-dramatico` → `sonho-etereo` na aparição)

| # | Img | Beat | Movimento | Transição → |
|---|-----|------|-----------|-------------|
| c1 | s1 | abertura | pull-out **dramático** (príncipe → deserto) | cut |
| c2 | s2 | a queda | pan avião → piloto | cut |
| c3a | s3 | conserto | push no motor | cut (narração atravessa) |
| c3b | s3 | preocupação | close no rosto | dip_to_black 0.8 (amanhecer) |
| c4 | s4 | a aparição | push-in 0.7 muito lento | cut |
| c5 | s5 | "desenha-me um carneiro" | pan menino → caderno | **whip 0.3** (virada de alegria) |
| c6a | s6 | a caixa | push na caixa | cut |
| c6b | s6 | encanto | close no sorriso | cut |
| c7 | s7 | "veio de longe" | tilt-up rostos → estrelas | dip_to_black 1.0 (flashback) |

**Ato 2 — O planeta e a rosa** (`sonho-etereo`)

| # | Img | Beat | Movimento | Transição → |
|---|-----|------|-----------|-------------|
| c8 | s8 | o planetinha | **orbit** 1.1 | cut |
| c9 | s9 | os vulcões | framing-in menino+vulcões | cut |
| c10 | s10 | os baobás | pull_out (planeta tomado) | cut |
| c11 | s11 | nasce a rosa | push lento na redoma | cut |
| c12 | s12 | amor e mágoa | pan rosas → rosto | **whip 0.3** (decide partir) |
| c13 | s13 | a partida | framing diagonal subindo c/ pássaros | dip_to_black 0.9 |

**Atos 3–4 — Os planetas, a Terra, a raposa**

| # | Img | Beat | Movimento | Transição → |
|---|-----|------|-----------|-------------|
| c14 | s14 | planetas estranhos | pan right 0.9 | cut |
| c15a | s15 | o rei | push na silhueta | cut |
| c15b | s15 | as ilusões | close no homem dos números | cut |
| c16 | s16 | o jardim de rosas | pull-out revela as centenas | cut |
| c17 | s17 | o coração aperta | push 0.5 sutil (**vale contemplativo**) | **crossfade 0.5** (único) |
| c18a | s18 | a raposa | tracking right (cut entre shots da mesma imagem — lição F2, sem whip) | cut |
| c18b | s18 | o segredo | close raposa+menino | cut |
| c19 | s19 | cativar | push-in 0.6 lento | cut |
| c20 | s20 | despedida | framing mãos → rostos | dip_to_black 1.0 |
| c21 | s21 | "o essencial é invisível" | crane 0.8 **sutil — FIM SUSPENSO** | dip_to_black 0.8 |
| c22 | s1 (reuso) | CTA | push 0.3 sutil (fecha o círculo na abertura) | fim |

Conferências da gramática: 1 só `dramatico` (abertura) · transições nunca uniformes
(cut ~70%, whip ×2, dip ×5, crossfade ×1) · alternância de energia/eixo/distância · fim suspenso.

## 3. Som (música + SFX) — fluxo inemavox

As ferramentas: `~/projetos/inemavox/musica_v1.py` e `sfx_v1.py` (Freesound).
**Pegadinha:** os scripts NÃO carregam o `.env` sozinhos — exportar antes:

```bash
cd ~/projetos/inemavox && set -a && source .env && set +a
python3 musica_v1.py --query "calm piano cinematic ambient" --min-duration 110 --list-only
python3 musica_v1.py --query "..." --pick 0 --outdir <destino>   # baixa
```

| Elemento | Fonte | Licença | Uso |
|---|---|---|---|
| Música: *Curious Ambience* (Reg1n0ld, #503244, 183s) | Freesound | **CC0** | tema único, −16dB + **sidechain ducking** sob a narração |
| Vento: *Dark Sahara Egypt* (szegvari, #557552) | Freesound | **CC0** | cama nos atos 1 e 4 (−10/−12dB) |
| Whoosh (Sadiquecat, #742833) | Freesound | **CC0** | casado com cada whip (~0.15s antes da fronteira) |
| Shimmer de estrelas | **sintetizado** (ffmpeg: 6 senos arpejados + aecho) | n/a | shots c7 e c21 |

Regras aprendidas: **filtrar licença** (BY-NC descartado — uma harpa boa caiu por isso);
escolher música por **espectrograma** (`showspectrumpic`) quando não dá pra ouvir — um dos
candidatos CC0 tinha ruído de aquecedor na primeira metade, visível no espectro.

Mix (1 master, pixflow só aceita 1 track):

```
narração (montar-trilha) + música(−16dB→sidechaincompress key=narração)
+ vento(atrim/fades/adelay) + whoosh×2(adelay) + shimmer×2(adelay)
→ amix normalize=0 → alimiter 0.95 → trilha-master.wav
```

SFX posicionados com os **starts impressos pelo montar-trilha** (nunca na mão):
whips em 29.1s e 72.1s → whoosh em 28.95/71.95; shimmer em 37.3/121.9.

## 4. Pipeline executado

```bash
# 1. decupagem.json (26 cenas, fadeIn = duração da transição da fronteira ANTERIOR — vale p/ whip, crossfade E dip)
node ~/.claude/skills/diretor-animacao/scripts/montar-trilha.mjs decupagem.json narracao.wav
# 2. baixar música/SFX (inemavox, acima) + sintetizar shimmer + mixar trilha-master.wav
# 3. spec YAML (defaults: look cinema-dramatico, parallax 0, cut) → validate → render
cd ~/projetos/pixflow/skill
node cli/pixflow-motion.mjs validate ~/projetos/pequeno-principe/filme/pequeno-principe.movie.yaml
node cli/pixflow-motion.mjs render   ~/projetos/pequeno-principe/filme/pequeno-principe.movie.yaml saida.mp4
# 4. verificação anti-pisca (DICAS nº 1) — atenção: metadata=mode=print loga em nível INFO (não usar -v error)
ffmpeg -ss 6.0 -i saida.mp4 -frames:v 12 -vf "signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG" -f null -
# 5. versão de compartilhamento (o grain do look custa bitrate: 474MB → CRF 24 = 71MB)
ffmpeg -i saida.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart saida-web.mp4
```

## 5. Verificação (resultado)

- 4 fronteiras auditadas (cut/whip/crossfade/dip): cut instantâneo limpo (69→108 em 1 frame),
  whip varre, crossfade e dip graduais — **nenhum frame 0.0 espúrio**.
- 6 frames-chave inspecionados com visão: enquadramentos = decupagem.
- Áudio master: mean −25.8dB, max −2.9dB (sem clip).

## 6. Lições novas deste exemplo

1. **inemavox `.env`**: sempre `set -a; source .env; set +a` antes dos scripts de música/SFX.
2. **Licença primeiro**: rejeitar BY-NC já na listagem (`--list-only`) antes de se apegar ao som.
3. **Espectrograma como ouvido**: `showspectrumpic` revela drones/ruído antes de baixar errado.
4. **fadeIn na decupagem vale para TODAS as transições com overlap** (whip, crossfade e
   dip_to_black) — o Movie.jsx trata dip como fade na cena seguinte também.
5. **CTA fechando o círculo**: reusar a imagem de abertura no shot final (respiração estática)
   dá sensação de obra fechada — bom padrão para narrativa circular.
6. Imagem 1280×720 segura zoom até ~1.6× em saída 1080p (aquarela perdoa o upscale 1.5×).
