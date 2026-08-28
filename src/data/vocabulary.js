/**
 * Starter set: 30 everyday objects the child already knows by sight.
 * Same concepts in English, Spanish, Mandarin, Japanese.
 * Emoji illustrations keep the app offline-friendly on old iPads.
 */
export const LANGUAGES = [
  { id: "en", label: "English", flag: "🇬🇧", voiceHints: ["en-US", "en-GB", "en"] },
  { id: "es", label: "Spanish", flag: "🇪🇸", voiceHints: ["es-ES", "es-MX", "es"] },
  { id: "zh", label: "Mandarin", flag: "🇨🇳", voiceHints: ["zh-CN", "zh-TW", "zh"] },
  { id: "ja", label: "Japanese", flag: "🇯🇵", voiceHints: ["ja-JP", "ja"] },
];

export const OBJECTS = [
  { id: "apple", emoji: "🍎", color: "#E85D4C", words: { en: "apple", es: "manzana", zh: "píngguǒ", ja: "ringo" }, accept: { en: ["apple"], es: ["manzana"], zh: ["pingguo", "píngguǒ", "ping guo"], ja: ["ringo"] } },
  { id: "banana", emoji: "🍌", color: "#E8B84A", words: { en: "banana", es: "plátano", zh: "xiāngjiāo", ja: "banana" }, accept: { en: ["banana"], es: ["platano", "plátano", "banana"], zh: ["xiangjiao", "xiāngjiāo"], ja: ["banana"] } },
  { id: "water", emoji: "💧", color: "#5BA4D9", words: { en: "water", es: "agua", zh: "shuǐ", ja: "mizu" }, accept: { en: ["water"], es: ["agua"], zh: ["shui", "shuǐ"], ja: ["mizu"] } },
  { id: "milk", emoji: "🥛", color: "#E8E4DC", words: { en: "milk", es: "leche", zh: "niúnǎi", ja: "gyūnyū" }, accept: { en: ["milk"], es: ["leche"], zh: ["niunai", "niúnǎi"], ja: ["gyunyu", "gyūnyū", "miruku"] } },
  { id: "bread", emoji: "🍞", color: "#D4A574", words: { en: "bread", es: "pan", zh: "miànbāo", ja: "pan" }, accept: { en: ["bread"], es: ["pan"], zh: ["mianbao", "miànbāo"], ja: ["pan"] } },
  { id: "cup", emoji: "🥤", color: "#6BBF8A", words: { en: "cup", es: "vaso", zh: "bēizi", ja: "koppu" }, accept: { en: ["cup"], es: ["vaso"], zh: ["beizi", "bēizi"], ja: ["koppu", "kappu"] } },
  { id: "spoon", emoji: "🥄", color: "#A8B5C4", words: { en: "spoon", es: "cuchara", zh: "sháozi", ja: "supun" }, accept: { en: ["spoon"], es: ["cuchara"], zh: ["shaozi", "sháozi"], ja: ["supun", "supūn"] } },
  { id: "shoe", emoji: "👟", color: "#4A90C8", words: { en: "shoe", es: "zapato", zh: "xiézi", ja: "kutsu" }, accept: { en: ["shoe", "shoes"], es: ["zapato", "zapatos"], zh: ["xiezi", "xiézi"], ja: ["kutsu"] } },
  { id: "sock", emoji: "🧦", color: "#E07A5F", words: { en: "sock", es: "calcetín", zh: "wàzi", ja: "kutsushita" }, accept: { en: ["sock", "socks"], es: ["calcetin", "calcetín"], zh: ["wazi", "wàzi"], ja: ["kutsushita"] } },
  { id: "hat", emoji: "🎩", color: "#3D3D3D", words: { en: "hat", es: "sombrero", zh: "màozi", ja: "bōshi" }, accept: { en: ["hat"], es: ["sombrero"], zh: ["maozi", "màozi"], ja: ["boshi", "bōshi"] } },
  { id: "door", emoji: "🚪", color: "#8B6914", words: { en: "door", es: "puerta", zh: "mén", ja: "doa" }, accept: { en: ["door"], es: ["puerta"], zh: ["men", "mén"], ja: ["doa", "door"] } },
  { id: "window", emoji: "🪟", color: "#7EB8DA", words: { en: "window", es: "ventana", zh: "chuānghu", ja: "mado" }, accept: { en: ["window"], es: ["ventana"], zh: ["chuanghu", "chuānghu"], ja: ["mado"] } },
  { id: "bed", emoji: "🛏️", color: "#9B8EC4", words: { en: "bed", es: "cama", zh: "chuáng", ja: "beddo" }, accept: { en: ["bed"], es: ["cama"], zh: ["chuang", "chuáng"], ja: ["beddo", "bed"] } },
  { id: "chair", emoji: "🪑", color: "#C4A484", words: { en: "chair", es: "silla", zh: "yǐzi", ja: "isu" }, accept: { en: ["chair"], es: ["silla"], zh: ["yizi", "yǐzi"], ja: ["isu"] } },
  { id: "ball", emoji: "⚽", color: "#2D6A4F", words: { en: "ball", es: "pelota", zh: "qiú", ja: "bōru" }, accept: { en: ["ball"], es: ["pelota", "balon", "balón"], zh: ["qiu", "qiú"], ja: ["boru", "bōru"] } },
  { id: "book", emoji: "📕", color: "#C1121F", words: { en: "book", es: "libro", zh: "shū", ja: "hon" }, accept: { en: ["book"], es: ["libro"], zh: ["shu", "shū"], ja: ["hon"] } },
  { id: "dog", emoji: "🐶", color: "#B08968", words: { en: "dog", es: "perro", zh: "gǒu", ja: "inu" }, accept: { en: ["dog"], es: ["perro"], zh: ["gou", "gǒu"], ja: ["inu"] } },
  { id: "cat", emoji: "🐱", color: "#F4A261", words: { en: "cat", es: "gato", zh: "māo", ja: "neko" }, accept: { en: ["cat"], es: ["gato"], zh: ["mao", "māo"], ja: ["neko"] } },
  { id: "bird", emoji: "🐦", color: "#48A9A6", words: { en: "bird", es: "pájaro", zh: "niǎo", ja: "tori" }, accept: { en: ["bird"], es: ["pajaro", "pájaro"], zh: ["niao", "niǎo"], ja: ["tori"] } },
  { id: "fish", emoji: "🐟", color: "#457B9D", words: { en: "fish", es: "pez", zh: "yú", ja: "sakana" }, accept: { en: ["fish"], es: ["pez", "pescado"], zh: ["yu", "yú"], ja: ["sakana"] } },
  { id: "sun", emoji: "☀️", color: "#F4D35E", words: { en: "sun", es: "sol", zh: "tàiyáng", ja: "taiyō" }, accept: { en: ["sun"], es: ["sol"], zh: ["taiyang", "tàiyáng"], ja: ["taiyo", "taiyō"] } },
  { id: "moon", emoji: "🌙", color: "#7B8CDE", words: { en: "moon", es: "luna", zh: "yuèliang", ja: "tsuki" }, accept: { en: ["moon"], es: ["luna"], zh: ["yueliang", "yuèliang"], ja: ["tsuki"] } },
  { id: "star", emoji: "⭐", color: "#F9C74F", words: { en: "star", es: "estrella", zh: "xīngxing", ja: "hoshi" }, accept: { en: ["star"], es: ["estrella"], zh: ["xingxing", "xīngxing"], ja: ["hoshi"] } },
  { id: "flower", emoji: "🌸", color: "#F2A7C2", words: { en: "flower", es: "flor", zh: "huā", ja: "hana" }, accept: { en: ["flower"], es: ["flor"], zh: ["hua", "huā"], ja: ["hana"] } },
  { id: "tree", emoji: "🌳", color: "#40916C", words: { en: "tree", es: "árbol", zh: "shù", ja: "ki" }, accept: { en: ["tree"], es: ["arbol", "árbol"], zh: ["shu", "shù"], ja: ["ki"] } },
  { id: "car", emoji: "🚗", color: "#E63946", words: { en: "car", es: "coche", zh: "qìchē", ja: "kuruma" }, accept: { en: ["car"], es: ["coche", "carro"], zh: ["qiche", "qìchē"], ja: ["kuruma"] } },
  { id: "bus", emoji: "🚌", color: "#F77F00", words: { en: "bus", es: "autobús", zh: "gōngjiāo chē", ja: "basu" }, accept: { en: ["bus"], es: ["autobus", "autobús"], zh: ["gongjiao", "gongjiao che", "gōngjiāo"], ja: ["basu"] } },
  { id: "hand", emoji: "✋", color: "#E9C46A", words: { en: "hand", es: "mano", zh: "shǒu", ja: "te" }, accept: { en: ["hand"], es: ["mano"], zh: ["shou", "shǒu"], ja: ["te"] } },
  { id: "eye", emoji: "👁️", color: "#6D597A", words: { en: "eye", es: "ojo", zh: "yǎnjing", ja: "me" }, accept: { en: ["eye"], es: ["ojo"], zh: ["yanjing", "yǎnjing"], ja: ["me"] } },
  { id: "ear", emoji: "👂", color: "#E76F51", words: { en: "ear", es: "oreja", zh: "ěrduo", ja: "mimi" }, accept: { en: ["ear"], es: ["oreja"], zh: ["erduo", "ěrduo"], ja: ["mimi"] } },
];

export const OBJECT_BY_ID = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));

/** Easy fallbacks when a word is missed 3 days in a row */
export const EASY_ALTERNATES = {
  spoon: "cup",
  sock: "shoe",
  window: "door",
  chair: "bed",
  bird: "cat",
  fish: "dog",
  moon: "sun",
  star: "sun",
  flower: "tree",
  bus: "car",
  eye: "hand",
  ear: "hand",
  bread: "apple",
  milk: "water",
  banana: "apple",
  hat: "shoe",
  book: "ball",
};
