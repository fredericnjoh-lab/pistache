/**
 * 30 objets du quotidien — même concept en EN / ES / ZH / JA.
 * `words` = affiché aux parents (romanisé pour ZH/JA).
 * `say`   = prononcé par la synthèse (caractères natifs).
 * `accept` = formes acceptées à la reconnaissance vocale.
 */
export const LANGUAGES = [
  { id: "en", label: "Anglais", flag: "🇬🇧", voiceHints: ["en-US", "en-GB", "en"] },
  { id: "es", label: "Espagnol", flag: "🇪🇸", voiceHints: ["es-ES", "es-MX", "es"] },
  { id: "zh", label: "Mandarin", flag: "🇨🇳", voiceHints: ["zh-CN", "zh-TW", "zh"] },
  { id: "ja", label: "Japonais", flag: "🇯🇵", voiceHints: ["ja-JP", "ja"] },
];

export const OBJECTS = [
  {
    id: "apple", emoji: "🍎", color: "#E85D4C",
    words: { en: "apple", es: "manzana", zh: "píngguǒ", ja: "ringo" },
    say: { zh: "苹果", ja: "りんご" },
    accept: { en: ["apple"], es: ["manzana"], zh: ["pingguo", "ping guo", "苹果"], ja: ["ringo", "りんご"] },
  },
  {
    id: "banana", emoji: "🍌", color: "#E8B84A",
    words: { en: "banana", es: "plátano", zh: "xiāngjiāo", ja: "banana" },
    say: { zh: "香蕉", ja: "バナナ" },
    accept: { en: ["banana"], es: ["platano", "plátano", "banana"], zh: ["xiangjiao", "xiang jiao", "香蕉"], ja: ["banana", "バナナ"] },
  },
  {
    id: "water", emoji: "💧", color: "#5BA4D9",
    words: { en: "water", es: "agua", zh: "shuǐ", ja: "mizu" },
    say: { zh: "水", ja: "みず" },
    accept: { en: ["water"], es: ["agua"], zh: ["shui", "水"], ja: ["mizu", "みず", "水"] },
  },
  {
    id: "milk", emoji: "🥛", color: "#E8E4DC",
    words: { en: "milk", es: "leche", zh: "niúnǎi", ja: "gyūnyū" },
    say: { zh: "牛奶", ja: "ぎゅうにゅう" },
    accept: { en: ["milk"], es: ["leche"], zh: ["niunai", "niu nai", "牛奶"], ja: ["gyunyu", "miruku", "ぎゅうにゅう", "ミルク"] },
  },
  {
    id: "bread", emoji: "🍞", color: "#D4A574",
    words: { en: "bread", es: "pan", zh: "miànbāo", ja: "pan" },
    say: { zh: "面包", ja: "パン" },
    accept: { en: ["bread"], es: ["pan"], zh: ["mianbao", "mian bao", "面包"], ja: ["pan", "パン"] },
  },
  {
    id: "cup", emoji: "🥤", color: "#6BBF8A",
    words: { en: "cup", es: "vaso", zh: "bēizi", ja: "koppu" },
    say: { zh: "杯子", ja: "コップ" },
    accept: { en: ["cup"], es: ["vaso"], zh: ["beizi", "bei zi", "杯子"], ja: ["koppu", "kappu", "コップ"] },
  },
  {
    id: "spoon", emoji: "🥄", color: "#A8B5C4",
    words: { en: "spoon", es: "cuchara", zh: "sháozi", ja: "supūn" },
    say: { zh: "勺子", ja: "スプーン" },
    accept: { en: ["spoon"], es: ["cuchara"], zh: ["shaozi", "shao zi", "勺子"], ja: ["supun", "supūn", "スプーン"] },
  },
  {
    id: "shoe", emoji: "👟", color: "#4A90C8",
    words: { en: "shoe", es: "zapato", zh: "xiézi", ja: "kutsu" },
    say: { zh: "鞋子", ja: "くつ" },
    accept: { en: ["shoe", "shoes"], es: ["zapato", "zapatos"], zh: ["xiezi", "xie zi", "鞋子"], ja: ["kutsu", "くつ", "靴"] },
  },
  {
    id: "sock", emoji: "🧦", color: "#E07A5F",
    words: { en: "sock", es: "calcetín", zh: "wàzi", ja: "kutsushita" },
    say: { zh: "袜子", ja: "くつした" },
    accept: { en: ["sock", "socks"], es: ["calcetin", "calcetín"], zh: ["wazi", "wa zi", "袜子"], ja: ["kutsushita", "くつした"] },
  },
  {
    id: "hat", emoji: "🎩", color: "#3D3D3D",
    words: { en: "hat", es: "sombrero", zh: "màozi", ja: "bōshi" },
    say: { zh: "帽子", ja: "ぼうし" },
    accept: { en: ["hat"], es: ["sombrero"], zh: ["maozi", "mao zi", "帽子"], ja: ["boshi", "bōshi", "ぼうし"] },
  },
  {
    id: "door", emoji: "🚪", color: "#8B6914",
    words: { en: "door", es: "puerta", zh: "mén", ja: "doa" },
    say: { zh: "门", ja: "ドア" },
    accept: { en: ["door"], es: ["puerta"], zh: ["men", "门"], ja: ["doa", "ドア"] },
  },
  {
    id: "window", emoji: "🪟", color: "#7EB8DA",
    words: { en: "window", es: "ventana", zh: "chuānghu", ja: "mado" },
    say: { zh: "窗户", ja: "まど" },
    accept: { en: ["window"], es: ["ventana"], zh: ["chuanghu", "chuang hu", "窗户"], ja: ["mado", "まど", "窓"] },
  },
  {
    id: "bed", emoji: "🛏️", color: "#9B8EC4",
    words: { en: "bed", es: "cama", zh: "chuáng", ja: "beddo" },
    say: { zh: "床", ja: "ベッド" },
    accept: { en: ["bed"], es: ["cama"], zh: ["chuang", "床"], ja: ["beddo", "ベッド"] },
  },
  {
    id: "chair", emoji: "🪑", color: "#C4A484",
    words: { en: "chair", es: "silla", zh: "yǐzi", ja: "isu" },
    say: { zh: "椅子", ja: "いす" },
    accept: { en: ["chair"], es: ["silla"], zh: ["yizi", "yi zi", "椅子"], ja: ["isu", "いす"] },
  },
  {
    id: "ball", emoji: "⚽", color: "#2D6A4F",
    words: { en: "ball", es: "pelota", zh: "qiú", ja: "bōru" },
    say: { zh: "球", ja: "ボール" },
    accept: { en: ["ball"], es: ["pelota", "balon", "balón"], zh: ["qiu", "球"], ja: ["boru", "bōru", "ボール"] },
  },
  {
    id: "book", emoji: "📕", color: "#C1121F",
    words: { en: "book", es: "libro", zh: "shū", ja: "hon" },
    say: { zh: "书", ja: "ほん" },
    accept: { en: ["book"], es: ["libro"], zh: ["shu", "书"], ja: ["hon", "ほん", "本"] },
  },
  {
    id: "dog", emoji: "🐶", color: "#B08968",
    words: { en: "dog", es: "perro", zh: "gǒu", ja: "inu" },
    say: { zh: "狗", ja: "いぬ" },
    accept: { en: ["dog"], es: ["perro"], zh: ["gou", "狗"], ja: ["inu", "いぬ", "犬"] },
  },
  {
    id: "cat", emoji: "🐱", color: "#F4A261",
    words: { en: "cat", es: "gato", zh: "māo", ja: "neko" },
    say: { zh: "猫", ja: "ねこ" },
    accept: { en: ["cat"], es: ["gato"], zh: ["mao", "猫"], ja: ["neko", "ねこ", "猫"] },
  },
  {
    id: "bird", emoji: "🐦", color: "#48A9A6",
    words: { en: "bird", es: "pájaro", zh: "niǎo", ja: "tori" },
    say: { zh: "鸟", ja: "とり" },
    accept: { en: ["bird"], es: ["pajaro", "pájaro"], zh: ["niao", "鸟"], ja: ["tori", "とり", "鳥"] },
  },
  {
    id: "fish", emoji: "🐟", color: "#457B9D",
    words: { en: "fish", es: "pez", zh: "yú", ja: "sakana" },
    say: { zh: "鱼", ja: "さかな" },
    accept: { en: ["fish"], es: ["pez", "pescado"], zh: ["yu", "鱼"], ja: ["sakana", "さかな", "魚"] },
  },
  {
    id: "sun", emoji: "☀️", color: "#F4D35E",
    words: { en: "sun", es: "sol", zh: "tàiyáng", ja: "taiyō" },
    say: { zh: "太阳", ja: "たいよう" },
    accept: { en: ["sun"], es: ["sol"], zh: ["taiyang", "tai yang", "太阳"], ja: ["taiyo", "taiyō", "たいよう"] },
  },
  {
    id: "moon", emoji: "🌙", color: "#7B8CDE",
    words: { en: "moon", es: "luna", zh: "yuèliang", ja: "tsuki" },
    say: { zh: "月亮", ja: "つき" },
    accept: { en: ["moon"], es: ["luna"], zh: ["yueliang", "yue liang", "月亮"], ja: ["tsuki", "つき", "月"] },
  },
  {
    id: "star", emoji: "⭐", color: "#F9C74F",
    words: { en: "star", es: "estrella", zh: "xīngxing", ja: "hoshi" },
    say: { zh: "星星", ja: "ほし" },
    accept: { en: ["star"], es: ["estrella"], zh: ["xingxing", "xing xing", "星星"], ja: ["hoshi", "ほし", "星"] },
  },
  {
    id: "flower", emoji: "🌸", color: "#F2A7C2",
    words: { en: "flower", es: "flor", zh: "huā", ja: "hana" },
    say: { zh: "花", ja: "はな" },
    accept: { en: ["flower"], es: ["flor"], zh: ["hua", "花"], ja: ["hana", "はな", "花"] },
  },
  {
    id: "tree", emoji: "🌳", color: "#40916C",
    words: { en: "tree", es: "árbol", zh: "shù", ja: "ki" },
    say: { zh: "树", ja: "き" },
    accept: { en: ["tree"], es: ["arbol", "árbol"], zh: ["shu", "树"], ja: ["ki", "き", "木"] },
  },
  {
    id: "car", emoji: "🚗", color: "#E63946",
    words: { en: "car", es: "coche", zh: "qìchē", ja: "kuruma" },
    say: { zh: "汽车", ja: "くるま" },
    accept: { en: ["car"], es: ["coche", "carro"], zh: ["qiche", "qi che", "汽车"], ja: ["kuruma", "くるま", "車"] },
  },
  {
    id: "bus", emoji: "🚌", color: "#F77F00",
    words: { en: "bus", es: "autobús", zh: "gōngjiāo", ja: "basu" },
    say: { zh: "公交", ja: "バス" },
    accept: { en: ["bus"], es: ["autobus", "autobús"], zh: ["gongjiao", "gong jiao", "公交", "公共汽车"], ja: ["basu", "バス"] },
  },
  {
    id: "hand", emoji: "✋", color: "#E9C46A",
    words: { en: "hand", es: "mano", zh: "shǒu", ja: "te" },
    say: { zh: "手", ja: "て" },
    accept: { en: ["hand"], es: ["mano"], zh: ["shou", "手"], ja: ["te", "て", "手"] },
  },
  {
    id: "eye", emoji: "👁️", color: "#6D597A",
    words: { en: "eye", es: "ojo", zh: "yǎnjing", ja: "me" },
    say: { zh: "眼睛", ja: "め" },
    accept: { en: ["eye"], es: ["ojo"], zh: ["yanjing", "yan jing", "眼睛"], ja: ["me", "め", "目"] },
  },
  {
    id: "ear", emoji: "👂", color: "#E76F51",
    words: { en: "ear", es: "oreja", zh: "ěrduo", ja: "mimi" },
    say: { zh: "耳朵", ja: "みみ" },
    accept: { en: ["ear"], es: ["oreja"], zh: ["erduo", "er duo", "耳朵"], ja: ["mimi", "みみ", "耳"] },
  },
];

export const OBJECT_BY_ID = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));

/** Texte à faire dire à la synthèse vocale */
export function sayText(obj, lang) {
  return obj.say?.[lang] || obj.words[lang];
}

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
