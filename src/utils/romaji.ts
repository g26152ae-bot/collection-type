export const romajiMap: Record<string, string[]> = {
  'あ': ['a'], 'い': ['i'], 'う': ['u', 'wu'], 'え': ['e'], 'お': ['o'],
  'か': ['ka'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
  'さ': ['sa'], 'し': ['si', 'shi', 'ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
  'た': ['ta'], 'ち': ['ti', 'chi'], 'つ': ['tu', 'tsu'], 'て': ['te'], 'と': ['to'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['hu', 'fu'], 'へ': ['he'], 'ほ': ['ho'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', 'n', "n'"],
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'だ': ['da'], 'ぢ': ['di', 'ji'], 'づ': ['du', 'zu'], 'で': ['de'], 'ど': ['do'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'], 'しゅ': ['syu', 'shu'], 'しょ': ['syo', 'sho'], 'しぇ': ['sye', 'she'],
  'ちゃ': ['tya', 'cha', 'cya'], 'ちゅ': ['tyu', 'chu', 'cyu'], 'ちょ': ['tyo', 'cho', 'cyo'], 'ちぇ': ['tye', 'che'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'],
  'ぢゃ': ['dya', 'ja'], 'ぢゅ': ['dyu', 'ju'], 'ぢょ': ['dyo', 'jo'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'ふぁ': ['fa', 'fwa'], 'ふぃ': ['fi', 'fwi', 'fyi'], 'ふぇ': ['fe', 'fwe', 'fye'], 'ふぉ': ['fo', 'fwo'],
  'ヴぁ': ['va'], 'ヴぃ': ['vi'], 'ヴ': ['vu'], 'ヴぇ': ['ve'], 'ヴぉ': ['vo'],
  'うぃ': ['wi', 'whi'], 'うぇ': ['we', 'whe'], 'うぉ': ['who'],
  'てぃ': ['thi', 'ti'], 'でぃ': ['dhi', 'di'],
  'どぅ': ['dwu', 'du'], 'とぅ': ['twu', 'tu'],
  'ぁ': ['la', 'xa'], 'ぃ': ['li', 'xi'], 'ぅ': ['lu', 'xu'], 'ぇ': ['le', 'xe'], 'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'], 'ゅ': ['lyu', 'xyu'], 'ょ': ['lyo', 'xyo'],
  'っ': ['xtu', 'xtsu', 'ltu', 'ltsu'],
  'ー': ['-']
};

export function kataToHira(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

export function parseKanaToPattern(kanaRaw: string): string[][] {
  const kana = kataToHira(kanaRaw);
  const pattern: string[][] = [];
  let i = 0;

  while (i < kana.length) {
    // Check 2-letter combos like きゃ, しゃ, ふぁ, etc.
    if (i + 1 < kana.length) {
      const pair = kana.slice(i, i + 2);
      if (romajiMap[pair]) {
        pattern.push([...romajiMap[pair]]);
        i += 2;
        continue;
      }
    }

    // Small tsu っ
    if (kana[i] === 'っ' && i + 1 < kana.length) {
      const nextPair = (i + 2 < kana.length) ? kana.slice(i + 1, i + 3) : '';
      const nextSingle = kana[i + 1];
      const nextRomajis = romajiMap[nextPair] || romajiMap[nextSingle];

      if (nextRomajis) {
        const consonants = nextRomajis.map(r => r[0]);
        const uniqueConsonants = [...new Set(consonants)];
        pattern.push([...uniqueConsonants, 'xtu', 'ltu', 'xtsu', 'ltsu']);
        i++;
        continue;
      }
    }

    const single = kana[i];
    if (romajiMap[single]) {
      pattern.push([...romajiMap[single]]);
    } else {
      pattern.push([single]);
    }
    i++;
  }

  return pattern;
}

const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export function isAdjacentKey(k1: string, k2: string): boolean {
  k1 = k1.toLowerCase();
  k2 = k2.toLowerCase();
  let p1: { r: number; c: number } | null = null;
  let p2: { r: number; c: number } | null = null;

  for (let r = 0; r < keyboardLayout.length; r++) {
    for (let c = 0; c < keyboardLayout[r].length; c++) {
      if (keyboardLayout[r][c] === k1) p1 = { r, c };
      if (keyboardLayout[r][c] === k2) p2 = { r, c };
    }
  }

  if (!p1 || !p2) return false;
  return Math.abs(p1.r - p2.r) <= 1 && Math.abs(p1.c - p2.c) <= 1;
}
