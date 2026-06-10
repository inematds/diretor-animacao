# Plano de viabilidade — skill "Diretor de Animação"
### imagens prontas (mistas) + narração → filme com cara de cinema, sem IA generativa de vídeo

> **Veredito: VIÁVEL.** O motor (~70%) já existe no ecossistema (pixflow). O que falta é
> (a) o **diretor automático** que decide câmera/tempo/luz POR imagem a partir da narração, e
> (b) ~5 efeitos avançados no motor. Nenhum projeto open source no mundo faz o pacote completo —
> a pesquisa confirmou que **essa lacuna existe** e que cada peça isolada está madura.

---

## 1. O contrato da skill

```
ENTRADA:  N imagens prontas (mistas: fotos reais + ilustrações) + narração (WAV/MP3 ou texto p/ TTS)
SAÍDA:    filme MP4 (16:9 / 9:16) com decupagem profissional: câmera, tempo, luz,
          foco, transições e efeitos decididos POR imagem segundo a narrativa
NÃO FAZ:  gerar imagem, gerar vídeo por IA (Kling/Veo/etc.)
```

O teste de sucesso: 50 imagens parecem um filme dirigido, não um slideshow.

---

## 2. O que JÁ EXISTE (inventário da pesquisa)

### 2.1 Motor — `pixflow` (o achado principal: está mais pronto do que parecia)

| Capacidade | Estado | Detalhe |
|---|---|---|
| **9 movimentos de câmera** | ✅ pronto | push_in, pull_out, ken_burns, pan (6 direções), dolly, orbit, float, **handheld** (tremor procedural!), static — todos com intensity/easing (`skill/src/camera.js`) |
| **Parallax 2.5D** | ✅ pronto | Depth-Anything-V2 via transformers.js (local, sem torch), UV displacement GLSL (`shaders.js`) |
| **6 looks cinematográficos** | ✅ pronto | cinema-dramatico, noir, retro-vhs, sonho-etereo, acao-epico, sci-fi — grain/vinheta/aberração/bloom/lift-gain/exposição/saturação (`looks.js`) |
| **3 transições** | ✅ pronto | cut, crossfade, dip_to_black |
| **Spec declarativo** | ✅ pronto | YAML `pixflow.movie/v1`: por cena → image, duration, camera, look, effects, caption, transition |
| **Trilha de áudio** | ✅ pronto | `audio.track` sincronizada (Remotion `<Audio/>`) |
| **Pipeline** | ✅ pronto | depth (cache) → Remotion+WebGL → FFmpeg. ~1–2 min p/ filme de 16s em GPU |
| **Transições GLSL avançadas** | ❌ TODO | whip pan, zoom blur, glitch, displacement — **receitas já escritas** em `docs/efeitos/02` |
| **Partículas/fog/light leaks** | ❌ TODO | receitas em `docs/efeitos/03` e `05` |
| **Rack focus / DoF** | ❌ não tem | viável: BokehPass + depth map (já temos o depth!) |
| **Luz animada (relâmpago, sweep)** | ❌ não tem | viável via shader (ver §3.3) |
| **Hold frame / speed ramp** | ❌ não tem | trivial no timeline |
| **Beat-sync** | ❌ TODO | documentado, não lido |

### 2.2 Cérebro de direção — `mdd` + `fontefilm` (o conhecimento existe, falta automatizar)

- **mdd**: biblioteca de 10 tomadas com **quando usar cada uma por beat** (push-in lento=tensão,
  crash zoom=virada, orbit=ápice, rack focus=descoberta, freeze=clímax…), regra de alternância
  ("dois push-in seguidos matam o ritmo"), continuidade 180°, e a **Faixa do Diretor** (7 trilhas:
  beat/câmera/ação/ritmo/escalação/estado/estilo). → `mdd/skill/references/biblioteca-tomadas.md`
- **fontefilm**: arquitetura de decupagem (agentes Director+DP), e a **lição do hormozi12 já
  registrada**: *"parallax sutil fica parado — ampliar vocabulário de movimento, variar por beat"*.
  Exatamente o problema que esta skill resolve. → `fontefilm/docs/notas-melhorias.md`

### 2.3 Pipeline de narração — `videoprodutor` / caso Pequeno Príncipe
- Narração local (Kokoro/inemavox) → durações reais (ffprobe) → `AUDIO[]` governa todo o timing.
  Modelo validado 2× (Hormozi, Pequeno Príncipe).

### 2.4 Apoio
- **Upscale** p/ zoom profundo: fal-upscale / Real-ESRGAN (pré-processar imagem antes de zoom >1.4×).
- **claude-remotion-motion / remotion-templates**: 81 componentes p/ títulos/overlays se precisar.

---

## 3. O que a INTERNET confirma (estado da arte 2024–2026)

1. **Depth por tipo de imagem** *(decisão importante p/ material misto)*:
   - fotos reais → **Depth Anything V2** (padrão, já usamos);
   - **ilustrações/pinturas → Marigold** (zero-shot, feito p/ imagem "fora de domínio").
   - → o diretor deve **escolher o modelo de depth conforme o tipo da imagem**.
2. **DepthFlow** (open source, alternativa ao Immersity AI): a melhor referência externa de parallax
   2.5D — vale estudar o shader; tem DoF/vignette/lens distortion integrados e upscale RealESR.
3. **Limite físico do parallax**: oclusão é o ponto fraco mundial. Regra prática: deslocamento
   3–8% do frame; acima disso, artefato de borda. (Inpainting de oclusão LDI existe mas é frágil.)
4. **Relighting**: IC-Light é imagem-única (frame a frame flickeria). **Para animar luz, o caminho
   certo é shader**: golden-hour = gradiente animado blend screen/multiply; relâmpago = flash com
   decay exponencial; vela = noise Perlin modulando brilho. Tudo GLSL barato e determinístico.
5. **Rack focus**: BokehPass (Three.js) + depth map, animando focus distance = rack focus sintético
   convincente. Maduro.
6. **Gramática Ken Burns consolidada** (vai virar regra do diretor):
   - 5–10s por imagem (narração densa), nunca <2s; movimento completa o percurso em 80–100% do plano
   - alternância obrigatória (zoom in → pan → zoom out → diagonal)
   - zoom in = tensão/detalhe · zoom out = contexto/conclusão · pan = desdobramento/conexão
   - hold frame = peso/contemplação (tristeza, monumento)
   - retrato → zoom in lento no rosto; paisagem → pan/zoom out; multidão → out do detalhe ao todo
7. **Pacote completo não existe** em open source (kburns-slideshow é o mais perto e não tem 2.5D).
   → a skill preenche uma lacuna real.

---

## 4. Arquitetura proposta — 3 camadas

```
IMAGENS + NARRAÇÃO
   │
   ▼
[A] O DIRETOR (a skill nova — o que não existe em lugar nenhum)
   1. OUVE: transcreve/segmenta a narração em beats (timestamps por trecho)
   2. VÊ: analisa cada imagem (visão LLM): tipo (foto/ilustração), conteúdo
      (retrato/paisagem/objeto/multidão), emoção, ponto de interesse (onde está o sujeito)
   3. DECIDE por imagem, com a gramática (mdd + Ken Burns + fontefilm):
      câmera (tipo/intensidade/direção/alvo) · tempo (duração, hold, ramp)
      · luz (look + evento de luz: sweep/flash/glow) · foco (rack focus? DoF?)
      · transição de saída (por intenção narrativa)
      + regra de alternância + continuidade + curva dramática global (3 atos)
   4. EMITE: movie spec estendido (pixflow.movie/v2) — revisável pelo usuário antes do render
   │
   ▼
[B] O MOTOR (pixflow estendido — evoluir, não recriar)
   já tem: 9 câmeras + parallax 2.5D + 6 looks + 3 transições + áudio
   adicionar (cada um tem receita pronta ou técnica madura):
   b1. rack focus / DoF animado (BokehPass + depth que já existe)
   b2. eventos de luz (light sweep, relâmpago, glow pulsante — shaders)
   b3. partículas/fog/light leaks (receitas em docs/efeitos/)
   b4. transições GLSL (whip pan, zoom blur, glitch — receitas em docs/efeitos/02)
   b5. hold frame + speed ramp (timeline)
   b6. depth dual: Depth-Anything-V2 (foto) | Marigold (ilustração) — flag por imagem
   b7. upscale automático quando zoom alvo > 1.4× (Real-ESRGAN)
   │
   ▼
[C] O MONTADOR (pipeline já validado)
   timing pela narração (modelo Pequeno Príncipe/videoprodutor) → render Remotion+FFmpeg
   → MP4 16:9 e 9:16 (safe zones)
```

**Contrato central: o spec v2.** O diretor escreve, o humano pode editar, o motor executa.
Cada cena declara: `image, depth_model, duration, camera{}, focus{}, light_event{}, look,
effects{}, hold{}, transition_out{}` + global: `narration, music, arc`.

---

## 5. Fases (cada uma entrega algo assistível)

| Fase | Entrega | Esforço estimado |
|---|---|---|
| **F0 — Piloto "dá pra sentir"** | 5 imagens mistas + 1 narração → filme usando SÓ o pixflow atual + timing de narração. Valida o pipeline e expõe o que falta na prática. | 1 sessão |
| **F1 — Motor+** | os 7 upgrades do motor (b1–b7) no pixflow, um por vez, com clipe de teste de cada efeito. Prioridade: rack focus, eventos de luz, transições GLSL (são o que mais "vende" cinema). | 2–4 sessões |
| **F2 — O Diretor** | a skill: narração+imagens → análise → decupagem automática → spec v2 → render. Inclui o "knowledge pack" destilado (gramática mdd + Ken Burns + tabela conteúdo→movimento) como referência da skill. | 2–3 sessões |
| **F3 — Polimento de cinema** | curva dramática global (intensidade cresce ao clímax), beat-sync com música, color grade por emoção/ato, modo revisão (preview por cena, regenerar 1 cena). | contínuo |

**Marco de validação:** ao fim da F2, rodar o teste real — as suas 50 imagens + narração → filme
de uma vez, e comparar com o Pequeno Príncipe (que vira o "antes").

---

## 6. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Parallax profundo gera artefato de borda (oclusão) | limitar deslocamento a 3–8%; intensidade controlada pelo diretor por imagem; inpainting de oclusão fica fora do escopo v1 |
| Depth ruim em ilustração | Marigold para ilustrações (b6); fallback: ken_burns sem parallax (2D puro ainda fica bom) |
| Relighting generativo flickeria | não usar IC-Light em vídeo; eventos de luz são shader (determinístico) |
| Zoom profundo pixela | upscale prévio automático (b7) |
| Diretor decide mal | spec é revisável antes do render; modo "regenerar só a cena N"; regra de alternância hard-coded |
| Tempo de render p/ 50 imagens | cache de depth; render por cena paralelizável; draft em 720p antes do high |

---

## 7. Decisões em aberto (para discutir antes da F0)

1. **Nome e casa da skill** — sugestões: `diretor-animacao` / `cinedirector` / dentro do pixflow?
   (recomendo repo próprio consumindo pixflow como motor, padrão videoprodutor)
2. **Narração**: a skill aceita áudio pronto E texto (gera TTS via inemavox/Kokoro)? (recomendo os dois)
3. **Música**: trilha além da narração já na v1? (recomendo v1 = narração; música na F3 com beat-sync)
4. **Spec revisável**: o usuário sempre revisa a decupagem antes do render, ou tem modo "direto"?
   (recomendo padrão = mostrar resumo da decupagem e pedir ok; flag --direto pula)

---

## Apêndice — fontes da pesquisa

**Internos:** pixflow (`skill/src/{camera,looks,shaders}.js`, `docs/efeitos/*`), mdd
(`skill/references/biblioteca-tomadas.md`), fontefilm (`docs/superpowers/specs/2026-06-07`,
`docs/notas-melhorias.md`), videoprodutor (caso Pequeno Príncipe), fal-upscale, remotion-templates.

**Externos:** Depth Anything V2 (CVPR'24) · Marigold · DepthFlow (BrokenSource) · 3D Photo
Inpainting (vt-vl-lab) · IC-Light V2 / TC-Light / RelightVid · Three.js BokehPass · glsl-film-grain
· VFX-JS · kburns-slideshow · gramática StudioBinder/Ken Burns.

---

# ADENDO pós-F0 (2026-06-10)

## Veredito do usuário sobre o F0
**"Movimento fraco, imagem parece parada."** Confirma a lição do hormozi12. Causa técnica identificada:
as amplitudes do pixflow são tímidas por design — `push_in` = zoom máx **1.18×**, `pan` = deslocamento
**12%**; o fpfilmv1 trabalha com `scale 0.7→1.15` (range ~64%) e `translateX ±20%`. **A F1 começa por
amplitude, não por efeito novo.**

## Achado: `fpfilmv1` (não estava na varredura)
`curso/trilha4/movimentos-camera.html` (802 linhas) — **16 movimentos de câmera** como @keyframes CSS,
com tabela "quando usar" e prompts. **7 movimentos que o pixflow NÃO tem**:
tilt, tracking, truck (c/ skew=parallax fake), pedestal, **crane** (Y+X+scale combinados), **aerial/drone**,
**whip pan** (já com blur 16px!), **dolly zoom (vertigo/Hitchcock)**.
Receitas portáveis pro GLSL do pixflow (são curvas de transform — mapeiam direto pra uOffset/uZoom).
Doc complementar: `doc/l2.txt` (prompts + quando usar).

## Achado: `aifilmmaking` (muito mais que "só docs")
Conhecimento de direção estruturado, pronto pra virar regra do Diretor (F2):
- **Tamanhos de plano ↔ intenção** (establishing=mundo novo, wide=isolamento, close=emoção, ECU=pista)
  + regra de ouro: **abre → aproxima → fecha em close**.
- **9 princípios de luz ↔ emoção** (negative fill, edge contrast, luz motivada, 80/20, luz dinâmica,
  contraste quente/frio) — vira spec dos light events da F1.
- **6 tipos de corte** (match cut, cut on action, fast cutting…) + princípio "um corte funciona quando
  ALGO CONTINUA" — vira regra de transição.
- **Ritmo**: fórmula RÁPIDO→LENTO→RÁPIDO; trocar de plano ~2s em ação.
- **As 4 perguntas do diretor** (por que este ângulo/movimento/duração/luz?) — vira o auto-check da F2.
- **Composição 3 camadas** + profundidade=emoção.
Arquivos: `doc/bloco1..6.md`, `assets/gen.py`.

## F1 recalibrada (ordem por impacto no "parece parada")
1. **AMPLITUDE++** — recalibrar os 9 movimentos atuais (zoom range até ~1.5×, pan até 20%) + parâmetro
   `amplitude` no spec; presets sutil/normal/dramático.
2. **+7 movimentos do fpfilmv1** — crane, aerial, tilt, tracking, truck, dolly_zoom, whip_pan (portar
   curvas pro camera.js).
3. **Movimento composto** — câmera nunca 100% parada: drift/handheld leve por baixo de qualquer
   movimento (a "respiração" que separa filme de slideshow).
4. **Eventos de luz** (light sweep, flash/relâmpago, glow pulsante — GLSL; specs guiados pelos 9
   princípios do aifilmmaking).
5. **Transições GLSL** — whip pan transition, zoom blur, glitch (receitas em pixflow docs/efeitos/02).
6. **Rack focus / DoF** (BokehPass + depth).
7. **Hold frame / speed ramp** + depth dual (Marigold p/ ilustração) + upscale p/ zoom.

## Feedback F1 (usuário) → regra de transição
**F1 "melhorou muito"** ✅. Problema apontado: **crossfade = duas imagens sobrepostas, "parece erro"** —
com o movimento forte do v2, a dupla-exposição do crossfade ficou evidente e feia.
**Regra para o Diretor (F2):** padrão = **corte seco** (cut); crossfade SÓ entre cenas
de baixo movimento/contemplativas (e curto, ≤0.5s); dip_to_black para fechamento de ato/fim.
Consistente com aifilmmaking: "um corte funciona quando ALGO CONTINUA".
F1b = mesmo filme com cortes secos (narração re-offsetada: starts 0/6.165/13.248/19.115/25.92, total 32.7s).

## Feedback F1 (usuário) #2 → transições NUNCA uniformes
Segundo apontamento: **"o piscar sempre igual entre troca de cena não ficou legal"** — o mesmo
crossfade 0.8s em toda troca cria um "pisca" mecânico e repetitivo.
**Regra para o Diretor (F2):** a TRANSIÇÃO é uma decisão por fronteira de cena, como a câmera —
nunca o mesmo mecanismo repetido o filme todo. Vocabulário e uso:
- **cut** (padrão, ~70%): invisível, mantém energia;
- **dip_to_black curto**: mudança de ato/tempo/lugar;
- **whip/zoom-blur (GLSL, F1 item 5)**: viradas de energia — prioridade de implementação SUBIU
  (é o que dá variedade de verdade entre cenas);
- crossfade: raro, só contemplativo e curto.
Mesma lógica do Ring Spark Burst: ritmo nasce do CONTRASTE entre fronteiras, não da repetição.

## Resultado dos experimentos (2026-06-10) → REGRA DO PARALLAX
- **EXP1 (5 fotos ultra-realistas 1080p, depth pleno):** fantasma sumiu ou ficou sutil ✅
- **EXP2 (ilustrações, parallax 0):** limpo; usuário aprovou como o modo para desenho ✅

**REGRA (decidida pelo usuário):**
- **FOTO REAL → parallax 2.5D pleno** (depth de foto é preciso; profundidade vale a pena)
- **DESENHO/ILUSTRAÇÃO → parallax 0** (`effects: {parallax: 0}`) — movimento = translação+zoom+
  roll+respiração do v2, que já segura o filme sozinho

Consequências:
- O Diretor (F2) classifica cada imagem (foto × desenho — visão LLM, já previsto) e seta o parallax.
- **Marigold (depth p/ ilustração) sai do caminho crítico** — vira melhoria futura opcional (b6 rebaixado).
- Upscale (b7) continua valendo: 1920×1080 nativo melhorou visivelmente o crop do tracking no EXP1
  → gerar/preparar imagem em alta sempre que houver zoom/crop forte.

## Feedback F2-demo (usuário)
1. **"Erro no lobo e menino"** (cena raposa) — deixar pra ajustar DEPOIS. Suspeitos: borda preta
   visível durante o deslize do whip (a cena nova entra com translateX e descobre a lateral) e/ou
   o salto de enquadramento entre c4a (tracking termina ~wide) e c4b (framing começa 1.25× em
   [0.55,0.45]) — raccord de posição imperfeito entre os dois shots da mesma imagem.
2. **"Transições entre cenas fracas"** — o corte seco é invisível por gramática, mas o filme
   narrado/contemplativo pede fronteiras com mais PRESENÇA. Candidatos a elevar:
   - whip de verdade (as DUAS cenas se movem: a antiga sai varrendo, a nova entra varrendo +
     blur mais forte; hoje só a nova desliza por cima = sensação fraca)
   - push (a nova EMPURRA a antiga pra fora — momentum contínuo)
   - match-on-motion: cortar com as duas câmeras em movimento na MESMA direção/energia
   - flash de luz curto (1–2 frames clareando) como acento de impacto
   - dip_to_black real entre atos (já corrigido no motor, não usado no demo)
   - zoom_blur nas viradas de energia
