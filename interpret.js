// api/interpret.js
export default async function handler(req, res) {
  // 允许跨域（请将 '*' 替换为您的 GitHub Pages 域名以增强安全性）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, words } = req.body;
  if (!question || !words) {
    return res.status(400).json({ error: 'Missing question or words' });
  }

  const prompt = `你是一位神秘学占卜师，请根据以下信息为用户解读：
用户的问题：「${question}」
抽到的三个词：本因：${words[0].name}（${words[0].meaning}）；进行：${words[1].name}（${words[1].meaning}）；指引：${words[2].name}（${words[2].meaning}）。
请结合问题与词义，给出富有洞察力的解读，语气神秘而温柔，约150-200字。`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位充满智慧的神秘学占卜师，善于将象征词语与个人处境结合，给出温暖而深刻的解读。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}