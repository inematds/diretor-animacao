# Dicas de correções — vídeo programático (Remotion/WebGL/HyperFrames)

> Lições aprendidas no piloto do diretor-animacao (jun/2026), válidas para QUALQUER projeto
> de vídeo do ecossistema (pixflow, videoprodutor, fontefilm, hyperframes…).
> Cada item: sintoma → causa → correção.

## 1. "Piscar" / frames pretos na troca de cena (Remotion + WebGL)
**Sintoma:** vários flashes na entrada de cada cena nova (imagem aparece-some-aparece).
**Causa:** o Remotion renderiza com VÁRIOS workers em paralelo; cada worker que cruza a fronteira
monta o canvas WebGL do zero. O `delayRender` segura o *carregamento* das texturas, mas **não
garante o redesenho** — o React não redesenha porque o nº do frame não mudou → captura sai PRETA.
O padrão intercalado (preto-bom-preto) é a assinatura dos workers.
**Correção:** chamar `draw()` explicitamente logo após carregar texturas, ANTES do
`continueRender()`. (`pixflow/skill/src/ParallaxCanvas.jsx`, drawRef.)
**Como diagnosticar:** extrair 8 frames consecutivos na fronteira e medir o brilho médio de cada:
```bash
ffmpeg -ss <t_corte-0.05> -i video.mp4 -frames:v 8 -vsync 0 /tmp/blink_%02d.png
for f in /tmp/blink_0*.png; do ffmpeg -v error -i $f -vf "scale=64:36,format=gray" -f rawvideo - \
  | od -An -tu1 -v | awk '{for(i=1;i<=NF;i++){s+=$i;n++}} END{printf "%s %.1f\n","'$f'",s/n}'; done
```
Brilho 0.0 intercalado = frames pretos de corrida de render.

## 2. "Pulso de brilho" no crossfade
**Sintoma:** a luminância afunda/pulsa em toda transição com fade.
**Causa:** a camada que entra tinha `backgroundColor: black` no wrapper — ao subir a opacidade,
o PRETO dela escurece a cena de trás. Não é crossfade, é fade-através-de-preto.
**Correção:** camada que faz fade NÃO pode ter fundo; preto só no root. Crossfade verdadeiro =
opacidade da cena nova sobe SOBRE a anterior visível.

## 3. dip_to_black como flash
**Sintoma:** corte para preto instantâneo e duro.
**Causa:** overlay preto sem interpolação de opacidade.
**Correção:** fade real escurece→preto→clareia (`interpolate([0, meio, fim], [0, 1, 0])`).

## 4. "Fantasma" / contorno duplicado no parallax 2.5D
**Sintoma:** contorno do sujeito duplica/rasga durante movimentos de translação (pan, orbit,
tracking); pior em ilustrações (depth map menos preciso). Zoom puro (push_in) não sofre.
**Causa:** o displacement diferencial (perto move ≠ longe) rasga exatamente na BORDA de
profundidade (contorno do sujeito contra o fundo).
**Correções em camadas (todas em `pixflow/skill/src/shaders.js`):**
1. dial do diferencial contido: translação ≤0.7, zoom ≤0.5 (acima duplica visivelmente);
2. **depth suavizado** (média de 5 taps) — a transição perto→longe vira rampa, não degrau;
3. **supressão ciente de borda**: medir o gradiente do depth; onde for alto (contorno),
   atenuar o displacement ~85%. Profundidade plena fica nas áreas suaves (céu/fundo/chão);
4. aberração cromática contida (fator 0.0012, não 0.004) — ela soma uma 2ª camada de "dobro".

## 5. Crossfade + movimento forte = dupla exposição
**Sintoma:** "duas imagens ao mesmo tempo, parece erro" nas trocas.
**Causa:** com câmera se movendo muito, o overlap do crossfade fica evidente e feio.
**Regra:** padrão = CORTE SECO (~70% das trocas); crossfade só entre cenas contemplativas e
curto (≤0.5s); dip_to_black para mudança de ato; transições chamativas (whip/zoom-blur) só
em virada de energia. Transição NUNCA uniforme o filme todo ("piscar sempre igual" cansa).

## 6. Movimento de câmera que "parece parado"
**Sintoma:** parallax rodando mas o vídeo parece slideshow.
**Causa:** o offset da câmera só alimentava o parallax diferencial (×~0.1) — a MOLDURA nunca
transladava. Um pan de "12%" movia 0.6% real.
**Correção:** offset precisa TRANSLADAR o enquadramento (uv += offset) + parallax por cima;
zoom com diferencial de profundidade (dolly real). E: amplitudes de cinema (zoom range ~1.3–1.5×,
travel 10–20%), não as tímidas (1.18×/12%); respiração de câmera contínua (drift+micro-zoom+roll)
para nunca haver frame 100% estático.
**Atenção:** translação exige HEADROOM de zoom — `fit(t) = 1/(1-2(|t|+margem))` — senão amostra
fora da imagem (borda esticada).

## 7. Sync de narração com transições com overlap
**Sintoma:** narração desincroniza ao longo do filme.
**Causa:** crossfade ENCURTA a timeline (`fromFrame = cursor - fadeInFrames`); somar durações
ignora o overlap.
**Correção:** calcular starts reais `start_i = start_{i-1} + D_{i-1} - T_fade` e montar a trilha
única com `adelay` por trecho nesses offsets. Com cortes secos, soma direta.

## 8. Verificação visual barata antes do render caro
- `snapshot`/frames extraídos por cena (contact-sheet) ANTES do render high.
- A/B honesto: mesma fonte, mesmos timings, só a mudança em teste.
- Frame-a-frame na fronteira (dica 1) para qualquer artefato de transição.

## 9. Regra do parallax por tipo de imagem (validada em A/B)
**Foto real → parallax 2.5D pleno** (depth preciso, fantasma desaparece ou fica sutil).
**Desenho/ilustração → parallax 0** (depth impreciso rasga contorno; a translação+zoom+roll do
motor v2 já dá vida suficiente). Imagem em alta resolução (≥1920) sempre que houver crop/zoom forte.
