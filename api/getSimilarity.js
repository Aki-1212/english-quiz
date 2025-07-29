// /api/getSimilarity.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { word1, word2 } = req.body;
    const HF_TOKEN = process.env.HF_API_TOKEN;
  
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: {
          source_sentence: word1,
          sentences: [word2]
        }
      })
    });
  
    const result = await hfResponse.json();
  
    if (!Array.isArray(result) || typeof result[0] !== "number") {
      return res.status(500).json({ error: "Invalid response from Hugging Face", result });
    }
  
    return res.status(200).json({ similarity: result[0] });
  }
  