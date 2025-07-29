export default async function handler(req, res) {
  const HF_TOKEN = process.env.HF_TOKEN;  // 環境変数から取得

  if (!HF_TOKEN) {
    return res.status(500).json({ error: "HF_TOKEN is not set." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
