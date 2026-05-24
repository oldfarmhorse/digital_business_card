import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from "@upstash/redis";

function getKV() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Upstash Redis environment variables.");
  }
  return new Redis({ url, token });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { hash } = req.query;
    if (!hash || Array.isArray(hash)) {
      return res.status(400).json({ error: 'Invalid hash' });
    }
    
    const kv = getKV();
    const data = await kv.get(hash);
    if (!data) {
      return res.status(404).json({ error: "Card not found" });
    }
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching card:", error);
    return res.status(500).json({ error: error.message });
  }
}
