// EXP1: 5 fotos ultra-realistas em alta resolução (mesmos 5 beats do piloto).
import { generateImage } from '/home/nmaldaner/projetos/pixflow/skill/cli/genimg.mjs';

const STYLE = 'ultra realistic photograph, cinematic film still, shot on ARRI Alexa 35mm, ' +
  'natural light, rich detail, shallow depth of field, film grain, photorealism. ' +
  'NO text, no words, no letters, no watermark';

const JOBS = [
  ['p1', 301, 'a small vintage propeller biplane crashed on vast golden desert dunes at dusk, faint smoke rising from the engine, dramatic amber sunset light, deep twilight sky'],
  ['p2', 302, 'a tiny rocky planet floating in deep space surrounded by stars and golden nebula clouds, epic scale, NASA-grade cosmic photography style'],
  ['p3', 303, 'macro photograph of a single luminous pink rose under a delicate glass dome on a wooden table, warm golden backlight, dark blue night background'],
  ['p4', 304, 'a wild red fox standing in tall golden grass at golden hour, facing a young blond boy a few steps away, tender moment, warm backlit rim light, starry dusk sky'],
  ['p5', 305, 'a lone man standing on desert dunes at night looking up at a vast starry sky with the milky way, warm distant horizon glow, awe and contemplation'],
];

for (const [name, seed, subject] of JOBS) {
  process.stdout.write(`gen ${name} (seed ${seed}) 1920x1080... `);
  try {
    await generateImage(`assets/img/${name}.png`, `${subject}. ${STYLE}`,
      { model: 'flux2-klein', width: 1920, height: 1080, seed });
    console.log('ok');
  } catch (e) { console.log('ERRO:', e.message); }
}
console.log('== done ==');
