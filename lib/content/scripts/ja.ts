import type { LangScript } from "./types";

// Japanese (ja). NPC lines are in kana/kanji. The matcher lowercases and strips
// Latin accents but does NOT transliterate Japanese, so every keyword group
// includes native Japanese keywords, common rōmaji spellings, and an English
// fallback.
const ja: LangScript = {
  border: {
    opening: "こんにちは！今日はどちらから来ましたか？",
    fallback: "うーん…教えてください、どちらからですか？",
    rules: [
      {
        needs: [
          ["から来", "から来ました", "から来た", "kara ki", "kara kima", "kara kita", "from"],
          ["へ行", "に行", "行きます", "行く", "目指", "e iki", "ni iki", "ikimasu", "iku", "going", "to "],
        ],
        reply: "すばらしい。よい旅を、旅人さん！",
      },
      {
        needs: [["から来", "から来ました", "から来た", "kara ki", "kara kima", "kara kita", "from"]],
        reply: "なるほど！それで、どちらへ行きますか？",
      },
    ],
    goal: [
      ["から来", "から来ました", "から来た", "kara ki", "kara kima", "kara kita", "from"],
      ["へ行", "に行", "行きます", "行く", "目指", "e iki", "ni iki", "ikimasu", "iku", "going", "to "],
    ],
    translations: {
      "こんにちは！今日はどちらから来ましたか？": "Hello! Where did you come from today?",
      "なるほど！それで、どちらへ行きますか？": "I see! So, where are you going?",
      "すばらしい。よい旅を、旅人さん！": "Wonderful. Have a good journey, traveler!",
      "うーん…教えてください、どちらからですか？": "Hmm… please tell me, where are you from?",
    },
    readings: {
      "こんにちは！今日はどちらから来ましたか？": "Konnichiwa! Kyou wa dochira kara kimashita ka?",
      "なるほど！それで、どちらへ行きますか？": "Naruhodo! Sore de, dochira e ikimasu ka?",
      "すばらしい。よい旅を、旅人さん！": "Subarashii. Yoi tabi o, tabibito-san!",
      "うーん…教えてください、どちらからですか？": "Uun… oshiete kudasai, dochira kara desu ka?",
    },
    hints: ["Greet them and say where you're from.", "「こんにちは、カナダから来ました。東京へ行きます。」"],
    vocab: [
      { term: "こんにちは", reading: "konnichiwa", meaning: "hello" },
      { term: "から来ました", reading: "kara kimashita", meaning: "I came from" },
      { term: "へ行きます", reading: "e ikimasu", meaning: "I am going to" },
      { term: "ありがとう", reading: "arigatou", meaning: "thank you" },
    ],
  },

  market: {
    opening: "いらっしゃい！甘いオレンジだよ。何にする？",
    fallback: "どうぞ、何が欲しいですか？",
    rules: [
      {
        needs: [
          ["キロ", "kiro", "kilo"],
          ["オレンジ", "みかん", "orenji", "mikan", "orange"],
          ["いくら", "値段", "ねだん", "ikura", "nedan", "price"],
        ],
        reply: "はい、一キロね！四百円です。ほかには？",
      },
      {
        needs: [
          ["キロ", "kiro", "kilo"],
          ["オレンジ", "みかん", "orenji", "mikan", "orange"],
        ],
        reply: "オレンジ一キロ、用意できたよ。ほかには？",
      },
      {
        needs: [["いくら", "値段", "ねだん", "ikura", "nedan", "price"]],
        reply: "オレンジは一キロ四百円だよ。量ろうか？",
      },
    ],
    goal: [
      ["キロ", "kiro", "kilo"],
      ["オレンジ", "みかん", "orenji", "mikan", "orange"],
      ["いくら", "値段", "ねだん", "ikura", "nedan", "price"],
    ],
    corrections: [
      { bad: "オレンジを一キロをください", good: "オレンジを一キロください", note: "try: オレンジを一キロください (drop the extra を)" },
    ],
    translations: {
      "いらっしゃい！甘いオレンジだよ。何にする？": "Welcome! Sweet oranges here. What'll it be?",
      "はい、一キロね！四百円です。ほかには？": "Sure, one kilo! That's four hundred yen. Anything else?",
      "オレンジ一キロ、用意できたよ。ほかには？": "One kilo of oranges, ready. Anything else?",
      "オレンジは一キロ四百円だよ。量ろうか？": "Oranges are four hundred yen a kilo. Shall I weigh some?",
      "どうぞ、何が欲しいですか？": "Go ahead, what would you like?",
    },
    readings: {
      "いらっしゃい！甘いオレンジだよ。何にする？": "Irasshai! Amai orenji da yo. Nani ni suru?",
      "はい、一キロね！四百円です。ほかには？": "Hai, ichi-kiro ne! Yonhyaku-en desu. Hoka ni wa?",
      "オレンジ一キロ、用意できたよ。ほかには？": "Orenji ichi-kiro, youi dekita yo. Hoka ni wa?",
      "オレンジは一キロ四百円だよ。量ろうか？": "Orenji wa ichi-kiro yonhyaku-en da yo. Hakarou ka?",
      "どうぞ、何が欲しいですか？": "Douzo, nani ga hoshii desu ka?",
    },
    hints: ["Ask for a kilo, then the price.", "「オレンジを一キロください。いくらですか？」"],
    vocab: [
      { term: "オレンジ", reading: "orenji", meaning: "oranges" },
      { term: "一キロ", reading: "ichi-kiro", meaning: "one kilo" },
      { term: "いくらですか？", reading: "ikura desu ka?", meaning: "how much is it?" },
      { term: "ください", reading: "kudasai", meaning: "please (give me)" },
    ],
  },

  cafe: {
    opening: "いらっしゃいませ。何になさいますか？",
    fallback: "コーヒーはいかがですか？",
    rules: [
      {
        needs: [
          ["コーヒー", "koohii", "kohi", "coffee"],
          ["ください", "お願い", "おねがい", "kudasai", "onegai", "please"],
        ],
        reply: "かしこまりました。すぐにお持ちします。ありがとうございます！",
      },
      {
        needs: [["コーヒー", "koohii", "kohi", "coffee"]],
        reply: "コーヒーをお一つですね。少々お待ちください。",
      },
    ],
    goal: [
      ["コーヒー", "koohii", "kohi", "coffee"],
      ["ください", "お願い", "おねがい", "kudasai", "onegai", "please"],
    ],
    translations: {
      "いらっしゃいませ。何になさいますか？": "Welcome. What would you like?",
      "かしこまりました。すぐにお持ちします。ありがとうございます！": "Certainly. I'll bring it right away. Thank you!",
      "コーヒーをお一つですね。少々お待ちください。": "One coffee, then. Please wait a moment.",
      "コーヒーはいかがですか？": "How about a coffee?",
    },
    readings: {
      "いらっしゃいませ。何になさいますか？": "Irasshaimase. Nani ni nasaimasu ka?",
      "かしこまりました。すぐにお持ちします。ありがとうございます！": "Kashikomarimashita. Sugu ni omochi shimasu. Arigatou gozaimasu!",
      "コーヒーをお一つですね。少々お待ちください。": "Koohii o ohitotsu desu ne. Shoushou omachi kudasai.",
      "コーヒーはいかがですか？": "Koohii wa ikaga desu ka?",
    },
    hints: ["Order a coffee politely.", "「コーヒーを一つください、お願いします。」"],
    vocab: [
      { term: "コーヒー", reading: "koohii", meaning: "coffee" },
      { term: "ください", reading: "kudasai", meaning: "please (give me)" },
      { term: "お願いします", reading: "onegai shimasu", meaning: "please (I ask)" },
      { term: "お会計", reading: "okaikei", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "こんにちは、旅人さん。どちらへお連れしましょう？",
    fallback: "船はたくさんありますよ。どれにしますか？",
    rules: [
      {
        needs: [
          ["船", "ふね", "fune", "boat"],
          ["島", "しま", "shima", "island"],
          ["何時", "なんじ", "時間", "じかん", "nanji", "jikan", "time", "when"],
        ],
        reply: "島行きの船は五時に出ますよ。切符を買いますか？",
      },
      {
        needs: [
          ["船", "ふね", "fune", "boat"],
          ["島", "しま", "shima", "island"],
        ],
        reply: "ああ、島へね。それで、何時に行きたいですか？",
      },
    ],
    goal: [
      ["船", "ふね", "fune", "boat"],
      ["島", "しま", "shima", "island"],
      ["何時", "なんじ", "時間", "じかん", "nanji", "jikan", "time", "when"],
    ],
    translations: {
      "こんにちは、旅人さん。どちらへお連れしましょう？": "Hello, traveler. Where shall I take you?",
      "島行きの船は五時に出ますよ。切符を買いますか？": "The boat to the island leaves at five. Shall I get you a ticket?",
      "ああ、島へね。それで、何時に行きたいですか？": "Ah, to the island. And what time do you want to go?",
      "船はたくさんありますよ。どれにしますか？": "There are many boats here. Which one will it be?",
    },
    readings: {
      "こんにちは、旅人さん。どちらへお連れしましょう？": "Konnichiwa, tabibito-san. Dochira e otsure shimashou?",
      "島行きの船は五時に出ますよ。切符を買いますか？": "Shima-yuki no fune wa goji ni demasu yo. Kippu o kaimasu ka?",
      "ああ、島へね。それで、何時に行きたいですか？": "Aa, shima e ne. Sore de, nanji ni ikitai desu ka?",
      "船はたくさんありますよ。どれにしますか？": "Fune wa takusan arimasu yo. Dore ni shimasu ka?",
    },
    hints: ["Ask which boat goes to the island, and at what time.", "「島へはどの船が行きますか？何時に出ますか？」"],
    vocab: [
      { term: "船", reading: "fune", meaning: "the boat" },
      { term: "島", reading: "shima", meaning: "the island" },
      { term: "何時に？", reading: "nanji ni?", meaning: "at what time?" },
      { term: "切符", reading: "kippu", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "ホームはもう閉まりますよ。どうしました？",
    fallback: "急いでください。何が必要ですか？",
    rules: [
      {
        needs: [
          ["乗り遅れ", "のりおくれ", "逃し", "逃した", "nori okure", "noriokure", "nogashi", "missed", "miss"],
          ["最終", "さいしゅう", "最後", "saishuu", "saigo", "last"],
        ],
        reply: "ああ…大丈夫、急いで最終電車に乗ってください。走って！",
      },
      {
        needs: [["電車", "でんしゃ", "列車", "densha", "ressha", "train"]],
        reply: "電車ですか？何があったか教えてください。",
      },
    ],
    goal: [
      ["乗り遅れ", "のりおくれ", "逃し", "逃した", "nori okure", "noriokure", "nogashi", "missed", "miss"],
      ["最終", "さいしゅう", "最後", "saishuu", "saigo", "last"],
    ],
    translations: {
      "ホームはもう閉まりますよ。どうしました？": "The platform is closing now. What's the matter?",
      "ああ…大丈夫、急いで最終電車に乗ってください。走って！": "Oh… it's okay, hurry and board the last train. Run!",
      "電車ですか？何があったか教えてください。": "Your train? Tell me what happened.",
      "急いでください。何が必要ですか？": "Please hurry. What do you need?",
    },
    readings: {
      "ホームはもう閉まりますよ。どうしました？": "Hoomu wa mou shimarimasu yo. Dou shimashita?",
      "ああ…大丈夫、急いで最終電車に乗ってください。走って！": "Aa… daijoubu, isoide saishuu densha ni notte kudasai. Hashitte!",
      "電車ですか？何があったか教えてください。": "Densha desu ka? Nani ga atta ka oshiete kudasai.",
      "急いでください。何が必要ですか？": "Isoide kudasai. Nani ga hitsuyou desu ka?",
    },
    hints: [
      "Explain you missed your train, then ask to board the last one.",
      "「電車に乗り遅れました。最終電車に乗ってもいいですか、お願いします。」",
    ],
    vocab: [
      { term: "電車", reading: "densha", meaning: "the train" },
      { term: "乗り遅れました", reading: "nori okuremashita", meaning: "I missed (it)" },
      { term: "最終電車", reading: "saishuu densha", meaning: "the last train" },
      { term: "お願いします", reading: "onegai shimasu", meaning: "please" },
    ],
  },
};

export default ja;
