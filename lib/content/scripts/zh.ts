import type { LangScript } from "./types";

// Mandarin Chinese, Simplified (zh). NPC lines are in hanzi. The matcher
// lowercases and strips Latin accents but does NOT transliterate Chinese, and
// pinyin tone marks get stripped too, so every keyword group includes hanzi,
// toneless pinyin, and an English fallback. Players may type either script.
const zh: LangScript = {
  border: {
    opening: "你好！你今天从哪里来？",
    fallback: "嗯……请问，你是从哪里来的？",
    rules: [
      {
        needs: [
          ["来自", "从", "laizi", "cong", "from"],
          ["去", "要去", "前往", "qu", "yaoqu", "qianwang", "going", "to "],
        ],
        reply: "好极了。一路平安，旅客！",
      },
      {
        needs: [["来自", "从", "laizi", "cong", "from"]],
        reply: "好的！那你要去哪里呢？",
      },
    ],
    goal: [
      ["来自", "从", "laizi", "cong", "from"],
      ["去", "要去", "前往", "qu", "yaoqu", "qianwang", "going", "to "],
    ],
    translations: {
      "你好！你今天从哪里来？": "Hello! Where are you coming from today?",
      "好的！那你要去哪里呢？": "Okay! So where are you going?",
      "好极了。一路平安，旅客！": "Wonderful. Have a safe trip, traveler!",
      "嗯……请问，你是从哪里来的？": "Hmm… excuse me, where are you from?",
    },
    readings: {
      "你好！你今天从哪里来？": "Nǐ hǎo! Nǐ jīntiān cóng nǎlǐ lái?",
      "好的！那你要去哪里呢？": "Hǎo de! Nà nǐ yào qù nǎlǐ ne?",
      "好极了。一路平安，旅客！": "Hǎo jíle. Yīlù píng'ān, lǚkè!",
      "嗯……请问，你是从哪里来的？": "Ńg… qǐngwèn, nǐ shì cóng nǎlǐ lái de?",
    },
    hints: ["Greet them and say where you're from.", "“你好，我来自加拿大。我要去北京。”"],
    vocab: [
      { term: "你好", reading: "nǐ hǎo", meaning: "hello" },
      { term: "我来自", reading: "wǒ láizì", meaning: "I am from" },
      { term: "我要去", reading: "wǒ yào qù", meaning: "I am going to" },
      { term: "谢谢", reading: "xièxie", meaning: "thank you" },
    ],
  },

  market: {
    opening: "买点什么？橙子很甜的！",
    fallback: "说吧，您要买什么？",
    rules: [
      {
        needs: [
          ["公斤", "一公斤", "斤", "gongjin", "yigongjin", "jin", "kilo"],
          ["橙子", "橘子", "chengzi", "juzi", "orange"],
          ["多少钱", "多少", "价钱", "价格", "duoshaoqian", "duoshao", "jiaqian", "jiage", "price"],
        ],
        reply: "好嘞，一公斤！一共十块钱。还要别的吗？",
      },
      {
        needs: [
          ["公斤", "一公斤", "斤", "gongjin", "yigongjin", "jin", "kilo"],
          ["橙子", "橘子", "chengzi", "juzi", "orange"],
        ],
        reply: "一公斤橙子，马上好。还要点什么吗？",
      },
      {
        needs: [["多少钱", "多少", "价钱", "价格", "duoshaoqian", "duoshao", "jiaqian", "jiage", "price"]],
        reply: "橙子十块钱一公斤。要我给您称吗？",
      },
    ],
    goal: [
      ["公斤", "一公斤", "斤", "gongjin", "yigongjin", "jin", "kilo"],
      ["橙子", "橘子", "chengzi", "juzi", "orange"],
      ["多少钱", "多少", "价钱", "价格", "duoshaoqian", "duoshao", "jiaqian", "jiage", "price"],
    ],
    corrections: [
      { bad: "多少钱橙子", good: "橙子多少钱", note: "try: 橙子多少钱 (topic comes first)" },
    ],
    translations: {
      "买点什么？橙子很甜的！": "What would you like to buy? The oranges are very sweet!",
      "好嘞，一公斤！一共十块钱。还要别的吗？": "Sure, one kilo! That's ten yuan total. Anything else?",
      "一公斤橙子，马上好。还要点什么吗？": "One kilo of oranges, coming right up. Anything else?",
      "橙子十块钱一公斤。要我给您称吗？": "The oranges are ten yuan a kilo. Shall I weigh some for you?",
      "说吧，您要买什么？": "Go ahead, what would you like to buy?",
    },
    readings: {
      "买点什么？橙子很甜的！": "Mǎi diǎn shénme? Chéngzi hěn tián de!",
      "好嘞，一公斤！一共十块钱。还要别的吗？": "Hǎo lei, yī gōngjīn! Yīgòng shí kuài qián. Hái yào bié de ma?",
      "一公斤橙子，马上好。还要点什么吗？": "Yī gōngjīn chéngzi, mǎshàng hǎo. Hái yào diǎn shénme ma?",
      "橙子十块钱一公斤。要我给您称吗？": "Chéngzi shí kuài qián yī gōngjīn. Yào wǒ gěi nín chēng ma?",
      "说吧，您要买什么？": "Shuō ba, nín yào mǎi shénme?",
    },
    hints: ["Ask for a kilo of oranges, then the price.", "“我要一公斤橙子。多少钱？”"],
    vocab: [
      { term: "橙子", reading: "chéngzi", meaning: "oranges" },
      { term: "一公斤", reading: "yī gōngjīn", meaning: "a kilo" },
      { term: "多少钱", reading: "duōshao qián", meaning: "how much does it cost?" },
      { term: "请", reading: "qǐng", meaning: "please" },
    ],
  },

  cafe: {
    opening: "你好。想喝点什么？",
    fallback: "来杯茶怎么样？咖啡也很不错。",
    rules: [
      {
        needs: [
          ["咖啡", "kafei", "coffee"],
          ["请", "谢谢", "麻烦", "qing", "xiexie", "mafan", "please", "thanks", "thank"],
        ],
        reply: "好的，没问题，马上来。谢谢您！",
      },
      {
        needs: [["咖啡", "kafei", "coffee"]],
        reply: "一杯咖啡，马上来。还要别的吗？",
      },
    ],
    goal: [["咖啡", "kafei", "coffee"]],
    translations: {
      "你好。想喝点什么？": "Hello. What would you like to drink?",
      "好的，没问题，马上来。谢谢您！": "Sure, no problem, coming right up. Thank you!",
      "一杯咖啡，马上来。还要别的吗？": "One coffee, coming right up. Anything else?",
      "来杯茶怎么样？咖啡也很不错。": "How about a cup of tea? Our coffee is great too.",
    },
    readings: {
      "你好。想喝点什么？": "Nǐ hǎo. Xiǎng hē diǎn shénme?",
      "好的，没问题，马上来。谢谢您！": "Hǎo de, méi wèntí, mǎshàng lái. Xièxie nín!",
      "一杯咖啡，马上来。还要别的吗？": "Yī bēi kāfēi, mǎshàng lái. Hái yào bié de ma?",
      "来杯茶怎么样？咖啡也很不错。": "Lái bēi chá zěnmeyàng? Kāfēi yě hěn bùcuò.",
    },
    hints: ["Order a coffee politely.", "“请给我一杯咖啡，谢谢。”"],
    vocab: [
      { term: "咖啡", reading: "kāfēi", meaning: "coffee" },
      { term: "一杯", reading: "yī bēi", meaning: "a cup" },
      { term: "请", reading: "qǐng", meaning: "please" },
      { term: "买单", reading: "mǎidān", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "你好，旅客。要去哪里呢？",
    fallback: "这里船很多。你要坐哪一艘？",
    rules: [
      {
        needs: [
          ["船", "chuan", "boat"],
          ["岛", "小岛", "海岛", "dao", "xiaodao", "haidao", "island"],
          ["几点", "什么时候", "时间", "jidian", "shenmeshihou", "shijian", "time", "when"],
        ],
        reply: "去岛上的船五点开。要我给您买票吗？",
      },
      {
        needs: [
          ["船", "chuan", "boat"],
          ["岛", "小岛", "海岛", "dao", "xiaodao", "haidao", "island"],
        ],
        reply: "好的，是去岛上。那你想几点出发？",
      },
    ],
    goal: [
      ["船", "chuan", "boat"],
      ["岛", "小岛", "海岛", "dao", "xiaodao", "haidao", "island"],
      ["几点", "什么时候", "时间", "jidian", "shenmeshihou", "shijian", "time", "when"],
    ],
    translations: {
      "你好，旅客。要去哪里呢？": "Hello, traveler. Where would you like to go?",
      "去岛上的船五点开。要我给您买票吗？": "The boat to the island leaves at five. Shall I get you a ticket?",
      "好的，是去岛上。那你想几点出发？": "Okay, to the island. So what time do you want to leave?",
      "这里船很多。你要坐哪一艘？": "There are many boats here. Which one do you want to take?",
    },
    readings: {
      "你好，旅客。要去哪里呢？": "Nǐ hǎo, lǚkè. Yào qù nǎlǐ ne?",
      "去岛上的船五点开。要我给您买票吗？": "Qù dǎo shàng de chuán wǔ diǎn kāi. Yào wǒ gěi nín mǎi piào ma?",
      "好的，是去岛上。那你想几点出发？": "Hǎo de, shì qù dǎo shàng. Nà nǐ xiǎng jǐ diǎn chūfā?",
      "这里船很多。你要坐哪一艘？": "Zhèlǐ chuán hěn duō. Nǐ yào zuò nǎ yī sōu?",
    },
    hints: ["Ask which boat goes to the island and at what time.", "“哪艘船去岛上？几点开？”"],
    vocab: [
      { term: "船", reading: "chuán", meaning: "the boat" },
      { term: "岛", reading: "dǎo", meaning: "the island" },
      { term: "几点", reading: "jǐ diǎn", meaning: "at what time?" },
      { term: "票", reading: "piào", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "站台要关了。怎么了？",
    fallback: "快点。你需要什么？",
    rules: [
      {
        needs: [
          ["错过", "没赶上", "误了", "cuoguo", "meiganshang", "wule", "miss", "missed"],
          ["最后", "最后一班", "末班", "zuihou", "zuihouyiban", "moban", "last"],
        ],
        reply: "哎呀……好吧，快上最后一班车，快跑！",
      },
      {
        needs: [["火车", "列车", "车", "huoche", "lieche", "che", "train"]],
        reply: "你的火车？说说怎么回事。",
      },
    ],
    goal: [
      ["错过", "没赶上", "误了", "cuoguo", "meiganshang", "wule", "miss", "missed"],
      ["最后", "最后一班", "末班", "zuihou", "zuihouyiban", "moban", "last"],
    ],
    translations: {
      "站台要关了。怎么了？": "The platform is closing. What's the matter?",
      "哎呀……好吧，快上最后一班车，快跑！": "Oh no… alright, hurry and board the last one, run!",
      "你的火车？说说怎么回事。": "Your train? Tell me what happened.",
      "快点。你需要什么？": "Hurry up. What do you need?",
    },
    readings: {
      "站台要关了。怎么了？": "Zhàntái yào guān le. Zěnme le?",
      "哎呀……好吧，快上最后一班车，快跑！": "Āiyā… hǎo ba, kuài shàng zuìhòu yī bān chē, kuài pǎo!",
      "你的火车？说说怎么回事。": "Nǐ de huǒchē? Shuōshuo zěnme huí shì.",
      "快点。你需要什么？": "Kuài diǎn. Nǐ xūyào shénme?",
    },
    hints: [
      "Explain you missed your train, then ask to board the last one.",
      "“我错过了火车。我可以上最后一班吗？”",
    ],
    vocab: [
      { term: "火车", reading: "huǒchē", meaning: "the train" },
      { term: "错过", reading: "cuòguò", meaning: "to miss" },
      { term: "最后一班", reading: "zuìhòu yī bān", meaning: "the last one" },
      { term: "请", reading: "qǐng", meaning: "please" },
    ],
  },
};

export default zh;
