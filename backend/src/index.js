// backend/src/index.js (简化版)

// ===================================================================
// 6位短码生成器
// ===================================================================
const shortCodeGenerator = {
    charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    generate(length = 6) {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += this.charset.charAt(Math.floor(Math.random() * this.charset.length));
      }
      return result;
    }
  };
  
  // ===================================================================
  // Worker 主入口和路由逻辑
  // ===================================================================
  export default {
    async fetch(request, env, ctx) {
      // 处理CORS预检请求
      if (request.method === 'OPTIONS') {
        return handleOptions(request);
      }
  
      const url = new URL(request.url);
  
      // 路由: 创建短链接
      if (request.method === 'POST' && url.pathname === '/api/create/shortlink') {
        return handleCreateShortlink(request, env);
      }
  
      // 路由: 处理重定向
      if (request.method === 'GET' && url.pathname.length > 1) {
        return handleRedirect(request, env);
      }
  
      // 根路径或其他未知路径，跳转到您的主页
      const fallbackUrl = "https://jhclip.top"; // 【请替换】
      return Response.redirect(fallbackUrl, 302);
    },
  };
  
  /**
   * 处理创建短链接的逻辑
   */
  async function handleCreateShortlink(request, env) {
    try {
      const body = await request.json();
      const longUrl = body.url;
  
      if (!longUrl || !isValidHttpUrl(longUrl)) {
        return createJsonResponse({ error: '无效或缺失的URL。' }, 400);
      }
  
      let shortCode;
      let attempts = 0;
      // 循环直到找到一个未被使用的短码
      do {
          shortCode = shortCodeGenerator.generate();
          // 在KV中检查是否存在，KV的get操作在key不存在时返回null
          const existing = await env.LINKS_KV.get(shortCode);
          if (existing === null) break;
          attempts++;
      } while (attempts < 5);
  
      if (attempts >= 5) {
          return createJsonResponse({ error: '生成短链接时发生冲突，请稍后再试。' }, 500);
      }
      
      // 存入KV存储
      await env.LINKS_KV.put(shortCode, longUrl);
  
      const shortlinkDomain = new URL(request.url).origin;
      const shortUrl = `${shortlinkDomain}/${shortCode}`;
  
      return createJsonResponse({ success: true, short_url: shortUrl }, 201);
    } catch (e) {
      return createJsonResponse({ error: '请求处理失败。' }, 500);
    }
  }
  
  /**
   * 处理重定向的逻辑
   */
  async function handleRedirect(request, env) {
    const shortCode = new URL(request.url).pathname.slice(1);
    
    // 从KV中查找链接
    const longUrl = await env.LINKS_KV.get(shortCode);
  
    if (longUrl) {
      return Response.redirect(longUrl, 301); // 301 永久重定向
    } else {
      // 如果找不到，可以返回一个简单的404页面
      return new Response('短链接不存在或已失效。', { status: 404 });
    }
  }
  
  // ===================================================================
  // 辅助函数 (CORS, JSON响应, URL验证)
  // ===================================================================
  function handleOptions(request) {
      const headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
      };
      return new Response(null, { headers });
  }
  
  function createJsonResponse(data, status = 200) {
      const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
      };
      return new Response(JSON.stringify(data), { headers, status });
  }
  
  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }