export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word1, word2 } = req.body;
  const HF_TOKEN = process.env.HF_API_TOKEN;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: [word1, word2] })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API Error:", errorText);
      return res.status(500).json({ error: "Hugging Face API Error", details: errorText });
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length < 2) {
      return res.status(500).json({ error: "Invalid response from Hugging Face", result: data });
    }

    const vec1 = data[0];
    const vec2 = data[1];

    const dot = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const similarity = dot / (norm1 * norm2);

    return res.status(200).json({ similarity });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
