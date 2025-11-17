import { app } from "/scripts/app.js";

const PARTS_DEFINITION = {
  "头部": [
    { label: "帽子", value: "hat", icon: "🎩" },
    { label: "头发", value: "hair", icon: "💇" },
    { label: "眼镜", value: "sunglasses", icon: "🕶️" },
    { label: "面部", value: "face", icon: "🙂" },
    { label: "眼睛", value: "eyes", icon: "👀" },
    { label: "鼻子", value: "nose", icon: "👃" },
    { label: "嘴巴", value: "mouth", icon: "👄" },
    { label: "耳朵", value: "ears", icon: "👂" },
    { label: "胡子", value: "beard", icon: "🧔" },
    { label: "小胡子", value: "mustache", icon: "🧔" },
    { label: "耳饰", value: "earrings", icon: "💎" },
  ],
  "上身": [
    { label: "上衣", value: "upper-clothes", icon: "👕" },
    { label: "外套", value: "coat", icon: "🧥" },
    { label: "连衣裙", value: "dress", icon: "👗" },
    { label: "围巾", value: "scarf", icon: "🧣" },
    { label: "腰带", value: "belt", icon: "🧷" },
    { label: "包袋", value: "bag", icon: "👜" },
    { label: "T恤", value: "tshirt", icon: "👕" },
    { label: "衬衫", value: "shirt", icon: "👔" },
    { label: "毛衣", value: "sweater", icon: "🧶" },
    { label: "卫衣", value: "hoodie", icon: "🧥" },
    { label: "领带", value: "tie", icon: "👔" },
    { label: "项链", value: "necklace", icon: "📿" },
  ],
  "下身": [
    { label: "裤子", value: "pants", icon: "👖" },
    { label: "裙子", value: "skirt", icon: "🩳" },
    { label: "短裤", value: "shorts", icon: "🩳" },
    { label: "牛仔裤", value: "jeans", icon: "👖" },
    { label: "打底裤", value: "leggings", icon: "🦵" },
    { label: "内衣", value: "underwear", icon: "🩲" },
    { label: "丝袜", value: "stockings", icon: "🧦" },
  ],
  "四肢": [
    { label: "左臂", value: "left-arm", icon: "💪" },
    { label: "右臂", value: "right-arm", icon: "💪" },
    { label: "手套", value: "gloves", icon: "🧤" },
    { label: "左腿", value: "left-leg", icon: "🦵" },
    { label: "右腿", value: "right-leg", icon: "🦵" },
    { label: "左手", value: "left-hand", icon: "✋" },
    { label: "右手", value: "right-hand", icon: "🤚" },
    { label: "手指", value: "fingers", icon: "🖐️" },
    { label: "左膝", value: "left-knee", icon: "🦵" },
    { label: "右膝", value: "right-knee", icon: "🦵" },
  ],
  "足部": [
    { label: "左脚", value: "left-foot", icon: "🦶" },
    { label: "右脚", value: "right-foot", icon: "🦶" },
    { label: "袜子", value: "socks", icon: "🧦" },
    { label: "左鞋", value: "left-shoe", icon: "👟" },
    { label: "右鞋", value: "right-shoe", icon: "👟" },
    { label: "靴子", value: "boots", icon: "🥾" },
    { label: "高跟鞋", value: "high-heels", icon: "👠" },
    { label: "凉鞋", value: "sandals", icon: "🩴" },
    { label: "拖鞋", value: "slippers", icon: "🥿" },
  ],
  "背景": [
    { label: "背景", value: "background", icon: "🖼️" },
    { label: "天空", value: "sky", icon: "☁️" },
    { label: "建筑", value: "building", icon: "🏙️" },
    { label: "植被", value: "vegetation", icon: "🌿" },
    { label: "山地", value: "mountain", icon: "⛰️" },
    { label: "水域", value: "water", icon: "🌊" },
    { label: "河流", value: "river", icon: "🏞️" },
    { label: "海洋", value: "sea", icon: "🌊" },
    { label: "地面", value: "ground", icon: "🛣️" },
    { label: "道路", value: "road", icon: "🛣️" },
    { label: "墙壁", value: "wall", icon: "🧱" },
    { label: "窗户", value: "window", icon: "🪟" },
    { label: "门", value: "door", icon: "🚪" },
    { label: "家具", value: "furniture", icon: "🛋️" },
    { label: "桌子", value: "table", icon: "🍽️" },
    { label: "椅子", value: "chair", icon: "🪑" },
    { label: "床", value: "bed", icon: "🛏️" },
  ],
  "物品": [
    { label: "手机", value: "phone", icon: "📱" },
    { label: "相机", value: "camera", icon: "📷" },
    { label: "笔记本电脑", value: "laptop", icon: "💻" },
    { label: "键盘", value: "keyboard", icon: "⌨️" },
    { label: "鼠标", value: "mouse", icon: "🖱️" },
    { label: "耳机", value: "headphones", icon: "🎧" },
    { label: "手表", value: "watch", icon: "⌚" },
    { label: "钱包", value: "wallet", icon: "👛" },
    { label: "钥匙", value: "keys", icon: "🔑" },
    { label: "书籍", value: "book", icon: "📚" },
    { label: "钢笔", value: "pen", icon: "🖊️" },
    { label: "雨伞", value: "umbrella", icon: "☂️" },
    { label: "杯子", value: "cup", icon: "☕" },
    { label: "水瓶", value: "bottle", icon: "🧴" },
    { label: "餐具", value: "cutlery", icon: "🍴" },
    { label: "苹果", value: "apple", icon: "🍎" },
    { label: "花朵", value: "flower", icon: "🌸" },
    { label: "吉他", value: "guitar", icon: "🎸" },
    { label: "钢琴", value: "piano", icon: "🎹" },
    { label: "小提琴", value: "violin", icon: "🎻" },
    { label: "玩具", value: "toy", icon: "🧸" },
    { label: "球", value: "ball", icon: "⚽" },
    { label: "自行车", value: "bicycle", icon: "🚲" },
    { label: "摩托车", value: "motorcycle", icon: "🏍️" },
    { label: "汽车", value: "car", icon: "🚗" },
    { label: "背包", value: "backpack", icon: "🎒" },
    { label: "香水", value: "perfume", icon: "🧴" },
    { label: "化妆品", value: "makeup", icon: "💅" },
    { label: "口红", value: "lipstick", icon: "💄" },
    { label: "书包", value: "schoolbag", icon: "🎒" },
  ],
  "武器": [
    { label: "刀", value: "knife", icon: "🔪" },
    { label: "匕首", value: "dagger", icon: "🗡️" },
    { label: "剑", value: "sword", icon: "⚔️" },
    { label: "武士刀", value: "katana", icon: "🗡️" },
    { label: "斧头", value: "axe", icon: "🪓" },
    { label: "锤", value: "hammer", icon: "🔨" },
    { label: "矛", value: "spear", icon: "🗡️" },
    { label: "盾牌", value: "shield", icon: "🛡️" },
    { label: "弓", value: "bow", icon: "🏹" },
    { label: "箭", value: "arrow", icon: "🏹" },
    { label: "弩", value: "crossbow", icon: "🏹" },
    { label: "手枪", value: "pistol", icon: "🔫" },
    { label: "左轮", value: "revolver", icon: "🔫" },
    { label: "步枪", value: "rifle", icon: "🔫" },
    { label: "霰弹枪", value: "shotgun", icon: "🔫" },
    { label: "机枪", value: "machine-gun", icon: "🔫" },
    { label: "手榴弹", value: "grenade", icon: "💣" },
    { label: "炸药", value: "dynamite", icon: "🧨" },
    { label: "长棍", value: "staff", icon: "🪄" },
    { label: "长鞭", value: "whip", icon: "🪢" }
  ],
  "载具": [
    { label: "自行车", value: "bicycle", icon: "🚲" },
    { label: "电动车", value: "electric-bike", icon: "🚲" },
    { label: "摩托车", value: "motorcycle", icon: "🏍️" },
    { label: "踏板车", value: "scooter", icon: "🛴" },
    { label: "汽车", value: "car", icon: "🚗" },
    { label: "SUV", value: "suv", icon: "🚙" },
    { label: "面包车", value: "van", icon: "🚐" },
    { label: "出租车", value: "taxi", icon: "🚕" },
    { label: "公交车", value: "bus", icon: "🚌" },
    { label: "卡车", value: "truck", icon: "🚛" },
    { label: "货车", value: "delivery-truck", icon: "🚚" },
    { label: "火车", value: "train", icon: "🚆" },
    { label: "地铁", value: "subway", icon: "🚇" },
    { label: "有轨电车", value: "tram", icon: "🚊" },
    { label: "飞机", value: "airplane", icon: "✈️" },
    { label: "直升机", value: "helicopter", icon: "🚁" },
    { label: "火箭", value: "rocket", icon: "🚀" },
    { label: "卫星", value: "satellite", icon: "🛰️" },
    { label: "快艇", value: "speedboat", icon: "🚤" },
    { label: "机动船", value: "motor-boat", icon: "🛥️" },
    { label: "帆船", value: "sailboat", icon: "⛵" },
    { label: "轮船", value: "ship", icon: "🚢" },
    { label: "渡轮", value: "ferry", icon: "🛳️" },
    { label: "独木舟", value: "canoe", icon: "🛶" },
    { label: "皮划艇", value: "kayak", icon: "🛶" }
  ],
};

 

const I18N = {
  zh: {
    selected: n => `已选 ${n} 个选项`,
    select_all: "全选",
    clear: "清空",
    expand_all: "全部展开",
  },
  en: {
    selected: n => `Selected ${n}`,
    select_all: "Select All",
    clear: "Clear",
    expand_all: "Expand All",
  },
};

const VALUE_TO_LABEL_ZH = (() => {
  const m = {};
  Object.values(PARTS_DEFINITION).forEach(items => items.forEach(i => { m[i.value] = i.label; }));
  return m;
})();

 

 

function createPanel(uniqueId, node, state, rerender) {
  const panel = document.createElement("div");
  panel.id = uniqueId;
  panel.style.cssText = `
    width: 100%;
    background: linear-gradient(145deg,#141e33,#1c253b);
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 12px;
    box-sizing: border-box;
  `;
  const selectedCount = document.createElement("div");
  const tpack = I18N.zh;
  selectedCount.textContent = tpack.selected(state.selected.size);
  selectedCount.style.cssText = `font-weight:600; margin-bottom:8px;`;
  panel.appendChild(selectedCount);

  const barTop = document.createElement("div");
  barTop.style.cssText = `display:flex; gap:6px; align-items:center; margin:6px 0; justify-content:space-between; width:100%;`;

  const btnAll = document.createElement("button");
  btnAll.textContent = tpack.select_all;
  btnAll.style.cssText = `
    padding:6px 10px; border-radius:6px; border:none; cursor:pointer;
    background:linear-gradient(145deg,#22c55e,#16a34a); color:white; font-size:12px; line-height:16px;
  `;
  btnAll.onclick = async () => { state.selected = new Set(Object.values(PARTS_DEFINITION).flat().map(i => i.value)); await pushSelected(node, state); rerender(); };

  const btnClear = document.createElement("button");
  btnClear.textContent = tpack.clear;
  btnClear.style.cssText = `
    padding:6px 10px; border-radius:6px; border:none; cursor:pointer;
    background:#6b7280; color:white; font-size:12px; line-height:16px;
  `;
  btnClear.onclick = async () => { state.selected = new Set(); await pushSelected(node, state); rerender(); };

  const expandAllWrap = document.createElement("label");
  expandAllWrap.style.cssText = `display:inline-flex; align-items:center; gap:6px; color:#e5e7eb; font-size:12px;`;
  const expandAllInput = document.createElement("input");
  expandAllInput.type = "checkbox";
  expandAllInput.checked = !!state.expandAll;
  expandAllInput.onchange = () => { state.expandAll = !!expandAllInput.checked; rerender(); };
  const expandAllText = document.createElement("span");
  expandAllText.textContent = tpack.expand_all;
  expandAllWrap.appendChild(expandAllInput);
  expandAllWrap.appendChild(expandAllText);

  

  const barLeft = document.createElement("div");
  barLeft.style.cssText = `display:flex; gap:6px; align-items:center;`;
  barLeft.appendChild(btnAll);
  barLeft.appendChild(btnClear);
  barTop.appendChild(barLeft);
  panel.appendChild(barTop);

  const barBottom = document.createElement("div");
  barBottom.style.cssText = `display:flex; gap:6px; align-items:center; margin:6px 0; width:100%;`;
  barBottom.appendChild(expandAllWrap);
  panel.appendChild(barBottom);

  Object.entries(PARTS_DEFINITION).forEach(([title, items]) => {
    const sec = document.createElement("div");
    const h = document.createElement("div");
    const isOpen = !!state.expandAll || !!state.sectionOpen?.[title];
    h.textContent = `${isOpen ? "▼" : "▶"} ${title}`;
    h.style.cssText = `font-weight:600; margin:12px 4px 6px; cursor:pointer; user-select:none;`;
    h.onclick = () => {
      state.sectionOpen = state.sectionOpen || {};
      const now = !!state.sectionOpen[title];
      state.sectionOpen[title] = !now;
      rerender();
    };
    const grid = document.createElement("div");
    grid.style.cssText = `display:${isOpen ? "grid" : "none"}; grid-template-columns: repeat(auto-fill, 88px); gap:6px;`;
    items.forEach(item => {
      const match = true;
      const chip = document.createElement("button"); chip.type = "button"; chip.textContent = `${item.icon} ${item.label}`;
      const active = state.selected.has(item.value);
    chip.style.cssText = `
      display:inline-flex; align-items:center; justify-content:center; gap:6px;
      width:88px; padding:6px 8px; border-radius:10px; border:1px solid rgba(59,130,246,.35);
      background: ${active ? "linear-gradient(145deg,#2563eb,#1d4ed8)" : "rgba(15,23,42,.3)"};
      color: ${active ? "#fff" : "#e5e7eb"}; cursor:pointer; transition:all .2s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:12px;
    `;
      chip.onclick = async () => { if (state.selected.has(item.value)) state.selected.delete(item.value); else state.selected.add(item.value); await pushSelected(node, state); rerender(); };
      grid.appendChild(chip);
    });
    sec.appendChild(h); sec.appendChild(grid); panel.appendChild(sec);
  });

  
  return panel;
}

async function pushSelected(node, state) {
  try {
    const parts = Array.from(state.selected);
    const parts_text = parts.map(v => VALUE_TO_LABEL_ZH[v] || v);
    state.seq = (state.seq || 0) + 1;
    const seq = state.seq;
    let w = (node.widgets || []).find(w => w && w.name === "preset_seq");
    if (!w && node.addWidget) {
      w = node.addWidget("number", "preset_seq", 0, () => {});
      if (w) { w.hidden = true; w.serialize = true; }
    }
    if (w) w.value = seq;
    await fetch(`/zhihui_nodes/segmentation_preset/set/${node.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parts, parts_text, seq })
    });
  } catch (_) {}
}

async function pullSelected(node, state) {
  try {
    const resp = await fetch(`/zhihui_nodes/segmentation_preset/get/${node.id}`);
    const data = await resp.json();
    const parts = Array.isArray(data?.parts) ? data.parts : [];
    state.selected = new Set(parts);
    
  } catch (_) {}
}

app.registerExtension({
  name: "Sa2VA.SegmentationPreset",
  async beforeRegisterNodeDef(nodeType, nodeData, app_) {
    if (nodeData.name === "Sa2VASegmentationPreset") {
      const onNodeCreated = nodeType.prototype.onNodeCreated;
      nodeType.prototype.onNodeCreated = function() {
        const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
        const selectedWidget = null;
        const state = {
          selected: new Set(),
          query: "",
          sectionOpen: {},
          expandAll: false,
          
          
        };
        const seqWidget = this.addWidget("number", "preset_seq", 0, () => {});
        seqWidget.hidden = true;
        seqWidget.serialize = true;
        const uniqueId = `segmentation-preset-${Math.random().toString(36).substring(2, 9)}`;
        const host = document.createElement("div");
        const domWidget = this.addDOMWidget("segmentation_preset_selector", "div", host, {});
        const rerender = () => {
          host.innerHTML = "";
          const panel = createPanel(uniqueId, this, state, rerender);
          host.appendChild(panel);
          const desiredH = Math.max(420, (panel.scrollHeight || panel.offsetHeight || 420) + 24);
          this.size[1] = desiredH;
          this.size[0] = Math.max(this.size[0], 520);
          requestAnimationFrame(() => {
            const sz = this.computeSize();
            this.onResize?.(sz);
            app_.graph.setDirtyCanvas(true, false);
          });
        };
        pullSelected(this, state).then(() => { rerender(); pushSelected(this, state); });
        return r;
      };
    }
  }
});