// /api/getSimilarity.js (Next.js用)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word1, word2 } = req.body;

  const HF_TOKEN = process.env.HF_API_TOKEN;

  const response = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([word1, word2])  // ⬅ 配列で送ること！
  });

  const data = await response.json();

  if (!Array.isArray(data) || data.length < 2) {
    return res.status(500).json({ error: "Invalid response from Hugging Face", result: data });
  }

  const vec1 = data[0];
  const vec2 = data[1];

  // 類似度をコサイン類似度で計算
  const dot = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  const similarity = dot / (norm1 * norm2);

  return res.status(200).json({ similarity });
}
