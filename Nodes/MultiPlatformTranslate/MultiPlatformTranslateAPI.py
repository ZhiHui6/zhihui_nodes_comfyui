import os
import json
import requests
import hashlib
import time
import random
import hmac
import base64
from urllib.parse import quote
import uuid
import os
import json
import requests
import time
import random
import hashlib
from aiohttp import web

try:
    from server import PromptServer
    PROMPT_SERVER_AVAILABLE = True
except ImportError:
    print("警告: 无法导入PromptServer，API配置功能将不可用")
    PROMPT_SERVER_AVAILABLE = False
    PromptServer = None

class MultiPlatformTranslateAPI:
    def __init__(self):
        self.config_path = os.path.join(os.path.dirname(__file__), "MultiPlatformTranslateConfig.json")
        self.config = self.load_config()

    def load_config(self):
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load config file: {e}")
            return self.get_default_config()

    def get_default_config(self):
        return {
            "platforms": {
                "baidu": {
                    "name": "百度翻译",
                    "enabled": True,
                    "config": {"app_id": "", "api_key": ""},
                    "api_url": "https://fanyi-api.baidu.com/api/trans/vip/translate"
                },
                "aliyun": {
                    "name": "阿里云翻译",
                    "enabled": True,
                    "config": {"access_key_id": "", "access_key_secret": ""},
                    "api_url": "https://mt.cn-hangzhou.aliyuncs.com"
                },
                "youdao": {
                    "name": "有道翻译",
                    "enabled": True,
                    "config": {"app_key": "", "app_secret": ""},
                    "api_url": "https://openapi.youdao.com/api"
                },
                "zhipu": {
                    "name": "智谱AI翻译",
                    "enabled": True,
                    "config": {"api_key": "", "model": "glm-4-flash"},
                    "api_url": "https://open.bigmodel.cn/api/paas/v4/chat/completions"
                },
                "free": {
                    "name": "免费翻译",
                    "enabled": True,
                    "config": {},
                    "api_url": "https://transmart.qq.com/api/imt"
                }
            },
            "default_platform": "baidu"
        }

    def get_empty_config(self):
        """获取清空后的配置（保留平台结构但清空配置值）"""
        config = self.get_default_config()
        for platform in config["platforms"]:
            if "config" in config["platforms"][platform]:
                # 清空配置项的值
                for key in config["platforms"][platform]["config"]:
                    config["platforms"][platform]["config"][key] = ""
        return config

    def save_config(self, config):
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=4)
            self.config = config
            return True
        except Exception as e:
            print(f"Failed to save config file: {e}")
            return False

    async def test_baidu_connection(self, config):
        try:
            app_id = config.get("app_id", "")
            api_key = config.get("api_key", "")
            
            if not app_id or not api_key:
                return {"success": False, "error": "APP ID 和 API Key 不能为空"}

            url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
            salt = str(random.randint(1000000000, 9999999999))
            test_text = "hello"
            sign = hashlib.md5((app_id + test_text + salt + api_key).encode()).hexdigest()
            
            params = {
                "q": test_text,
                "from": "en",
                "to": "zh",
                "appid": app_id,
                "salt": salt,
                "sign": sign
            }

            response = requests.get(url, params=params, timeout=10)
            result = response.json()
            
            if "trans_result" in result:
                return {"success": True, "message": "连接成功"}
            else:
                error_msg = result.get('error_msg', '未知错误')
                return {"success": False, "error": f"翻译测试失败: {error_msg}"}
        except Exception as e:
            return {"success": False, "error": f"连接异常: {str(e)}"}



    async def test_aliyun_connection(self, config):
        try:
            access_key_id = config.get("access_key_id", "")
            access_key_secret = config.get("access_key_secret", "")
            
            if not access_key_id or not access_key_secret:
                return {"success": False, "error": "Access Key ID 和 Access Key Secret 不能为空"}

            # 使用阿里云翻译API进行测试
            url = "https://mt.cn-hangzhou.aliyuncs.com/api/translate/web/general"
            params = {
                "FormatType": "text",
                "SourceLanguage": "en",
                "TargetLanguage": "zh", 
                "SourceText": "hello",
                "Scene": "general"
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_key_id}',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.post(url, headers=headers, data=json.dumps(params), timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if 'Data' in result:
                    return {"success": True, "message": "阿里云翻译连接成功"}
                else:
                    return {"success": False, "error": "翻译测试失败"}
            else:
                return {"success": False, "error": f"HTTP错误: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": f"连接异常: {str(e)}"}

    def truncate(self, q):
        """
        计算input参数
        input=q前10个字符 + q长度 + q后10个字符（当q长度大于20）或 input=q字符串（当q长度小于等于20）
        """
        if len(q) <= 20:
            return q
        else:
            return q[0:10] + str(len(q)) + q[-10:]

    async def test_youdao_connection(self, config):
        try:
            app_key = config.get("app_key", "")
            app_secret = config.get("app_secret", "")
            
            if not app_key or not app_secret:
                return {"success": False, "error": "App Key 和 App Secret 不能为空"}

            url = "https://openapi.youdao.com/api"
            test_text = "hello"
            salt = str(random.randint(1000000000, 9999999999))
            curtime = str(int(time.time()))
            input_str = self.truncate(test_text)  # 正确计算input参数
            sign_str = app_key + input_str + salt + curtime + app_secret
            sign = hashlib.sha256(sign_str.encode()).hexdigest()
            
            params = {
                'q': test_text,
                'from': 'en',
                'to': 'zh',
                'appKey': app_key,
                'salt': salt,
                'sign': sign,
                'signType': 'v3',
                'curtime': curtime
            }

            response = requests.post(url, data=params, timeout=10)
            result = response.json()
            
            if result.get('errorCode') == '0':
                return {"success": True, "message": "连接成功"}
            else:
                error_code = result.get('errorCode', 'Unknown')
                return {"success": False, "error": f"翻译测试失败，错误码: {error_code}"}
        except Exception as e:
            return {"success": False, "error": f"连接异常: {str(e)}"}

    async def test_free_connection(self, config):
        try:
            platform = config.get("platform", "腾讯翻译君")
            
            if platform == "腾讯翻译君":
                import uuid
                url = "https://transmart.qq.com/api/imt"
                post_data = {
                    "header": {
                        "fn": "auto_translation",
                        "client_key": f"browser-chrome-{uuid.uuid4()}"
                    },
                    "type": "plain",
                    "model_category": "normal",
                    "source": {
                        "lang": "en",
                        "text_list": ["hello"]
                    },
                    "target": {
                        "lang": "zh"
                    }
                }
                headers = {
                    'Content-Type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'referer': 'https://transmart.qq.com/zh-CN/index'
                }
                response = requests.post(url, headers=headers, data=json.dumps(post_data), timeout=10)
                
                if response.status_code == 200:
                    result = response.json()
                    if 'auto_translation' in result:
                        return {"success": True, "message": "腾讯翻译君连接成功"}
            
            elif platform == "Pollinations AI":
                url = "https://text.pollinations.ai/openai/"
                response = requests.get(
                    url,
                    params={
                        "prompt": "Translate the following text from English to Chinese: hello"
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.text
                    if result.strip():
                        return {"success": True, "message": "Pollinations AI连接成功"}
            
            return {"success": False, "error": f"{platform}测试失败"}
        except Exception as e:
            return {"success": False, "error": f"连接异常: {str(e)}"}

    async def test_zhipu_connection(self, config):
        try:
            api_key = config.get("api_key", "")
            model = config.get("model", "glm-4-flash")
            
            if not api_key:
                return {"success": False, "error": "API Key 不能为空"}

            url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
            post_data = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": "你好"
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 50
            }

            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.post(url, headers=headers, data=json.dumps(post_data), timeout=10)
            result = response.json()
            
            if response.status_code == 200 and 'choices' in result and len(result['choices']) > 0:
                return {"success": True, "message": "连接成功"}
            else:
                error_msg = result.get('error', {}).get('message', '未知错误') if 'error' in result else '连接失败'
                return {"success": False, "error": f"智谱AI连接失败: {error_msg}"}
        except Exception as e:
            return {"success": False, "error": f"连接异常: {str(e)}"}

    async def handle_config_get(self, request):
        try:
            config = self.load_config()
            return web.json_response(config)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def handle_config_post(self, request):
        try:
            data = await request.json()
            success = self.save_config(data)
            if success:
                return web.json_response({"success": True})
            else:
                return web.json_response({"error": "Failed to save config"}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def handle_config_clear(self, request):
        try:
            # 获取清空后的配置
            empty_config = self.get_empty_config()
            # 保存清空后的配置
            success = self.save_config(empty_config)
            if success:
                return web.json_response({"success": True})
            else:
                return web.json_response({"error": "Failed to clear config"}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    async def handle_test_post(self, request):
        try:
            data = await request.json()
            platform = data.get("platform")
            config = data.get("config", {})
            
            test_methods = {
                "baidu": self.test_baidu_connection,
                "tencent": self.test_tencent_connection,
                "aliyun": self.test_aliyun_connection,
                "youdao": self.test_youdao_connection,
                "zhipu": self.test_zhipu_connection,
                "free": self.test_free_connection
            }
            
            test_method = test_methods.get(platform)
            if test_method:
                result = await test_method(config)
                if result["success"]:
                    return web.json_response({"success": True, "message": result["message"]})
                else:
                    return web.json_response({"success": False, "error": result["error"]}, status=400)
            else:
                return web.json_response({"error": "Unsupported platform"}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

translate_api = MultiPlatformTranslateAPI()

if PROMPT_SERVER_AVAILABLE and PromptServer:
    @PromptServer.instance.routes.get("/zhihui_nodes/translate/config")
    async def get_translate_config(request):
        return await translate_api.handle_config_get(request)

    @PromptServer.instance.routes.post("/zhihui_nodes/translate/config")
    async def post_translate_config(request):
        return await translate_api.handle_config_post(request)

    @PromptServer.instance.routes.post("/zhihui_nodes/translate/clear")
    async def clear_translate_config(request):
        return await translate_api.handle_config_clear(request)

    @PromptServer.instance.routes.post("/zhihui_nodes/translate/test")
    async def test_translate_connection(request):
        return await translate_api.handle_test_post(request)