import Phaser from 'phaser';
import './style.css';

// Phaser 4 game coordinates stay deliberately small; Scale.FIT enlarges them cleanly.
const W = 480;
const H = 270;
const WORLD_W = 3970;
const GROUND = 213;
const HOUSE_X = Array.from({ length: 15 }, (_, index) => 210 + index * 230);
const SHOP_X = 3710;
const COLORS = {
  ink: 0x21172e, night: 0x171126, sky: 0x211735, plum: 0x493253,
  cream: 0xfff1d4, gold: 0xffcc72, orange: 0xf18b45, pink: 0xf1a5aa,
  mint: 0xa5d1a5, road: 0x373042, stone: 0x595063,
};

// EDIT THESE DATA to personalize the story, house rewards, and shop balance.
const GREETING = 'The whole neighborhood is glowing tonight!';
const ENDING_MESSAGE = 'Thanks for playing this game!!! Send me an ss of this ok :D :D'; 
const CHARACTER_CHOICES = [
  { id: 'ghost', filename: 'Ghost.png', name: 'Ghost', tint: 0xdad8e8 },
  { id: 'vampire', filename: 'Vampire.png', name: 'Vampire', tint: 0x8d5477 },
  { id: 'zayn', filename: 'zayn.png', name: 'Zayn Malik', tint: 0x735b4c },
  { id: 'haaland', filename: 'Haaland.png', name: 'Haaland', tint: 0xb18d64 },
  { id: 'hogwarts-girl', filename: 'HogwartsGirl.png', name: 'Hogwarts Girl', tint: 0x5b477c },
  { id: 'steve-harrington', filename: 'SteveHarrington.png', name: 'Steve Harrington', tint: 0xb8754f },
  { id: 'spiderman', filename: 'Spiderman.png', name: 'Spiderman', tint: 0xc94949 },
];
const BASKET_CHOICES = [
  { id: 'pumpkin', filename: 'Pumpkin.png', name: 'Pumpkin' },
  { id: 'bucket', filename: 'Bucket.png', name: 'Bucket' },
  { id: 'oned-bucket', filename: '1DBucket.png', name: '1D Bucket' },
  { id: 'piskel-basket', filename: 'New Piskel (5) (1) (7).png', name: 'Basket' },
];
const PET_CHOICES = [
  { id: 'hedwig', filename: 'hedwig.png', name: 'Hedwig', glyph: 'H' },
  { id: 'snitch', filename: 'snitch.png', name: 'Golden Snitch', glyph: 'S' },
  { id: 'pigeon', filename: 'pigeon.png', name: 'Pigeon', glyph: 'P' },
  { id: 'cat', filename: 'cat.png', name: 'Cat', glyph: 'C' },
  { id: 'bat', filename: 'bat.png', name: 'Bat', glyph: 'B' },
  { id: 'dog', filename: 'dog.png', name: 'Dog', glyph: 'D' },
];
// First six retain their original outcomes; the final nine add 36 candy.
// Total from all 15 houses is 50 candy, enough for the 41-candy full shop basket.
const HOUSE_REWARDS = [3, 0, 5, 2, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const HOUSE_NAMES = [
  'Marigold Cottage', 'The Quiet House', 'Pumpkin Palace', 'An Old Aunty\'s', 'The Sleepy Bungalow',
  'Lantern Lane', 'The Blue Balcony', 'Mango Tree House', 'Very Sanskaari House', 'The Cat\'s Corner',
  'Very Cool Residence Residence', 'The Friendly Flat', 'Chai Time Home', 'Starry Veranda', 'The Last Lantern',
];
const HOUSE_GREETINGS = [
  'A little ghost peeks out from behind the marigolds.', 'A sleepy neighbor opens the door in slippers.',
  'A pumpkin mask bobs in the warm porch light.', 'An Old Aunty smiles and reaches for her bowl.',
  'A tiny voice asks, "Did you bring a good costume?"', 'A lantern swings as someone opens the door.',
  'A friendly vampire gives a polite little bow.', 'The mango tree rustles above the porch.',
  'A neighbor waves from behind a bright rangoli.', 'A cat watches from the doorstep.',
  'Someone calls, "One moment, little trick-or-treaters!"', 'A cheerful family gathers at the door.',
  'The smell of chai drifts out into the night.', 'A star lantern lights up the veranda.',
  'The last neighbor opens the door with a grin.',
];

const SHOP_ITEMS = [
  { id: 'waffle', name: 'Waffle treat', description: 'Warm, crisp and golden.', price: 12 },
  { id: 'silk', name: 'Cadbury Silk', description: 'A smooth chocolate treat.', price: 10 },
  { id: 'flower', name: 'Flower', description: 'A little gift to remember. (cool flower ok)', price: 7 },
  { id: 'song', name: 'Play a Song on the Guitar', description: 'One tiny song of choice in ur dms :D', price: 4 },
  { id: 'surprise', name: 'Personal Surprise', description: 'A mystery from the cool programmer.', price: 8 },
];

class HalloweenStreet extends Phaser.Scene {
  constructor() { super('HalloweenStreet'); }

  preload() {
    this.load.on('progress', (value) => { if (this.loadingBar) this.loadingBar.width = Math.round(64 * value); });
    this.load.on('loaderror', () => { /* Missing Piskel files use the built-in pixel placeholders. */ });
    this.add.rectangle(W / 2, H / 2, W, H, COLORS.night);
    this.add.text(W / 2, 52, 'A Very Happy Halloween!', { fontFamily: 'monospace', fontSize: '15px', color: '#fff1d4', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(W / 2, 72, 'Getting the lanterns ready...', { fontFamily: 'monospace', fontSize: '8px', color: '#c6b1ce' }).setOrigin(0.5);
    this.add.rectangle(W / 2, 89, 72, 5, 0x493253).setOrigin(0.5);
    this.loadingBar = this.add.rectangle(W / 2 - 34, 89, 2, 3, COLORS.gold).setOrigin(0, 0.5);
    this.tweens.add({ targets: this.loadingBar, width: 68, duration: 700, yoyo: true, repeat: -1 });

    // The imported character and basket art is made of individual transparent 32x32 PNGs.
    // Pets intentionally remain code placeholders until their art is ready.
    CHARACTER_CHOICES.forEach((choice) => this.load.image(`character-${choice.id}`, `/assets/characters/${encodeURIComponent(choice.filename)}`));
    BASKET_CHOICES.forEach((choice) => this.load.image(`basket-${choice.id}`, `/assets/baskets/${encodeURIComponent(choice.filename)}`));
    PET_CHOICES.filter((choice) => choice.filename).forEach((choice) => this.load.image(`pet-${choice.id}`, `/assets/pets/${encodeURIComponent(choice.filename)}`));
    HOUSE_X.forEach((_, i) => this.load.image(`house-${i + 1}`, `/assets/houses/house-${i + 1}.png`));
  }

  create() {
    this.screenObjects = [];
    this.screen = 'welcome';
    this.soundEnabled = true;
    this.music = {
      menu: new window.Audio('/assets/music/menu.mp3'),
      street: new window.Audio('/assets/music/street.mp3'),
    };
    Object.values(this.music).forEach((track) => { track.loop = true; track.volume = 0.28; track.preload = 'auto'; });
    this.musicMode = 'menu';
    this.musicArmed = false;
    this.state = { character: 0, basket: 0, pet: 0, candy: 0, visited: Array(HOUSE_X.length).fill(false), missed: Array(HOUSE_X.length).fill(false), bought: [], message: ENDING_MESSAGE };
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,A,D,SPACE,E,ENTER');
    this.drawStreetWorld();
    this.createPlayer();
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.setRoundPixels(true);
    this.showWelcome();
    this.scale.on('resize', () => this.cameras.main.setRoundPixels(true));
  }

  keep(object, fixed = false) {
    if (!object) return object;
    if (fixed) { object.setScrollFactor(0); object.setDepth(50); }
    this.screenObjects.push(object);
    return object;
  }
  clearScreen() {
    this.screenObjects.forEach((object) => {
      const node = object?.node;
      if (object?.active) object.destroy();
      // Phaser normally removes DOMElement nodes on destroy; remove any stale input explicitly too.
      if (node?.parentNode) node.parentNode.removeChild(node);
    });
    this.screenObjects = [];
  }
  label(x, y, text, size = 8, color = '#fff1d4', options = {}) {
    const { originX = 0.5, originY = 0.5, ...style } = options;
    const readableSize = size <= 9 ? size + 3 : size;
    return this.keep(this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: `${readableSize}px`, color, align: 'center', ...style }).setOrigin(originX, originY), true);
  }
  panel(x, y, width, height, color = 0x302540, alpha = 0.97) {
    const graphic = this.keep(this.add.graphics(), true);
    graphic.fillStyle(0x100d19, 0.78); graphic.fillRect(x - width / 2 + 3, y - height / 2 + 4, width, height);
    graphic.fillStyle(color, alpha); graphic.fillRect(x - width / 2, y - height / 2, width, height);
    graphic.lineStyle(1, 0xc09a77, 1); graphic.strokeRect(x - width / 2 + 0.5, y - height / 2 + 0.5, width - 1, height - 1);
    graphic.lineStyle(1, 0x725a79, 0.9); graphic.strokeRect(x - width / 2 + 3.5, y - height / 2 + 3.5, width - 7, height - 7);
    graphic.fillStyle(0xffcc72, 1);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => graphic.fillRect(x + sx * (width / 2 - 4) - 1, y + sy * (height / 2 - 4) - 1, 3, 3));
    return graphic;
  }
  button(x, y, width, text, callback, tint = COLORS.gold, height = 20) {
    const graphic = this.keep(this.add.graphics(), true);
    const paint = (color) => {
      graphic.clear(); graphic.fillStyle(0x100d19, 0.9); graphic.fillRect(x - width / 2 + 2, y - height / 2 + 3, width, height);
      graphic.fillStyle(0x241a32, 1); graphic.fillRect(x - width / 2, y - height / 2, width, height);
      graphic.fillStyle(color, 1); graphic.fillRect(x - width / 2 + 1, y - height / 2 + 1, width - 2, height - 3);
      graphic.fillStyle(0xffffff, 0.28); graphic.fillRect(x - width / 2 + 2, y - height / 2 + 2, width - 4, 2);
      graphic.fillStyle(0x563f59, 1); graphic.fillRect(x - width / 2 + 2, y + height / 2 - 3, width - 4, 1);
    };
    paint(tint);
    this.label(x, y, text, 7, '#241a32', { fontStyle: 'bold' });
    const hit = this.keep(this.add.rectangle(x, y, width, height, 0xffffff, 0).setInteractive({ useHandCursor: true }), true);
    hit.on('pointerover', () => paint(0xffe199)).on('pointerout', () => paint(tint));
    hit.on('pointerdown', () => {
      this.playSound('tap');
      if (this.screen === 'welcome' || this.screen === 'customize') { this.musicArmed = true; this.setMusic('menu'); }
      else if (this.screen === 'street') this.setMusic('street');
      callback();
    });
    return hit;
  }
  transition(callback) {
    const curtain = this.add.rectangle(W / 2, H / 2, W, H, COLORS.night, 0).setScrollFactor(0).setDepth(1000);
    this.tweens.add({ targets: curtain, alpha: 1, duration: 110, onComplete: () => {
      callback();
      this.tweens.add({ targets: curtain, alpha: 0, duration: 160, onComplete: () => curtain.destroy() });
    } });
  }

  drawStreetWorld() {
    this.add.rectangle(WORLD_W / 2, H / 2, WORLD_W, H, COLORS.sky);
    // Pixel stars and the crescent moon.
    for (let i = 0; i < 150; i++) {
      const x = (i * 149 + 17) % WORLD_W;
      const y = (i * 71 + 11) % 90;
      this.add.rectangle(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1, i % 5 === 0 ? COLORS.gold : 0xc7c0dd, 0.8);
    }
    this.add.circle(95, 46, 20, 0xffedbd);
    this.add.circle(105, 39, 18, COLORS.sky);
    // Layered distant skyline.
    for (let i = 0; i < Math.ceil(WORLD_W / 63); i++) {
      const x = i * 63;
      const height = 24 + (i * 17 % 27);
      this.add.rectangle(x + 25, 142 - height / 2, 50, height, i % 2 ? 0x302841 : 0x3a2e49);
      for (let wy = 0; wy < 2; wy++) this.add.rectangle(x + 12 + (i % 3) * 7, 133 - wy * 12, 3, 4, i % 4 ? 0x62534f : 0xf2bd68, 0.78);
    }
    this.drawMarigoldStrings();
    this.add.rectangle(WORLD_W / 2, 156, WORLD_W, 35, 0x413b48);
    this.add.rectangle(WORLD_W / 2, 184, WORLD_W, 24, COLORS.road);
    this.add.rectangle(WORLD_W / 2, 172, WORLD_W, 2, 0x514452);
    this.add.rectangle(WORLD_W / 2, 198, WORLD_W, 3, 0x85786d);
    for (let x = 20; x < WORLD_W; x += 96) this.add.rectangle(x, 184, 22, 2, 0x827469, 0.75);
    for (let x = 0; x < WORLD_W; x += 72) {
      this.add.rectangle(x + 2, 211, 66, 16, x % 144 ? 0x655c68 : 0x716776);
      this.add.rectangle(x + 2, 203, 1, 1, 0xc7a98a);
    }
    this.drawRangoli(70, 201); this.drawRangoli(WORLD_W - 130, 201);
    this.drawStreetLanterns();
    HOUSE_X.forEach((x, i) => {
      this.drawHouse(x, i);
      if (i % 3 === 1) this.drawRangoli(x + 62, 201);
      if (i < HOUSE_X.length - 1 && i % 2 === 0) this.drawStreetTree((x + HOUSE_X[i + 1]) / 2, 178);
    });
    this.drawShopStall();
  }

  drawMarigoldStrings() {
    const g = this.add.graphics();
    g.lineStyle(1, 0xc98748, 0.9);
    for (let x = 20; x < WORLD_W; x += 180) {
      g.beginPath(); g.moveTo(x, 10); g.lineTo(x + 90, 28); g.lineTo(x + 180, 10); g.strokePath();
      for (let j = 0; j < 7; j++) {
        const bx = x + j * 30, by = 12 + Math.round(Math.sin((j / 6) * Math.PI) * 16);
        this.add.rectangle(bx, by, 4, 5, j % 2 ? 0xf2a54f : 0xffd477);
        this.add.rectangle(bx, by - 4, 2, 2, 0x779259);
      }
    }
  }
  drawRangoli(x, y) {
    const colors = [0xf4a859, 0xc18bc5, 0x76b9a0, 0xffe08a];
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        this.add.rectangle(x + Math.round(Math.cos(a) * (3 + ring * 3)), y + Math.round(Math.sin(a) * (2 + ring)), 2, 2, colors[(i + ring) % colors.length]);
      }
    }
    this.add.rectangle(x, y, 2, 2, 0xffefce);
  }
  drawStreetLanterns() {
    for (let x = 120; x < WORLD_W; x += 210) {
      this.add.rectangle(x, 161, 2, 36, 0x4b3a37);
      this.add.rectangle(x, 145, 9, 12, 0xdb7a43);
      this.add.rectangle(x, 143, 5, 2, COLORS.gold);
      const glow = this.add.circle(x, 146, 10, 0xffb75c, 0.12);
      this.tweens.add({ targets: glow, alpha: 0.24, duration: 900 + (x % 7) * 70, yoyo: true, repeat: -1 });
    }
  }
  drawStreetTree(x, groundY) {
    const g = this.add.graphics();
    g.fillStyle(0x49342f, 1); g.fillRect(x - 3, groundY - 26, 6, 28);
    g.fillStyle(0x34483d, 1); g.fillRect(x - 11, groundY - 38, 22, 12);
    g.fillStyle(0x45624a, 1); g.fillRect(x - 8, groundY - 46, 16, 12);
    g.fillStyle(0x6d8050, 1); g.fillRect(x - 4, groundY - 50, 8, 6);
    g.fillStyle(0xf4bd6c, 1); g.fillRect(x - 6, groundY - 34, 2, 2); g.fillRect(x + 5, groundY - 43, 2, 2);
  }

  drawHouse(x, index) {
    const palette = [0x84675f, 0x596b7b, 0x8a6448, 0x75596f, 0x66764e, 0x79585c, 0x826b52, 0x5e6e66, 0x8a5d51, 0x655b7a, 0x796c53, 0x536975, 0x8c664f, 0x735966, 0x667453];
    const houseKey = `house-${index + 1}`;
    if (this.textures.exists(houseKey)) {
      this.add.image(x, 126, houseKey).setDisplaySize(108, 102);
    } else {
      const g = this.add.graphics();
      g.fillStyle(0x221b2d, 0.55); g.fillRect(x - 48, 173, 96, 6);
      g.fillStyle(palette[index], 1); g.fillRect(x - 42, 103, 84, 71);
      g.fillStyle(index % 2 ? 0x392a42 : 0x49313f, 1); g.fillTriangle(x - 49, 105, x, 72, x + 49, 105);
      g.fillStyle(0x332b3c, 1); g.fillRect(x - 35, 112, 16, 19); g.fillRect(x + 19, 112, 16, 19);
      g.fillStyle(0xffd080, 1); g.fillRect(x - 33, 114, 12, 15); g.fillRect(x + 21, 114, 12, 15);
      g.fillStyle(0x815e51, 1); g.fillRect(x - 28, 113, 2, 17); g.fillRect(x + 26, 113, 2, 17);
      g.fillStyle(0x34263b, 1); g.fillRect(x - 9, 132, 18, 42);
      g.fillStyle(0x6e5261, 1); g.fillRect(x - 12, 130, 24, 3);
      g.fillStyle(0xf4bf69, 1); g.fillRect(x + 4, 151, 2, 2);
      g.fillStyle(0x846f65, 1); g.fillRect(x - 49, 174, 98, 4);
      g.fillStyle(0xbaa48a, 1); g.fillRect(x - 46, 179, 92, 2);
      // A marigold toran and painted trim give each placeholder home its own color.
      g.fillStyle(0xf0a34e, 1);
      for (let flower = 0; flower < 7; flower++) g.fillRect(x - 16 + flower * 5, 126, 3, flower % 2 ? 4 : 5);
      g.fillStyle(index % 2 ? 0xc99163 : 0x9e8292, 1); g.fillRect(x - 42, 99, 84, 3);
      g.fillStyle(0x9c765f, 1); g.fillRect(x - 43, 105, 3, 69); g.fillRect(x + 40, 105, 3, 69);
      if (index % 3 === 0) { g.fillStyle(0x9a553f, 1); g.fillRect(x - 3, 137, 6, 8); }
      // Potted marigolds beside each porch.
      g.fillStyle(0xa85543, 1); g.fillRect(x - 44, 168, 10, 7); g.fillRect(x + 34, 168, 10, 7);
      g.fillStyle(0xf3a64e, 1); g.fillRect(x - 43, 164, 8, 5); g.fillRect(x + 35, 164, 8, 5);
    }
    const door = this.add.rectangle(x, 153, 18, 40, 0x553d4c).setOrigin(0.5, 0.5);
    door.setData('closedScale', 1);
    this.add.rectangle(x, 174, 98, 4, 0x715c68);
    this.add.text(x, 91, `${index + 1}`, { fontFamily: 'monospace', fontSize: '10px', color: '#ffe2a3', backgroundColor: '#362943', padding: { x: 4, y: 3 } }).setOrigin(0.5);
    for (let p = 0; p < 2; p++) this.drawPumpkin(x - 36 + p * 72, 186, 0.9);
    this.houseDoors ??= [];
    this.houseDoors[index] = door;
  }
  drawPumpkin(x, y, scale = 1) {
    const g = this.add.graphics();
    g.fillStyle(0xe77c3d, 1); g.fillRect(x - 5 * scale, y - 4 * scale, 10 * scale, 8 * scale);
    g.fillStyle(0xf39a4e, 1); g.fillRect(x - 2 * scale, y - 4 * scale, 3 * scale, 8 * scale);
    g.fillStyle(0x81925b, 1); g.fillRect(x - scale, y - 6 * scale, 2 * scale, 2 * scale);
    g.fillStyle(0x3d2a3b, 1); g.fillRect(x - 2 * scale, y - scale, scale, scale); g.fillRect(x + scale, y - scale, scale, scale);
  }
  drawShopStall() {
    const x = SHOP_X;
    const g = this.add.graphics();
    g.fillStyle(0x674859, 1); g.fillRect(x - 35, 133, 70, 42);
    g.fillStyle(0xf0a354, 1); g.fillRect(x - 40, 126, 80, 10);
    g.fillStyle(0x5a3a55, 1); g.fillTriangle(x - 44, 126, x, 100, x + 44, 126);
    for (let i = 0; i < 5; i++) g.fillStyle(i % 2 ? 0xffe0a0 : 0xcf6258, 1).fillRect(x - 37 + i * 15, 127, 8, 8);
    this.add.text(x, 146, 'SWEET', { fontFamily: 'monospace', fontSize: '8px', color: '#fff1d4', fontStyle: 'bold' }).setOrigin(0.5);
    this.drawRangoli(x, 199);
  }

  createPlayer() {
    this.playerX = 54;
    this.playerY = GROUND - 34;
    this.player = this.add.container(this.playerX, this.playerY);
    this.player.setDepth(20);
    this.playerVisual = null;
    this.petVisual = null;
    this.basketVisual = null;
    this.buildPlayerVisual();
    this.cameras.main.startFollow(this.player, false, 1, 0.08);
  }
  destroyPlayerParts() {
    [this.playerVisual, this.petVisual, this.basketVisual].forEach((part) => { if (part?.active) part.destroy(); });
    this.playerVisual = this.petVisual = this.basketVisual = null;
  }
  petDimensions(pet, preview = false) {
    if (pet.id === 'bat') return preview ? [50, 34] : [46, 31];
    return preview ? [44, 44] : [42, 42];
  }
  buildPlayerVisual(preview = false, centerX = 240, centerY = 122) {
    if (preview) {
      const holder = this.keep(this.add.container(centerX, centerY), true);
      const choice = CHARACTER_CHOICES[this.state.character];
      const key = `character-${choice.id}`;
      if (this.textures.exists(key)) holder.add(this.add.image(0, 0, key).setDisplaySize(68, 68));
      else holder.add(this.makeCharacterPlaceholder(choice, 0, 0, 1.95));
      const basket = BASKET_CHOICES[this.state.basket];
      const basketImage = this.textures.exists(`basket-${basket.id}`) ? this.add.image(24, 23, `basket-${basket.id}`).setDisplaySize(34, 34) : null;
      holder.add(basketImage || this.makeBasketPlaceholder(basket, 24, 23, 1.65));
      const pet = PET_CHOICES[this.state.pet];
      const petGrounded = pet.id === 'cat' || pet.id === 'dog';
      const [petWidth, petHeight] = this.petDimensions(pet, true);
      const petX = petGrounded ? -43 : -37;
      const petY = petGrounded ? 34 : -28;
      const petImage = this.textures.exists(`pet-${pet.id}`) ? this.add.image(petX, petY, `pet-${pet.id}`).setDisplaySize(petWidth, petHeight) : null;
      holder.add(petImage || this.makePetPlaceholder(pet, petX, petY, 1.9));
      return holder;
    }
    this.destroyPlayerParts();
    const choice = CHARACTER_CHOICES[this.state.character];
    const key = `character-${choice.id}`;
    if (this.textures.exists(key)) {
      const sprite = this.add.image(0, 0, key).setDisplaySize(68, 68);
      this.player.add(sprite); this.playerVisual = sprite;
    } else {
      this.playerVisual = this.makeCharacterPlaceholder(choice, 0, 0, 1.55);
      this.player.add(this.playerVisual);
    }
    const pet = PET_CHOICES[this.state.pet];
    this.petUsesImage = this.textures.exists(`pet-${pet.id}`);
    this.petGrounded = pet.id === 'cat' || pet.id === 'dog';
    const [petWidth, petHeight] = this.petDimensions(pet);
    const petX = this.petGrounded ? -43 : -35;
    const petY = this.petGrounded ? 12 : -37;
    if (this.petUsesImage) this.petVisual = this.add.image(petX, petY, `pet-${pet.id}`).setDisplaySize(petWidth, petHeight);
    else this.petVisual = this.makePetPlaceholder(pet, this.petGrounded ? -43 : -35, this.petGrounded ? 22 : -30, this.petGrounded ? 2.1 : 1.9);
    this.player.add(this.petVisual);
    const basket = BASKET_CHOICES[this.state.basket];
    if (this.textures.exists(`basket-${basket.id}`)) this.basketVisual = this.add.image(24, 12, `basket-${basket.id}`).setDisplaySize(34, 34);
    else this.basketVisual = this.makeBasketPlaceholder(basket, 24, 12, 1.65);
    this.player.add(this.basketVisual);
  }
  makeCharacterPlaceholder(choice, x, y, scale = 1) {
    const g = this.add.graphics();
    const skin = choice.id === 'ghost' ? 0xdad8e8 : choice.id === 'vampire' ? 0xe3c6bb : 0xc98c63;
    g.fillStyle(0x20182b, 0.6); g.fillRect(x - 11 * scale, y + 19 * scale, 22 * scale, 3 * scale);
    g.fillStyle(choice.tint, 1); g.fillRect(x - 8 * scale, y - 2 * scale, 16 * scale, 18 * scale);
    g.fillStyle(skin, 1); g.fillRect(x - 6 * scale, y - 13 * scale, 12 * scale, 12 * scale);
    g.fillStyle(0x21172e, 1); g.fillRect(x - 4 * scale, y - 8 * scale, 2 * scale, 2 * scale); g.fillRect(x + 2 * scale, y - 8 * scale, 2 * scale, 2 * scale);
    g.fillStyle(choice.id === 'ghost' ? 0xf1eff8 : choice.id === 'vampire' ? 0x33243f : choice.tint, 1);
    g.fillRect(x - 7 * scale, y - 17 * scale, 14 * scale, 4 * scale);
    if (choice.id === 'vampire') { g.fillStyle(0xece4dc, 1); g.fillTriangle(x - 6 * scale, y - 13 * scale, x - 2 * scale, y - 13 * scale, x - 4 * scale, y - 10 * scale); g.fillTriangle(x + 2 * scale, y - 13 * scale, x + 6 * scale, y - 13 * scale, x + 4 * scale, y - 10 * scale); }
    g.fillStyle(0x493253, 1); g.fillRect(x - 7 * scale, y + 16 * scale, 5 * scale, 5 * scale); g.fillRect(x + 2 * scale, y + 16 * scale, 5 * scale, 5 * scale);
    return g;
  }
  makeBasketPlaceholder(choice, x, y, scale = 1) {
    const g = this.add.graphics();
    const colors = { pumpkin: 0xf18742, bucket: 0x7094a0, 'oned-bucket': 0x9365ad, 'piskel-basket': 0xa35a43 };
    g.lineStyle(Math.max(1, scale), 0xffdda0, 1); g.strokeRect(x - 4 * scale, y - 5 * scale, 8 * scale, 5 * scale);
    g.fillStyle(colors[choice.id], 1); g.fillRect(x - 5 * scale, y - 2 * scale, 10 * scale, 7 * scale);
    if (choice.id === 'pumpkin') { g.fillStyle(0x5b443e, 1); g.fillRect(x - scale, y, 2 * scale, 2 * scale); }
    if (choice.id === 'oned-bucket') { g.fillStyle(0xffffff, 1); g.fillRect(x - 2 * scale, y, 4 * scale, scale); }
    return g;
  }
  makePetPlaceholder(choice, x, y, scale = 1) {
    const g = this.add.graphics();
    const colors = { hedwig: 0xe7e0d1, snitch: 0xe7bd56, pigeon: 0x8a96a4, cat: 0x43344f, bat: 0x37263f, dog: 0xb77950 };
    g.fillStyle(colors[choice.id], 1); g.fillRect(x - 5 * scale, y - 4 * scale, 10 * scale, 8 * scale);
    g.fillRect(x - 7 * scale, y - 2 * scale, 3 * scale, 4 * scale); g.fillRect(x + 4 * scale, y - 2 * scale, 3 * scale, 4 * scale);
    g.fillStyle(0xffe7a3, 1); g.fillRect(x - scale, y - scale, Math.max(1, scale), Math.max(1, scale));
    return g;
  }

  showWelcome() {
    this.screen = 'welcome'; this.clearScreen();
    if (this.musicArmed) this.setMusic('menu');
    this.panel(240, 98, 286, 126, 0x21172e, 0.94);
    this.label(240, 57, 'A Very', 9, '#ffcc72', { letterSpacing: 2 });
    this.label(240, 76, 'Happy Halloween!', 22, '#fff1d4', { fontStyle: 'bold', stroke: '#493253', strokeThickness: 2 });
    this.label(240, 107, GREETING, 7, '#d7c8df');
    this.label(240, 120, 'A street with gifts at the end btw 👀👀', 7, '#bfaecb');
    this.label(254, 140, '15 Houses, most of em will give chocolates ok :D', 5, '#ffcf8c');
    if (this.textures.exists('character-ghost')) this.keep(this.add.image(119, 153, 'character-ghost').setDisplaySize(32, 32), true);
    if (this.textures.exists('basket-pumpkin')) this.keep(this.add.image(139, 165, 'basket-pumpkin').setDisplaySize(15, 15), true);
    this.button(240, 158, 112, 'PLAY', () => this.transition(() => this.showCustomization()), COLORS.gold, 24);
    this.button(240, 190, 112, `SOUND: ${this.soundEnabled ? 'ON' : 'OFF'}`, () => {
      this.soundEnabled = !this.soundEnabled;
      if (this.soundEnabled) this.playSound('tap');
      this.showWelcome();
    }, 0x9dc5a1, 20);
    this.label(240, 224, 'ARROWS / A D TO WALK  -  E / SPACE TO KNOCK', 6, '#b6a6c0');
  }

  showCustomization() {
    this.screen = 'customize'; this.clearScreen();
    if (this.musicArmed) this.setMusic('menu');
    this.panel(240, 135, 446, 246, 0x21172e, 0.97);
    this.label(240, 27, 'Dress up for this spooky evening!!', 11, '#ffcc72', { fontStyle: 'bold' });
    this.label(120, 61, 'Your SUPER PEAK FIT', 6, '#c3b4cd');
    this.buildPlayerVisual(true, 120, 111);
    const char = CHARACTER_CHOICES[this.state.character];
    const selectRow = (category, name, y, advance) => {
      this.label(338, y - 15, category, 6, '#c3b4cd');
      this.label(338, y + 2, name, 7, '#fff1d4');
      this.button(246, y + 2, 30, '<', () => { advance(-1); this.showCustomization(); }, 0x9a7aa3, 20);
      this.button(430, y + 2, 30, '>', () => { advance(1); this.showCustomization(); }, 0x9a7aa3, 20);
    };
    selectRow('CHARACTER', char.name, 67, (step) => { this.state.character = (this.state.character + step + CHARACTER_CHOICES.length) % CHARACTER_CHOICES.length; });
    selectRow('BASKET', BASKET_CHOICES[this.state.basket].name, 119, (step) => { this.state.basket = (this.state.basket + step + BASKET_CHOICES.length) % BASKET_CHOICES.length; });
    selectRow('PET', PET_CHOICES[this.state.pet].name, 171, (step) => { this.state.pet = (this.state.pet + step + PET_CHOICES.length) % PET_CHOICES.length; });
    this.button(338, 220, 154, 'READY - LET\'S GO!', () => { this.musicArmed = true; this.setMusic('street'); this.transition(() => this.startStreet()); }, COLORS.gold, 24);
    this.label(240, 248, 'Choose a companion to walk beside you or float nearby.', 6, '#c3b4cd');
    this.tweens.add({ targets: this.screenObjects.filter((o) => o.type === 'Container'), y: '-=2', duration: 420, yoyo: true, repeat: -1 });
  }

  startStreet() {
    this.clearScreen(); this.screen = 'street';
    this.setMusic('street');
    this.player.setActive(true).setVisible(true);
    this.playerX = 54; this.player.setPosition(this.playerX, this.playerY);
    this.state.candy = 0; this.state.visited = Array(HOUSE_X.length).fill(false); this.state.missed = Array(HOUSE_X.length).fill(false); this.state.bought = [];
    this.buildPlayerVisual();
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.startFollow(this.player, false, 1, 0.08);
    this.makeStreetHud();
  }
  makeStreetHud() {
    const hud = this.keep(this.add.graphics(), true);
    hud.fillStyle(0x171126, 0.98); hud.fillRect(0, 0, W, 23);
    hud.fillStyle(0x5a435f, 1); hud.fillRect(0, 22, W, 1);
    hud.fillStyle(0x302540, 1); hud.fillRect(7, 4, 98, 15); hud.fillRect(184, 4, 112, 15);
    hud.lineStyle(1, 0x80647e, 1); hud.strokeRect(7.5, 4.5, 97, 14); hud.strokeRect(184.5, 4.5, 111, 14);
    this.counterText = this.label(56, 11, 'CANDY  0', 7, '#ffdc8e');
    this.progressText = this.label(240, 11, `HOUSES  0 / ${HOUSE_X.length}`, 7, '#fff1d4');
    this.promptText = this.label(240, 38, 'Walk to the first glowing porch.', 7, '#fff1d4', { backgroundColor: '#2d2138', padding: { x: 5, y: 3 }, wordWrap: { width: 440 } });
    this.button(389, 249, 46, '<', () => {}, 0x9d8bb0, 32)
      .on('pointerdown', () => { this.moveLeftTouch = true; }).on('pointerup', () => { this.moveLeftTouch = false; }).on('pointerout', () => { this.moveLeftTouch = false; });
    this.button(441, 249, 46, '>', () => {}, 0x9d8bb0, 32)
      .on('pointerdown', () => { this.moveRightTouch = true; }).on('pointerup', () => { this.moveRightTouch = false; }).on('pointerout', () => { this.moveRightTouch = false; });
    this.button(328, 249, 74, 'KNOCK', () => this.interact(), COLORS.gold, 32);
  }

  nearbyHouse() {
    let closest = -1, distance = Infinity;
    HOUSE_X.forEach((x, i) => { const d = Math.abs(x - this.playerX); if (d < distance) { distance = d; closest = i; } });
    return distance <= 55 ? closest : -1;
  }
  update(_time, delta) {
    if (this.screen !== 'street' || !this.player?.active) return;
    if (this.interactionBusy) {
      Phaser.Input.Keyboard.JustDown(this.keys.E);
      if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.advanceHouseDialogue();
      return;
    }
    const left = this.keys.LEFT.isDown || this.keys.A.isDown || this.moveLeftTouch;
    const right = this.keys.RIGHT.isDown || this.keys.D.isDown || this.moveRightTouch;
    const direction = (right ? 1 : 0) - (left ? 1 : 0);
    this.playerX = Phaser.Math.Clamp(this.playerX + direction * 68 * (delta / 1000), 16, WORLD_W - 20);
    this.player.x = this.playerX;
    this.player.y = this.playerY + (direction ? Math.sin(_time / 65) * 1.5 : 0);
    if (this.petVisual && !this.petGrounded) this.petVisual.y = (this.petUsesImage ? -37 : 0) + Math.sin(_time / 190) * 2;

    const house = this.nearbyHouse();
    HOUSE_X.forEach((houseX, index) => {
      if (this.playerX > houseX + 55 && !this.state.visited[index]) this.state.missed[index] = true;
    });
    const missedHouse = this.state.missed.findIndex((missed, index) => missed && !this.state.visited[index]);
    if (missedHouse >= 0) {
      this.promptText.setText(`MISSED HOUSE #${missedHouse + 1} - GO BACK!`);
    } else if (house >= 0) {
      this.promptText.setText(this.state.visited[house] ? `${HOUSE_NAMES[house]} - already visited` : `${HOUSE_NAMES[house]}  |  E / SPACE TO KNOCK`);
    } else if (this.state.visited.every(Boolean) && Math.abs(SHOP_X - this.playerX) < 72) {
      this.promptText.setText('SWEET SHOP  |  E / SPACE TO SHOP');
    } else if (this.state.visited.every(Boolean) && this.playerX > SHOP_X - 150) {
      this.promptText.setText(`All ${HOUSE_X.length} porches visited! Walk right to the sweet shop.`);
    } else this.promptText.setText('Walk along the street and visit each glowing house.');
    this.counterText.setText(`CANDY  ${this.state.candy}`);
    this.progressText.setText(`HOUSES  ${this.state.visited.filter(Boolean).length} / ${HOUSE_X.length}`);

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.interact();
  }
  interact() {
    if (this.screen !== 'street') return;
    const house = this.nearbyHouse();
    const missedHouse = this.state.missed.findIndex((missed, index) => missed && !this.state.visited[index]);
    if (missedHouse >= 0 && house !== missedHouse) return;
    if (house >= 0) { this.visitHouse(house); return; }
    if (this.state.visited.every(Boolean) && Math.abs(SHOP_X - this.playerX) < 72) this.transition(() => this.showShop());
  }
  visitHouse(index) {
    if (this.interactionBusy || this.state.visited[index]) return;
    this.interactionBusy = true;
    const door = this.houseDoors[index];
    this.playSound('knock');
    this.tweens.add({ targets: door, scaleX: 0.2, duration: 220 });
    this.dialogueIndex = index;
    this.dialoguePart = 0;
    this.showHouseDialogue(index, 0);
  }
  showHouseDialogue(index, part) {
    this.clearHouseDialogue();
    const reward = HOUSE_REWARDS[index];
    const speaker = HOUSE_NAMES[index].toUpperCase();
    const line = part === 0
      ? HOUSE_GREETINGS[index]
      : reward > 0 ? `Of course! Please take ${reward} candies!` : 'Oh dear, we ran out of candy. Happy Halloween!';
    const box = this.keep(this.add.graphics(), true);
    box.setDepth(55); box.fillStyle(0x21172e, 0.98); box.fillRect(54, 42, 372, 47); box.lineStyle(1, 0xffcc72, 1); box.strokeRect(54, 42, 372, 47);
    const speakerLabel = this.label(240, 51, `${part + 1} / 2  -  ${speaker}`, 6, '#ffcc72', { fontStyle: 'bold' }); speakerLabel.setDepth(56);
    const dialogue = this.label(240, 69, line, 7, '#fff1d4', { wordWrap: { width: 346 } }); dialogue.setDepth(56);
    const hint = this.label(240, 84, 'SPACE / CLICK TO CONTINUE', 5, '#c3b5cc'); hint.setDepth(56);
    const hit = this.keep(this.add.rectangle(240, 66, 372, 47, 0xffffff, 0).setInteractive({ useHandCursor: true }), true);
    hit.setDepth(57).on('pointerdown', () => { this.playSound('tap'); this.advanceHouseDialogue(); });
    this.dialogueObjects = [box, speakerLabel, dialogue, hint, hit];
    this.dialogueText = dialogue;
    this.dialogueLine = line;
    this.dialogueTypedCount = 0;
    this.dialogueReady = line.length === 0;
    this.dialogueTypingTimer = this.time.addEvent({
      delay: 32,
      repeat: Math.max(0, line.length - 1),
      callback: () => {
        this.dialogueTypedCount++;
        this.dialogueText.setText(line.slice(0, this.dialogueTypedCount));
        this.playSound('beep');
        if (this.dialogueTypedCount >= line.length) this.dialogueReady = true;
      },
    });
  }
  advanceHouseDialogue() {
    if (!this.interactionBusy) return;
    if (!this.dialogueReady) {
      this.dialogueTypingTimer?.remove(false);
      this.dialogueText?.setText(this.dialogueLine);
      this.dialogueReady = true;
      return;
    }
    if (this.dialoguePart === 0) {
      this.dialoguePart = 1;
      this.playSound('tap');
      this.showHouseDialogue(this.dialogueIndex, 1);
    } else this.finishHouseVisit(this.dialogueIndex);
  }
  clearHouseDialogue() {
    this.dialogueTypingTimer?.remove(false);
    this.dialogueTypingTimer = null;
    this.dialogueObjects?.forEach((object) => { if (object?.active) object.destroy(); });
    this.dialogueObjects = [];
  }
  finishHouseVisit(index) {
    if (this.screen !== 'street') return;
    this.clearHouseDialogue();
    this.state.visited[index] = true;
    this.state.missed[index] = false;
    const reward = HOUSE_REWARDS[index];
    const door = this.houseDoors[index];
    this.tweens.add({ targets: door, scaleX: 1, duration: 220 });
    if (reward > 0) {
      this.state.candy += reward;
      this.playSound('candy');
      const candy = this.add.rectangle(HOUSE_X[index], 152, 5, 5, COLORS.gold);
      this.tweens.add({ targets: candy, y: 119, alpha: 0, duration: 620, onComplete: () => candy.destroy() });
    } else this.playSound('empty');
    this.interactionBusy = false;
    const text = reward > 0 ? `+${reward} CANDY!` : 'NO CANDY THIS TIME - HAPPY HALLOWEEN!';
    const toast = this.add.text(W / 2, 44, text, { fontFamily: 'monospace', fontSize: reward ? '10px' : '7px', color: reward ? '#ffdc8e' : '#fff1d4', backgroundColor: '#302540', padding: { x: 5, y: 4 }, fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
    this.tweens.add({ targets: toast, y: 36, alpha: 0, delay: 1000, duration: 450, onComplete: () => toast.destroy() });
    this.time.delayedCall(1200, () => { if (this.screen === 'street') this.promptText.setText(index === HOUSE_X.length - 1 ? 'All 15 porches done! Walk right to the sweet shop.' : 'Keep wandering to the next glowing house.'); });
  }

  showShop() {
    this.screen = 'shop'; this.clearScreen();
    if (this.musicArmed) this.setMusic('menu');
    this.panel(240, 137, 454, 252, 0x21172e, 0.98);
    this.label(240, 20, 'THE MOONLIGHT TREAT SHOP', 11, '#ffcc72', { fontStyle: 'bold' });
    this.label(240, 36, `You collected ${this.state.candy} candy`, 7, '#fff1d4');
    this.shopCandy = this.label(416, 36, `${this.state.candy}c`, 8, '#ffdc8e', { fontStyle: 'bold' });
    SHOP_ITEMS.forEach((item, index) => {
      const y = 61 + index * 32;
      const card = this.keep(this.add.graphics(), true); card.fillStyle(index % 2 ? 0x392b47 : 0x302540, 1); card.fillRect(33, y - 10, 414, 28); card.lineStyle(1, 0x56435d, 1); card.strokeRect(33, y - 10, 414, 28);
      const icon = this.makeShopIcon(item.id, 48, y + 3); this.keep(icon, true);
      this.label(151, y - 3, item.name, 7, '#fff1d4', { align: 'left', originX: 0 });
      this.label(151, y + 7, item.description, 5, '#c3b5cc', { align: 'left', originX: 0 });
      this.label(314, y + 1, `${item.price}c`, 7, '#ffdc8e');
      const bought = this.state.bought.includes(item.id);
      this.button(393, y + 2, 74, bought ? 'SAVED!' : `BUY ${item.price}c`, () => this.buyItem(item), bought ? COLORS.mint : COLORS.gold, 18);
    });
    this.label(240, 231, 'Choose any treats you can afford - one of each.', 6, '#c3b5cc');
    this.button(240, 251, 132, 'DONE SHOPPING', () => this.transition(() => this.showEnding()), COLORS.mint, 22);
  }
  makeShopIcon(id, x, y) {
    const g = this.add.graphics();
    if (id === 'waffle') { g.fillStyle(0xc78b43, 1); g.fillRect(x - 6, y - 5, 12, 10); g.lineStyle(1, 0xf6d18a, 1); for (let i = -3; i <= 3; i += 3) { g.lineBetween(x + i, y - 4, x + i, y + 4); g.lineBetween(x - 5, y + i, x + 5, y + i); } }
    if (id === 'silk') { g.fillStyle(0x803548, 1); g.fillRect(x - 4, y - 6, 8, 12); g.fillStyle(0xffd88e, 1); g.fillRect(x - 3, y - 3, 6, 3); }
    if (id === 'flower') { g.fillStyle(0x568a55, 1); g.fillRect(x, y - 1, 2, 9); g.fillStyle(0xe6829d, 1); g.fillRect(x - 3, y - 5, 8, 6); g.fillStyle(0xffdf7d, 1); g.fillRect(x, y - 3, 2, 2); }
    if (id === 'song') { g.fillStyle(0xb47a4c, 1); g.fillRect(x - 4, y - 5, 8, 10); g.fillStyle(0xffe5b5, 1); g.fillRect(x - 1, y - 4, 2, 8); }
    if (id === 'surprise') { g.fillStyle(0x8f67a7, 1); g.fillRect(x - 5, y - 4, 10, 9); g.fillStyle(0xffd678, 1); g.fillRect(x - 1, y - 5, 2, 11); g.fillRect(x - 5, y - 1, 10, 2); }
    return g;
  }
  buyItem(item) {
    if (this.state.bought.includes(item.id)) return;
    if (this.state.candy < item.price) { this.playSound('empty'); this.label(240, 225, `Need ${item.price - this.state.candy} more candy for ${item.name}.`, 6, '#f1a5aa'); return; }
    this.state.candy -= item.price; this.state.bought.push(item.id); this.playSound('buy'); this.showShop();
  }

  showEnding() {
    this.screen = 'ending'; this.clearScreen();
    if (this.musicArmed) this.setMusic('menu');
    this.panel(240, 120, 420, 200, 0x21172e, 0.98);
    this.label(240, 31, 'A SWEET END TO A SPOOKY NIGHT', 10, '#ffcc72', { fontStyle: 'bold' });
    const names = SHOP_ITEMS.filter((item) => this.state.bought.includes(item.id)).map((item) => item.name);
    this.label(240, 65, names.length ? `THANK YOU FOR: ${names.join(', ')}` : 'THANK YOU FOR VISITING OUR STREET!', 6, '#fff1d4', { wordWrap: { width: 390 } });
    this.label(240, 88, `${this.state.visited.filter(Boolean).length} houses  |  ${this.state.candy} candy left`, 7, '#ffdc8e');
    this.label(240, 112, 'Write a message for the neighbors:', 6, '#c3b5cc');
    const input = this.add.dom(W / 2, 143).createFromHTML(`<input aria-label="Personal ending message" maxlength="90" value="${this.escapeHtml(this.state.message)}" />`).setOrigin(0.5);
    input.setSize(464, 24); this.keep(input, true);
    this.personalMessageInput = input;
    this.panel(240, 177, 464, 28, 0x302540, 1);
    const messagePreview = this.label(240, 177, this.state.message || ENDING_MESSAGE, 5, '#fff1d4', { wordWrap: { width: 444 } });
    this.button(240, 207, 134, 'PLAY AGAIN', () => {
      const field = this.personalMessageInput?.getChildByName?.('message');
      this.state.message = field?.value || this.personalMessageInput?.node?.querySelector('input')?.value || this.state.message;
      this.transition(() => { this.screen = 'welcome'; this.showWelcome(); });
    }, COLORS.gold, 22);
    this.label(240, 235, 'Your selected message is saved for the next ending.', 6, '#c3b5cc');
    const field = input.node?.querySelector('input');
    if (field) {
      field.name = 'message'; field.value = this.state.message;
      field.addEventListener('input', () => { this.state.message = field.value; messagePreview.setText(field.value || ENDING_MESSAGE); });
    }
  }
  escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }

  playSound(kind) {
    if (!this.soundEnabled) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      this.audio ??= new Audio();
      if (this.audio.state === 'suspended') this.audio.resume();
      const ctx = this.audio;
      const notes = kind === 'knock' ? [140, 110, 140] : kind === 'candy' || kind === 'buy' ? [520, 680, 840] : kind === 'empty' ? [310, 230] : kind === 'beep' ? [760] : [470];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        const at = ctx.currentTime + i * (kind === 'knock' ? 0.12 : 0.07);
        osc.type = kind === 'knock' ? 'triangle' : 'square'; osc.frequency.setValueAtTime(kind === 'beep' ? freq + Math.random() * 90 : freq, at);
        gain.gain.setValueAtTime(kind === 'knock' ? 0.09 : kind === 'beep' ? 0.016 : 0.035, at); gain.gain.exponentialRampToValueAtTime(0.001, at + (kind === 'beep' ? 0.025 : 0.11));
        osc.connect(gain); gain.connect(ctx.destination); osc.start(at); osc.stop(at + (kind === 'beep' ? 0.03 : 0.12));
      });
    } catch { /* Browser audio may be unavailable; controls still work. */ }
  }
  setMusic(mode) {
    this.musicMode = mode === 'street' ? 'street' : 'menu';
    if (!this.music) return;
    const next = this.music[this.musicMode];
    Object.values(this.music).forEach((track) => { if (track !== next || !this.soundEnabled) track.pause(); });
    if (!this.soundEnabled) return;
    if (next.paused) next.play().catch(() => { /* Browsers may wait for a user gesture before playing audio. */ });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#171126',
  pixelArt: true,
  roundPixels: true,
  dom: { createContainer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  render: { antialias: false, pixelArt: true, roundPixels: true },
  scene: [HalloweenStreet],
});
