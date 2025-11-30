import os
import json
from typing import Dict
from aiohttp import web
from server import PromptServer

class PromptCardSelector:
    CATEGORY = "Zhi.AI/Generator"
    FUNCTION = "output"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    OUTPUT_NODE = True

    def __init__(self):
        self.text = ""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    @classmethod
    def IS_CHANGED(cls, unique_id=None, extra_pnginfo=None):
        import time
        return time.time()

    def output(self, unique_id=None, extra_pnginfo=None):
        try:
            st = self.load_settings()
            mode = st.get('mode', 'random')
            split_rule = st.get('split_rule', 'auto')
            names = st.get('selected', [])
            res = self.select_prompt_cards(mode=mode, count=1, names=names, split_rule=split_rule)
            txt = str(res.get('text') or '')
            self.text = txt
            return (txt,)
        except Exception:
            return (self.text or "",)

    PROMPT_CARD_POOL_DIR = os.path.join(os.path.dirname(__file__), "Built-in")
    USER_PROMPT_CARD_POOL_DIR = os.path.join(os.path.dirname(__file__), "User-defined")
    AUTH_PHRASE = "我已知晓后果"
    prompt_card_indices: Dict[str, int] = {}
    prompt_card_random_orders: Dict[str, Dict] = {}
    SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "prompt_card_pool_settings.json")

    @classmethod
    def _ensure_card_pool_dir(cls):
        try:
            os.makedirs(cls.PROMPT_CARD_POOL_DIR, exist_ok=True)
            os.makedirs(cls.USER_PROMPT_CARD_POOL_DIR, exist_ok=True)
        except Exception:
            pass

    @classmethod
    def list_prompt_cards(cls):
        cls._ensure_card_pool_dir()
        files = []
        try:
            for root, _, fns in os.walk(cls.PROMPT_CARD_POOL_DIR):
                for fn in fns:
                    if fn.lower().endswith('.txt'):
                        rel = os.path.relpath(os.path.join(root, fn), cls.PROMPT_CARD_POOL_DIR)
                        rel = rel.replace('\\', '/')
                        files.append({"name": rel, "source": "system"})
            for root, _, fns in os.walk(cls.USER_PROMPT_CARD_POOL_DIR):
                for fn in fns:
                    if fn.lower().endswith('.txt'):
                        rel = os.path.relpath(os.path.join(root, fn), cls.USER_PROMPT_CARD_POOL_DIR)
                        rel = rel.replace('\\', '/')
                        files.append({"name": rel, "source": "user"})
        except Exception as e:
            print(f"Error walking prompt card pool: {e}")
        files.sort(key=lambda x: (x.get("source", "system"), x.get("name", "")))
        return files

    @classmethod
    def read_prompt_card(cls, name: str, source: str = "system") -> str:
        cls._ensure_card_pool_dir()
        rel = (name or '').replace('/', os.sep).replace('\\', os.sep)
        base_dir = cls.PROMPT_CARD_POOL_DIR if source == "system" else cls.USER_PROMPT_CARD_POOL_DIR
        path = os.path.normpath(os.path.join(base_dir, rel))
        try:
            base = os.path.normpath(base_dir)
            if not path.startswith(base):
                return ""
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading prompt card {name}: {e}")
            return ""

    @classmethod
    def save_prompt_card(cls, name: str, content: str, source: str = "user", confirm: str = None) -> bool:
        cls._ensure_card_pool_dir()
        nm = (name or '').strip()
        if not nm.lower().endswith('.txt'):
            nm += '.txt'
        rel = nm.replace('/', os.sep).replace('\\', os.sep)
        base_dir = cls.PROMPT_CARD_POOL_DIR if source == "system" else cls.USER_PROMPT_CARD_POOL_DIR
        if source == "system" and confirm != cls.AUTH_PHRASE:
            return False
        path = os.path.normpath(os.path.join(base_dir, rel))
        try:
            base = os.path.normpath(base_dir)
            if not path.startswith(base):
                return False
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content or '')
            return True
        except Exception as e:
            print(f"Error saving prompt card {nm}: {e}")
            return False

    @classmethod
    def delete_prompt_card(cls, name: str, source: str = "user", confirm: str = None) -> bool:
        cls._ensure_card_pool_dir()
        rel = (name or '').replace('/', os.sep).replace('\\', os.sep)
        base_dir = cls.PROMPT_CARD_POOL_DIR if source == "system" else cls.USER_PROMPT_CARD_POOL_DIR
        if source == "system" and confirm != cls.AUTH_PHRASE:
            return False
        path = os.path.normpath(os.path.join(base_dir, rel))
        try:
            base = os.path.normpath(base_dir)
            if not path.startswith(base):
                return False
            if os.path.exists(path):
                os.remove(path)
            return True
        except Exception as e:
            print(f"Error deleting prompt card {name}: {e}")
            return False

    @classmethod
    def load_settings(cls):
        try:
            if os.path.isfile(cls.SETTINGS_FILE):
                with open(cls.SETTINGS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = {}
        except Exception:
            data = {}
        mode = str(data.get('mode', 'random') or 'random')
        split_rule = str(data.get('split_rule', 'auto') or 'auto')
        load_mode = str(data.get('load_mode', 'single') or 'single')
        pool_shuffle = str(data.get('pool_shuffle', 'sequential') or 'sequential')
        loaded_selected = []
        try:
            sel = data.get('selected', [])
            if isinstance(sel, list):
                seen = set()
                for it in sel:
                    if isinstance(it, dict):
                        nm = str(it.get('name', '') or '')
                        src = str(it.get('source', 'system') or 'system')
                        if nm:
                            key = src + '|' + nm
                            if key not in seen:
                                seen.add(key)
                                loaded_selected.append({'name': nm, 'source': src})
        except Exception:
            loaded_selected = []
        if mode not in ('random', 'sequential'):
            mode = 'random'
        if split_rule not in ('blankline', 'newline', 'auto'):
            split_rule = 'auto'
        if load_mode not in ('single', 'multi'):
            load_mode = 'single'
        if pool_shuffle not in ('random', 'sequential'):
            pool_shuffle = 'sequential'
        return {"mode": mode, "split_rule": split_rule, "load_mode": load_mode, "pool_shuffle": pool_shuffle, "selected": loaded_selected}

    @classmethod
    def save_settings(cls, settings: Dict):
        try:
            safe = cls.load_settings()
            if isinstance(settings, dict):
                m = str(settings.get('mode', safe['mode']) or safe['mode'])
                s = str(settings.get('split_rule', safe['split_rule']) or safe['split_rule'])
                l = str(settings.get('load_mode', safe['load_mode']) or safe['load_mode'])
                p = str(settings.get('pool_shuffle', safe['pool_shuffle']) or safe['pool_shuffle'])
                if m in ('random', 'sequential'):
                    safe['mode'] = m
                if s in ('blankline', 'newline', 'auto'):
                    safe['split_rule'] = s
                if l in ('single', 'multi'):
                    safe['load_mode'] = l
                if p in ('random', 'sequential'):
                    safe['pool_shuffle'] = p
                sel = settings.get('selected')
                if isinstance(sel, list):
                    merged = []
                    seen = set()
                    for it in sel:
                        if isinstance(it, dict):
                            nm = str(it.get('name', '') or '')
                            src = str(it.get('source', 'system') or 'system')
                            if nm:
                                key = src + '|' + nm
                                if key not in seen:
                                    seen.add(key)
                                    merged.append({'name': nm, 'source': src})
                    safe['selected'] = merged
            with open(cls.SETTINGS_FILE, 'w', encoding='utf-8') as f:
                json.dump(safe, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving settings: {e}")
            return False

    @classmethod
    def select_prompt_cards(cls, mode: str = 'random', count: int = 1, names=None, split_rule: str = None):
        files = names if names and isinstance(names, list) and len(names) > 0 else cls.list_prompt_cards()
        if not files:
            return {"text": "", "names": []}
        count = max(1, int(count or 1))
        selected = files[:]
        pool_shuffle = None
        try:
            # allow pool shuffle from settings by default
            st = cls.load_settings()
            pool_shuffle = str(st.get('pool_shuffle') or 'sequential')
        except Exception:
            pool_shuffle = 'sequential'
        try:
            # If names items carry an override (dict with pool_shuffle), honor it
            if isinstance(names, dict):
                ps = names.get('pool_shuffle')
                if isinstance(ps, str):
                    pool_shuffle = ps
        except Exception:
            pass
        if pool_shuffle == 'random':
            try:
                import random as _rand
                _rand.shuffle(selected)
            except Exception:
                pass
        def _split(text: str, rule: str):
            try:
                t = (text or '').strip()
                if not t:
                    return []
                if rule == 'newline':
                    return [ln.strip() for ln in t.splitlines() if ln.strip()]
                if rule == 'blankline':
                    import re
                    return [blk.strip() for blk in re.split(r'(?:\r?\n\s*){2,}', t) if blk.strip()]
                if rule == 'auto':
                    import re
                    if re.search(r'\r?\n\s*\r?\n', t):
                        return [blk.strip() for blk in re.split(r'(?:\r?\n\s*){2,}', t) if blk.strip()]
                    return [ln.strip() for ln in t.splitlines() if ln.strip()]
                return [t]
            except Exception:
                return []
        segments = []
        for item in selected:
            if isinstance(item, dict):
                nm = item.get('name', '')
                src = item.get('source', 'system')
            else:
                nm = item
                src = 'system'
            txt = cls.read_prompt_card(nm, src)
            parts = _split(txt, split_rule)
            if parts:
                segments.extend(parts)
        # de-duplicate segments by text content (trimmed)
        try:
            _seen = set()
            _uniq = []
            for _seg in segments:
                _k = (_seg or '').strip()
                if _k and _k not in _seen:
                    _seen.add(_k)
                    _uniq.append(_seg)
            segments = _uniq
        except Exception:
            pass
        if not segments:
            return {"text": "", "names": selected}
        chosen = []
        if mode == 'sequential':
            key = (split_rule or 'none') + '|psh:' + str(pool_shuffle or 'sequential') + '|' + '|'.join([f if isinstance(f, str) else f.get('name', '') + '|' + f.get('source', 'system') for f in files])
            idx = cls.prompt_card_indices.get(key, 0)
            for i in range(count):
                chosen.append(segments[(idx + i) % len(segments)])
            cls.prompt_card_indices[key] = (idx + count) % len(segments)
        else:
            try:
                import random as _rand
                if count >= len(segments):
                    chosen = segments[:]
                else:
                    key = 'random|' + (split_rule or 'none') + '|psh:' + str(pool_shuffle or 'sequential') + '|' + '|'.join([f if isinstance(f, str) else f.get('name', '') + '|' + f.get('source', 'system') for f in files])
                    ro = cls.prompt_card_random_orders.get(key)
                    if (not ro) or ro.get('segments_len') != len(segments):
                        order = list(range(len(segments)))
                        _rand.shuffle(order)
                        cls.prompt_card_random_orders[key] = {'order': order, 'pos': 0, 'segments_len': len(segments)}
                        ro = cls.prompt_card_random_orders.get(key)
                    order = ro['order']
                    pos = int(ro.get('pos', 0) or 0)
                    end = pos + count
                    picks = []
                    if end <= len(order):
                        picks = order[pos:end]
                        ro['pos'] = end
                    else:
                        tail = order[pos:]
                        order2 = list(range(len(segments)))
                        _rand.shuffle(order2)
                        need = count - len(tail)
                        picks = tail + order2[:need]
                        cls.prompt_card_random_orders[key] = {'order': order2, 'pos': need, 'segments_len': len(segments)}
                    chosen = [segments[i] for i in picks]
            except Exception:
                chosen = segments[:count]
        out = '\n'.join([c for c in chosen if c])
        return {"text": out, "names": selected}

@PromptServer.instance.routes.get('/zhihui/prompt_cards')
async def get_prompt_cards(request):
    try:
        files = PromptCardSelector.list_prompt_cards()
        return web.json_response({"files": files})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get('/zhihui/prompt_card')
async def get_prompt_card_content(request):
    try:
        name = request.query.get('name', '')
        source = request.query.get('source', 'system')
        content = PromptCardSelector.read_prompt_card(name, source)
        return web.json_response({"name": name, "content": content})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post('/zhihui/prompt_cards')
async def save_prompt_card(request):
    try:
        data = await request.json()
        name = data.get('name', '').strip()
        content = data.get('content', '')
        source = data.get('source', 'user')
        confirm = data.get('confirm')
        if not name:
            return web.json_response({"error": "名称不能为空"}, status=400)
        ok = PromptCardSelector.save_prompt_card(name, content, source, confirm)
        if ok:
            return web.json_response({"success": True})
        else:
            msg = "保存失败"
            if source == 'system' and (not confirm or confirm != PromptCardSelector.AUTH_PHRASE):
                msg = "修改系统条目需要授权指令"
            return web.json_response({"error": msg}, status=403 if source == 'system' else 500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.delete('/zhihui/prompt_cards')
async def delete_prompt_card(request):
    try:
        data = await request.json()
        name = data.get('name', '').strip()
        source = data.get('source', 'user')
        confirm = data.get('confirm')
        if not name:
            return web.json_response({"error": "名称不能为空"}, status=400)
        ok = PromptCardSelector.delete_prompt_card(name, source, confirm)
        if ok:
            return web.json_response({"success": True})
        else:
            msg = "删除失败"
            if source == 'system' and (not confirm or confirm != PromptCardSelector.AUTH_PHRASE):
                msg = "删除系统条目需要授权指令"
            return web.json_response({"error": msg}, status=403 if source == 'system' else 500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post('/zhihui/prompt_cards/select')
async def select_prompt_cards(request):
    try:
        data = await request.json()
        mode = data.get('mode', 'random')
        count = int(data.get('count', 1))
        names = data.get('names')
        split_rule = data.get('split_rule')
        pool_shuffle = data.get('pool_shuffle')
        names_param = names
        if pool_shuffle is not None:
            names_param = names if isinstance(names, list) else []
            try:
                st = PromptCardSelector.load_settings()
                st['pool_shuffle'] = str(pool_shuffle)
                PromptCardSelector.save_settings(st)
            except Exception:
                pass
        res = PromptCardSelector.select_prompt_cards(mode, count, names_param, split_rule)
        return web.json_response(res)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get('/zhihui/prompt_cards/settings')
async def get_prompt_card_settings(request):
    try:
        st = PromptCardSelector.load_settings()
        return web.json_response(st)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post('/zhihui/prompt_cards/settings')
async def save_prompt_card_settings(request):
    try:
        data = await request.json()
        ok = PromptCardSelector.save_settings(data or {})
        if ok:
            return web.json_response({"success": True})
        return web.json_response({"error": "保存失败"}, status=500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
