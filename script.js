// =========================================
// 🔊 Sound Manager（集中管理）
// =========================================
const Sound = {
  muted: false,

  uiClick: new Audio("./sfx/ui_click.mp3"),
  eat: new Audio("./sfx/eat.mp3"),
  magic: new Audio("./sfx/magic.mp3"),
  curtain: new Audio("./sfx/curtain.mp3"),
  success: new Audio("./sfx/success.mp3"),
  fail: new Audio("./sfx/fail.mp3"),
  bgm: new Audio("./sfx/bgm.mp3"),
};

function playSfx(audio) {
  if (!audio) return;
  if (Sound?.muted) return;

  // ✅ 最穩：每次點擊都用新 audio 播放，避免同一支被卡住
  const a = audio.cloneNode(true);
  a.volume = audio.volume ?? 1;
  a.play().catch(() => {});
}

// 音量設定
Sound.uiClick.volume = 1.0;
Sound.eat.volume = 0.8;
Sound.magic.volume = 0.8;
Sound.curtain.volume = 0.7;
Sound.success.volume = 0.9;
Sound.fail.volume = 0.9;

Sound.bgm.volume = 0.35;
Sound.bgm.loop = true;

// 統一播放入口
Sound.play = (audio) => {
  if (Sound.muted || !audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

// =========================================
//  1. 數據配置 (Ingredients & Eggs)
// =========================================

const EGG_IDLE_SRC = "./img/待機蛋 (去背).gif"; // 待機動畫
const EGG_EAT_SRC = "./img/egg_eat.gif"; // 吃東西動畫

const EGG_EAT_DURATION = 2000; // ← 改成你 GIF 實際長度（毫秒）

const ingredientPositions = [
  { top: "61%", left: "50%" }, // 1. 隕石（中偏左，上排）
  { top: "70%", left: "67%" }, // 2. 魷魚（最右，上排）
  { top: "75%", left: "53%" }, // 3. 衣服（右下）
  { top: "57%", left: "62%" }, // 4. 香菜（中偏右，上排）
  { top: "61%", left: "38%" }, // 5. 檸檬（中間，上排）
  { top: "55%", left: "24%" }, // 6. 榴蓮（最左，上排）
  { top: "77%", left: "40%" }, // 7. TNT（中下）
  { top: "73%", left: "24%" }, // 8. 手機（左下）
];

// 食材清單 (對應 ID)
// 1:隕石, 2:魷魚, 3:衣服, 4:香菜, 5:檸檬, 6:榴蓮, 7:TNT, 8:手機
const ingredients = [
  { id: 1, img: "recipe_rock.png", name: "隕石" },
  { id: 2, img: "recipe_squid.png", name: "魷魚" },
  { id: 3, img: "recipe_pants.png", name: "衣服" },
  { id: 4, img: "recipe_vagetable.png", name: "香菜" },
  { id: 5, img: "recipe_lemon.png", name: "檸檬" },
  { id: 6, img: "recipe_ruit.png", name: "榴蓮" },
  { id: 7, img: "recipe_tnt.png", name: "炸藥" },
  { id: 8, img: "recipe_iphone17.png", name: "手機" },
];

// 請用這段取代 script.js 最上面的 eggs 陣列，確保圖片讀得到
const eggs = [
  { id: "bird", name: "鳥蛋", cost: "1450", img: "birdegg.png", locked: true },
  {
    id: "gold",
    name: "黃金蛋",
    cost: "114514",
    img: "goldenegg.png",
    locked: true,
  },
  {
    id: "meat",
    name: "米特蛋",
    cost: "10",
    img: "egg.png", // 你原本叫 egg.png
    locked: false,
  },
  {
    id: "evil",
    name: "邪惡蛋",
    cost: "???",
    img: "evilegg.png",
    locked: true,
  },
  {
    id: "dino",
    name: "黑幫蛋",
    cost: "9999",
    img: "mafiaegg.png", // 你原本叫 mafiaegg.png
    locked: true,
  },
];

// =========================================
//  2. 結局資料庫 (Recipe Database)
//  KEY = "ID-ID-ID" (由小到大排序)
// =========================================
const recipes = {
  // --- 隕石 (1) 系列 ---
  "1-2-3": { name: "魅力觸手怪", img: "魅力觸手怪.png" },
  "1-2-4": { name: "香菜盆栽", img: "香菜盆栽.png" },
  "1-2-6": { name: "流星鎚", img: "流星鎚.png" },
  "1-2-5": { name: "手機支架", img: "手機支架.png" }, // 註：原文清單可能是 1-2-8? 這裡依據你提供的文字 "隕石、魷魚、檸檬" -> 1,2,5
  "1-2-8": { name: "氛圍燈", img: "氛圍燈.png" },
  "1-2-7": { name: "噴火拉麵", img: "噴火拉麵.png" },

  "1-3-4": { name: "石頭火鍋", img: "石頭火鍋.png" },
  "1-4-6": { name: "QNC臭臭鍋", img: "QNC臭臭鍋.png" },
  "1-4-5": { name: "煞氣☆土地公沙拉乂", img: "煞氣蛋.png" },
  "1-4-8": { name: "鼻子蛋捲", img: "鼻子蛋捲.png" },
  "1-4-7": { name: "盧媽媽蛋餅", img: "盧媽媽蛋餅.png" },

  "1-6-5": { name: "隕石貢丸米粉", img: "隕石貢丸米粉.png" },
  "1-6-8": { name: "台指數炸彈", img: "台指數炸彈.png" },
  "1-6-7": { name: "地雷系蛋", img: "地雷系蛋.png" },

  // --- 魷魚 (2) 系列 ---
  "2-3-4": { name: "香菜冰淇淋", img: "香菜冰淇淋.png" },
  "2-3-6": { name: "燃燒吧!!布羅利石頭", img: "燃燒吧布羅利石頭.png" },
  "2-3-5": { name: "魷夠派", img: "魷夠派.png" },
  "2-3-8": { name: "潮魷", img: "潮魷.png" },
  "2-3-7": { name: "黑人問號", img: "黑人問號.png" },

  "2-4-6": { name: "流浪漢蛋", img: "流浪漢蛋.png" },
  "2-4-5": { name: "Dora", img: "Dora.png" },
  "2-4-8": { name: "Oiiai cat", img: "Oiiaicat.png" },
  "2-4-7": { name: "魷魚燒", img: "魷魚燒.png" },

  "2-6-5": { name: "魷魚檸檬汁", img: "魷魚檸檬汁.png" },
  "2-6-8": { name: "大Boss", img: "大Boss.png" },
  "2-6-7": { name: "魷魚翻身", img: "魷魚翻身.png" },

  "2-5-8": { name: "憂鬱檸檬", img: "憂鬱檸檬.png" },
  "2-5-7": { name: "章魚哥", img: "火爆章魚哥.png" },
  "2-8-7": { name: "Ecraft", img: "Ecraft.png" },

  // --- 衣服 (3) 系列 ---
  "3-4-6": { name: "防毒面具", img: "防毒面具.png" },
  "3-4-5": { name: "檸矇公爵", img: "檸矇公爵.png" },
  "3-4-8": { name: "應援", img: "應援蛋.png" },
  "3-4-7": { name: "香菜鴨", img: "香菜鴨.png" },

  "3-6-5": { name: "章家檸檬綠茶", img: "章家檸檬綠茶.png" },
  "3-6-8": { name: "防摔手機殼", img: "防摔手機殼.png" },
  "3-6-7": { name: "暴躁雞蛋糕", img: "暴躁雞蛋糕.png" },

  // --- 香菜 (4) 系列 ---
  "4-6-5": { name: "野原廣志的襪子", img: "野原廣志的襪子.png" },
  "4-6-8": { name: "香菜榴槤洋芋片", img: "香菜榴槤洋芋片.png" },
  "4-6-7": { name: "生化武器", img: "生化武器.png" },

  "4-5-8": { name: "香菜檸檬蛋糕", img: "香菜檸檬蛋糕.png" },
  "4-5-7": { name: "爆辣螺獅粉", img: "爆辣螺獅粉.png" },
  "4-8-7": { name: "外星蛋", img: "外星蛋.png" },

  // --- 其他組合 ---
  "6-5-8": { name: "海膽", img: "海膽.png" },
  "6-5-7": { name: "一個跳舞的印度大叔", img: "印度大叔.png" },
  "6-8-7": { name: "核武器按鈕", img: "核武器按鈕.png" },
  "5-8-7": { name: "地獄跳跳糖", img: "地獄跳跳糖.png" },

  "1-3-6": { name: "宇航員臭鼬", img: "宇航員臭鼬.png" },
  "3-5-7": { name: "邪惡蟲蟲蛋糕", img: "邪惡蟲蟲蛋糕.png" },

  // --- 廚餘系列 (統一圖片 result_fail.png) ---
  "1-3-8": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-3-7": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-3-5": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-8-7": { name: "廚餘", img: "result_fail.png", isFail: true }, // 修正：隕石 手機 TNT
  "1-5-8": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-5-7": { name: "廚餘", img: "result_fail.png", isFail: true },
  "3-8-7": { name: "廚餘", img: "result_fail.png", isFail: true },
  "3-5-8": { name: "廚餘", img: "result_fail.png", isFail: true },
};

// 記錄已解鎖的圖鑑 (用 localStorage 存起來，刷新不會不見)
let unlockedRecipes =
  JSON.parse(localStorage.getItem("eggMagic_unlocked")) || [];

// =========================================
//  3. 狀態管理與 DOM
// =========================================
let state = {
  selectedEgg: null,
  chosenIngredients: [],
  soundOn: true,
};

const pages = {
  home: document.getElementById("page-home"),
  story: document.getElementById("page-story"),
  select: document.getElementById("page-select"),
  game: document.getElementById("page-game"),
  result: document.getElementById("page-result"),
  gallery: document.getElementById("page-gallery"),
};
const hands = {
  story: document.getElementById("hands-intro"), // ✅ 修正 id
  select: document.getElementById("hands-select"),
};

// =========================================
//  4. 初始化
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initSelect();
  initGame();
  initTopUI();
});

// --- 首頁 ---
function initHome() {
  function startIntroHandsCarousel() {
    startHandsCarouselById("hands-intro", 700);
  }
  document.getElementById("start-btn").addEventListener("click", () => {
    if (!window.bgmStarted && Sound?.bgm && !Sound.muted) {
      Sound.bgm.currentTime = 0;
      Sound.bgm.play().catch(() => {});
      window.bgmStarted = true;
    }

    scrollTransition(pages.home, pages.story);
    updateHands("page-story");
    setTimeout(() => startStory(), 800);
  });

  // 綁定回首頁
  document.getElementById("btn-home").onclick = () => {
    location.reload(); // 最簡單的回首頁方式
  };
}

// --- 故事 ---
const storyLines = [
  "我是一位廚師，因為到了30歲依舊母胎單身，因此獲得魔法成為了魔法廚師。",
  "在因緣巧合之下，剛成為魔法師的我很幸運地拿到了霍格滑茲的入學offer，在一年前順利畢業，但畢業後一直不知道要繼續做什麼。",
  "直到上周六晚上做飯的時候突然福至心靈，想到要是我把魔法用在這些食材上會怎麽樣？ （內心os:哈哈哈，我怎麼這麼聰明）",
  "於是，我開始嘗試去超市買來最便宜的米特蛋製作料理，鷄蛋嘛，怎麽做都不會出錯的。",
  "為了我的大業，我還特別跑到十公里外的卡斯頭賣場找來一些魔法材料來製作這個魔法料理實驗。",
  "至於會做出什麼成品嗎……我告訴你，我也不知道。",
  "事不宜遲，馬上開始行動！",
];

function startStory() {
  startIntroHandsCarousel();
  hands.story.classList.add("hands-show");
  const container = document.querySelector(".chat-container");
  container.innerHTML = "";
  let idx = 0;
  let speed = 1500;

  const btnSkip = document.getElementById("btn-skip");
  const btnGo = document.getElementById("btn-go");

  // 每次進來重置按鈕
  btnSkip.style.display = "block";
  btnGo.style.display = "none";

  function showNext() {
    if (idx >= storyLines.length) {
      btnSkip.style.display = "none";
      btnGo.style.display = "block";
      return;
    }
    const div = document.createElement("div");
    div.className = `chat-bubble bubble-${Math.min(idx + 1, 6)}`; // 防止超過樣式
    div.innerText = storyLines[idx];
    container.appendChild(div);

    setTimeout(() => div.classList.add("show"), 50);
    idx++;

    // 自動播放邏輯
    if (idx < storyLines.length) {
      window.storyTimer = setTimeout(showNext, speed);
    } else {
      btnSkip.style.display = "none";
      btnGo.style.display = "block";
    }
  }

  window.storyTimer = setTimeout(showNext, 500);

  btnSkip.onclick = () => {
    speed = 100; // 加速
  };

  btnGo.onclick = () => {
    scrollTransition(pages.story, pages.select);
    updateHands("page-select");

    setTimeout(() => {
      hands.story.classList.remove("hands-show");
      hands.select.classList.add("hands-show");
    }, 500);
  };
}

// --- 選擇蛋 (含拖曳功能) ---
// --- 選擇蛋 (3D 輪播 + 自動吸附版) ---
function initSelect() {
  const carousel = document.getElementById("egg-carousel");
  const btnChoose = document.getElementById("btn-choose-food");

  // 清空內容
  carousel.innerHTML = "";

  // 1. 生成卡片
  eggs.forEach((egg) => {
    const el = document.createElement("div");
    el.className = "egg-card";
    // 這裡不用預設 active，交給下面的滾動邏輯判斷
    el.dataset.id = egg.id; // 綁定 ID 以便查詢

    el.innerHTML = `
            <div class="egg-tag">${egg.locked ? "未解鎖" : "可選購"}</div>
            <img src="./img/${egg.img}" class="egg-img" draggable="false"> 
            <h3>${egg.name}</h3>
            <p>價格: ${egg.cost}</p>
        `;

    // 點擊卡片時，自動捲動到該卡片
    el.addEventListener("click", () => {
      scrollToCard(el);
    });

    carousel.appendChild(el);
  });

  // 2. 核心：滾動時計算縮放 (3D效果)
  function updateCarousel() {
    const center = carousel.offsetWidth / 2;
    const cards = document.querySelectorAll(".egg-card");
    let closestCard = null;
    let minDist = Infinity;

    cards.forEach((card) => {
      // 計算卡片中心點相對於視窗的位置
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2 - carousel.scrollLeft;

      // 計算距離中心的絕對值
      const dist = Math.abs(cardCenter - center);

      // 縮放公式：距離越近 scale 越大 (最大 1.2, 最小 0.8)
      // 500 是一個參數，控制縮放的敏感度
      let scale = 1.2 - dist / 500;
      if (scale < 0.8) scale = 0.8;

      card.style.transform = `scale(${scale})`;

      // 找出距離中心最近的那張卡
      if (dist < minDist) {
        minDist = dist;
        closestCard = card;
      }
    });

    // 處理「選中狀態」
    if (closestCard) {
      document
        .querySelectorAll(".egg-card")
        .forEach((c) => c.classList.remove("active"));
      closestCard.classList.add("active");

      // 只有中間是米特蛋時，按鈕才有效
      if (closestCard.dataset.id === "meat") {
        btnChoose.classList.remove("disabled");
        state.selectedEgg = "meat";
      } else {
        btnChoose.classList.add("disabled");
        state.selectedEgg = null;
      }
    }
  }

  // 綁定滾動事件
  carousel.addEventListener("scroll", updateCarousel);
  // 初始化執行一次
  setTimeout(updateCarousel, 100);

  // 3. 初始定位：直接捲動到米特蛋 (假設是第3顆，index 2)
  // 要稍微延遲，等 CSS 渲染完
  setTimeout(() => {
    const meatCard = carousel.children[2]; // 0:鳥, 1:金, 2:米特
    if (meatCard) scrollToCard(meatCard);
  }, 200);

  // 輔助函式：捲動到特定卡片
  function scrollToCard(card) {
    const center = carousel.offsetWidth / 2;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    carousel.scrollTo({
      left: cardCenter - center,
      behavior: "smooth",
    });
  }

  // 4. 滑鼠拖曳邏輯 (保留並優化)
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener("mousedown", (e) => {
    isDown = true;
    carousel.classList.add("dragging");
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });
  carousel.addEventListener("mouseleave", () => {
    isDown = false;
    carousel.classList.remove("dragging");
    snapToNearest(); // 離開時吸附
  });
  carousel.addEventListener("mouseup", () => {
    isDown = false;
    carousel.classList.remove("dragging");
    snapToNearest(); // 放開時吸附
  });
  carousel.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // 拖曳速度
    carousel.scrollLeft = scrollLeft - walk;
  });

  // 自動吸附到最近的卡片
  function snapToNearest() {
    // 延遲一點點，讓慣性跑一下再吸附，體驗比較好
    setTimeout(() => {
      const center = carousel.offsetWidth / 2;
      const cards = document.querySelectorAll(".egg-card");
      let closest = null;
      let min = Infinity;

      cards.forEach((card) => {
        const cardCenter =
          card.offsetLeft + card.offsetWidth / 2 - carousel.scrollLeft;
        const dist = Math.abs(cardCenter - center);
        if (dist < min) {
          min = dist;
          closest = card;
        }
      });

      if (closest) {
        scrollToCard(closest);
      }
    }, 50);
  }

  btnChoose.addEventListener("click", () => {
    // ✅ 你原本的條件我先不碰（先讓流程回來）
    if (state.selectedEgg === "meat") {
      playCurtainTransition(() => {
        pages.select.style.display = "none";
        pages.select.classList.remove("active-page");
        pages.select.classList.add("hidden-page");
        pages.select.classList.remove("scrolled-up");

        pages.game.style.display = "flex";
        pages.game.classList.add("active-page");
        pages.game.classList.remove("hidden-page", "scrolled-up");

        resetGame();
      });
    }
  });
}

// 滑鼠拖曳邏輯
let isDown = false;
let startX;
let scrollLeft;

// --- 遊戲邏輯 ---
function initGame() {
  const pool = document.getElementById("ingredients-pool");
  const slots = document.querySelectorAll(".slot");
  const btnMagic = document.getElementById("btn-magic");
  const gameTip = document.getElementById("game-tip");
  if (gameTip) gameTip.remove();

  gameTip.onclick = () => (gameTip.style.display = "none");

  // 生成食材
  ingredients.forEach((ing, index) => {
    const img = document.createElement("img");
    img.src = `./img/${ing.img}`;
    img.className = "ingredient";
    const pos = ingredientPositions[index];
    img.style.position = "absolute";
    img.style.top = pos.top;
    img.style.left = pos.left;
    img.dataset.id = ing.id;

    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", ing.id);
      e.dataTransfer.effectAllowed = "move";
    });

    // 手機版點擊也可添加
    img.addEventListener("click", () => addIngredient(ing.id));
    pool.appendChild(img);
  });

  // 放置區
  const eggArea = document.getElementById("main-egg");
  eggArea.addEventListener("dragover", (e) => e.preventDefault());
  eggArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    addIngredient(parseInt(id));
  });

  btnMagic.addEventListener("click", () => {
    Sound.play(Sound.magic);
    playWhiteFadeTransition(showResult); // ✅ 只這裡白屏7秒
  });
}

function playWhiteFadeTransition(callback) {
  const whiteFade = document.getElementById("white-fade");
  const skipFadeBtn = document.getElementById("btn-skip-fade");

  const FADE_IN = 5500; // 白屏淡入時間
  const FADE_OUT = 700; // 白屏淡出時間

  let finished = false;

  function cleanup() {
    skipFadeBtn.style.display = "none";
    whiteFade.style.pointerEvents = "none";
  }

  function playResultSfxAfterFadeOut() {
    // ✅ showResult() 裡面會算出 state.lastResultIsFail
    setTimeout(() => {
      if (state.lastResultIsFail) playSfx(Sound.fail);
      else playSfx(Sound.success);
    }, FADE_OUT);
  }

  function finishEarly() {
    if (finished) return;
    finished = true;

    // 立刻淡出白屏
    whiteFade.style.transition = `opacity ${FADE_OUT}ms ease`;
    whiteFade.style.opacity = "0";

    cleanup();
    callback();
    playResultSfxAfterFadeOut();
  }

  // ✅ 讓 skip 可以點
  whiteFade.style.pointerEvents = "auto";
  skipFadeBtn.style.pointerEvents = "auto";

  // ✅ 顯示 Skip
  skipFadeBtn.style.display = "block";
  skipFadeBtn.onclick = finishEarly;

  // 白屏淡入
  whiteFade.style.transition = `opacity ${FADE_IN}ms linear`;
  whiteFade.style.opacity = "1";

  setTimeout(() => {
    if (finished) return;
    finished = true;

    // ✅ 正常結束：先進結局、再淡出白屏、白屏結束後才播結局音效
    callback();

    whiteFade.style.transition = `opacity ${FADE_OUT}ms ease`;
    whiteFade.style.opacity = "0";

    cleanup();
    playResultSfxAfterFadeOut();
  }, FADE_IN);
}

function addIngredient(id) {
  if (state.chosenIngredients.length >= 3) return;
  if (state.chosenIngredients.includes(id)) return;

  state.chosenIngredients.push(id);
  updateSlots();
  Sound.play(Sound.eat);
  const egg = document.getElementById("main-egg");

  // ✅ 讓桌面上的該食材消失（CSS: .ingredient.used { display:none; }）
  document.querySelectorAll(".ingredient").forEach((el) => {
    if (Number(el.dataset.id) === Number(id)) el.classList.add("used");
  });

  // 先清掉舊的計時器（避免連續餵食卡住）
  if (state.eggTimer) {
    clearTimeout(state.eggTimer);
    state.eggTimer = null;
  }

  egg.classList.add("eating"); // ✅ 吃飯開始：縮一點
  egg.src = EGG_EAT_SRC;

  // 等 GIF 播完才換回待機蛋
  state.eggTimer = setTimeout(() => {
    egg.classList.remove("eating"); // ✅ 吃完：恢復
    egg.src = EGG_IDLE_SRC;
    state.eggTimer = null;
  }, EGG_EAT_DURATION);

  // 下面原本你 addIngredient 裡的其他邏輯（例如顯示按鈕之類）照舊放就好
}

function removeIngredient(index) {
  if (state.chosenIngredients[index]) {
    const id = state.chosenIngredients[index];
    state.chosenIngredients.splice(index, 1);

    document.querySelectorAll(".ingredient").forEach((el) => {
      if (el.dataset.id == id) el.classList.remove("used");
    });
    updateSlots();
  }
}

function updateSlots() {
  const slots = document.querySelectorAll(".slot");
  const btnMagic = document.getElementById("btn-magic");

  slots.forEach((slot, i) => {
    const id = state.chosenIngredients[i];
    const removeBtn = slot.querySelector(".slot-remove");

    // 清空
    slot.innerHTML = "";

    if (id) {
      const ingData = ingredients.find((x) => x.id === id);
      // ✅ 有食材：顯示右上角叉叉
      slot.innerHTML = `<img src="./img/${ingData.img}">
                    <div class="slot-remove" style="display:block">x</div>`;

      slot.querySelector(".slot-remove").onclick = (e) => {
        e.stopPropagation();
        removeIngredient(i);
      };
    } else {
      // ✅ 空格：不要顯示叉叉
      slot.innerHTML = `<div class="slot-remove" style="display:none">x</div>`;
    }
  });

  if (state.chosenIngredients.length === 3) {
    btnMagic.style.display = "block";
  } else {
    btnMagic.style.display = "none";
  }
}

function resetGame() {
  state.chosenIngredients = [];
  updateSlots();
  document
    .querySelectorAll(".ingredient")
    .forEach((el) => el.classList.remove("used"));
  document.getElementById("btn-magic").style.display = "none";
}

// =========================================
//  5. 結果與圖鑑系統 (核心修改)
// =========================================
updateHands("page-result");
function showResult() {
  console.log("SHOW RESULT");
  pages.game.style.display = "none";
  pages.result.style.display = "flex";

  pages.result.classList.add("active-page");
  pages.result.classList.remove("hidden-page", "scrolled-up");

  // 1. 將選中的 ID 排序 (確保 1-2-3 和 3-2-1 是一樣的)
  const sortedIds = [...state.chosenIngredients].sort((a, b) => a - b);
  const comboKey = sortedIds.join("-"); // 變成 "1-2-3" 這種格式

  // 2. 查找配方
  let result = recipes[comboKey];

  // 3. 防呆：如果找不到配方 (應該不會發生)，給個預設值
  if (!result) {
    result = { name: "未知物體", img: "result_fail.png", isFail: true };
  }

  // 4. 解鎖並存檔
  if (!unlockedRecipes.includes(comboKey)) {
    unlockedRecipes.push(comboKey);
    localStorage.setItem("eggMagic_unlocked", JSON.stringify(unlockedRecipes));
  }

  // 5. 顯示畫面
  document.getElementById("result-img").src = `./img/${result.img}`;
  document.getElementById("result-name").innerText = result.name;
  document.getElementById("result-text").innerText = result.isFail
    ? "哎呀！好像變成了不可名狀的廚餘..."
    : "哇！大成功！這是新的食譜！";
  // 依是否為廚餘，切換對話框的背景圖
  const resultDialog = document.querySelector(".result-dialog");
  if (result.isFail) {
    resultDialog.classList.remove("success");
    resultDialog.classList.add("fail");
  } else {
    resultDialog.classList.remove("fail");
    resultDialog.classList.add("success");
  }

  // 按鈕
  document.getElementById("btn-res-retry").onclick = () => {
    playCurtainTransition(() => {
      pages.result.style.display = "none";
      pages.game.style.display = "block";
      resetGame();
    });
  };
  document.getElementById("btn-res-book").onclick = () => {
    playCurtainTransition(() => {
      // 關結果頁
      pages.result.style.display = "none";
      pages.result.classList.remove("active-page");
      pages.result.classList.add("hidden-page");
      pages.result.classList.remove("scrolled-up");

      // 先渲染圖鑑
      renderGallery();

      // ✅ 開圖鑑頁：用 flex（因為 full-page 是 flex 版型）
      pages.gallery.style.display = "flex";
      pages.gallery.classList.add("active-page");
      pages.gallery.classList.remove("hidden-page", "scrolled-up");
    });
  };

  state.lastResultIsFail = !!result.isFail;
}

function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  // 遍歷所有定義好的食譜
  Object.keys(recipes).forEach((key) => {
    const recipe = recipes[key];
    const isUnlocked = unlockedRecipes.includes(key);

    const card = document.createElement("div");
    card.className = "gallery-card";

    if (isUnlocked) {
      // 顯示已解鎖內容
      // 還原食材圖片
      const ingIds = key.split("-");
      const ingHtml = ingIds
        .map((id) => {
          const ing = ingredients.find((i) => i.id == id);
          return `<img src="./img/${ing.img}" class="mini-ing">`;
        })
        .join("");

      card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="./img/${recipe.img}" class="card-img">
                        <div class="card-name">${recipe.name}</div>
                    </div>
                    <div class="card-back">
                        <p>配方：</p>
                        <div class="card-ingredients">${ingHtml}</div>
                    </div>
                </div>
            `;
      card.onclick = () => card.classList.toggle("flipped");
    } else {
      // 顯示未解鎖
      card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front" style="background:#eee; justify-content:center;">
                        <div style="font-size:30px; color:#aaa;">?</div>
                        <div class="card-name">???</div>
                    </div>
                </div>
            `;
    }
    grid.appendChild(card);
  });

  document.getElementById("btn-gallery-back").onclick = () => {
    playCurtainTransition(() => {
      // 關圖鑑頁
      pages.gallery.style.display = "none";
      pages.gallery.classList.remove("active-page");
      pages.gallery.classList.add("hidden-page");
      pages.gallery.classList.remove("scrolled-up");

      // ✅ 回遊戲頁也用 flex（避免版型怪掉）
      pages.game.style.display = "flex";
      pages.game.classList.add("active-page");
      pages.game.classList.remove("hidden-page", "scrolled-up");

      resetGame();
    });
  };
}

// =========================================
//  6. 轉場與 UI
// =========================================
function scrollTransition(curr, next) {
  curr.classList.add("scrolled-up");
  curr.classList.remove("active-page");
  next.style.display = "flex";
  void next.offsetWidth;
  next.classList.remove("hidden-page");
  next.classList.add("active-page");

  // ✅ 自動更新手（next.id 就是 page-story / page-select 這種）
  updateHands(next.id);
}

function playCurtainTransition(callback) {
  const layer = document.getElementById("curtain-layer");

  // ✅ 布幕開始關上的瞬間：播音效
  if (Sound?.curtain) {
    Sound.curtain.currentTime = 0; // 每次從頭播
    Sound.curtain.play().catch(() => {});
  }

  // 關布幕
  layer.classList.add("curtains-closed");

  // 等布幕關上
  setTimeout(() => {
    if (callback) callback();

    // 再等一下，打開布幕
    setTimeout(() => {
      layer.classList.remove("curtains-closed");
    }, 500);
  }, 800);

  // （你現在已經刪掉其他頁的手，這行留著或刪掉都沒影響）
  updateHands("page-game");
}

updateHands("page-gallery"); // 這個 pageId 你沒寫分支 → 會全部隱藏（正好）

function initTopUI() {
  const modal = document.getElementById("tutorial-modal");
  const btnHelp = document.getElementById("btn-tutorial");
  if (btnHelp && modal) {
    btnHelp.onclick = () => {
      modal.style.display = "flex";
    };
    const closeBtn = modal.querySelector(".close-btn");
    if (closeBtn)
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".img-btn")) {
    Sound?.play?.(Sound.uiClick);
  }
});

// =========================================
// 🎵 BGM：第一次互動後啟動
// =========================================
let bgmStarted = false;

document.addEventListener(
  "click",
  () => {
    if (!bgmStarted && !Sound.muted) {
      Sound.bgm.play().catch(() => {});
      bgmStarted = true;
    }
  },
  { once: true }
);
const btnSound = document.getElementById("btn-sound");

btnSound?.addEventListener("click", () => {
  Sound.muted = !Sound.muted;

  if (Sound.muted) {
    Sound.bgm.pause();
    btnSound.classList.add("muted");
  } else {
    Sound.bgm.play().catch(() => {});
    btnSound.classList.remove("muted");
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateHands(pageId) {
  // 全部先藏
  document
    .querySelectorAll(".hand-video")
    .forEach((v) => v.classList.remove("show"));

  // 介紹頁：手 A
  if (pageId === "page-story") {
    document.getElementById("hand-intro")?.classList.add("show");
  }

  // 主食選擇頁 + 完結頁：同一組手 B
  if (pageId === "page-select" || pageId === "page-result") {
    document.getElementById("hand-idle")?.classList.add("show");
  }

  // 廚房頁：手 C
  if (pageId === "page-game") {
    document.getElementById("hand-kitchen")?.classList.add("show");
  }

  function updateHands(pageId) {
    return; // 🔥 直接停用
  }
}

function startHandsCarouselById(wrapId, intervalMs = 700) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;

  const frames = Array.from(wrap.querySelectorAll(".hand-frame"));
  if (frames.length <= 1) return;

  let idx = 0;
  frames.forEach((img, i) => img.classList.toggle("show", i === 0));

  // 每個輪播各自一個 timer
  const key = `__handsTimer_${wrapId}`;
  if (window[key]) clearInterval(window[key]);

  window[key] = setInterval(() => {
    frames[idx].classList.remove("show");
    idx = (idx + 1) % frames.length;
    frames[idx].classList.add("show");
  }, intervalMs);
}

// ================================
// Intro 手部輪播（修復缺失）
// ================================
function startIntroHandsCarousel() {
  const wrap = document.getElementById("hands-intro");
  if (!wrap) return;

  const frames = Array.from(wrap.querySelectorAll(".hand-frame"));
  if (frames.length <= 1) return;

  let idx = 0;
  frames.forEach((img, i) => img.classList.toggle("show", i === 0));

  if (window.__introHandsTimer) {
    clearInterval(window.__introHandsTimer);
  }

  window.__introHandsTimer = setInterval(() => {
    frames[idx].classList.remove("show");
    idx = (idx + 1) % frames.length;
    frames[idx].classList.add("show");
  }, 700); // 跟你之前說的一樣節奏
}
