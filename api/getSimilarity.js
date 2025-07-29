// pages/api/getSimilarity.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word1, word2 } = req.body;
  const HF_TOKEN = process.env.HF_API_TOKEN;

  try {
    const hfResponse = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([word1, word2])  // ← 文字列の配列を送る
    });

    const vectors = await hfResponse.json();

    if (!Array.isArray(vectors) || vectors.length !== 2) {
      return res.status(500).json({ error: "Invalid response from Hugging Face", result: vectors });
    }

    const vec1 = vectors[0];
    const vec2 = vectors[1];

    const dot = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const similarity = dot / (norm1 * norm2);

    return res.status(200).json({ similarity });
  } catch (err) {
    console.error("API 呼び出しエラー:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
