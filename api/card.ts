import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";

// Initialize Redis lazily
function getKV() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Upstash Redis environment variables.");
  }
  return new Redis({ url, token });
}

function checkBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing VERCEL BLOB environment variable.");
  }
}

const generateHash = () => Math.random().toString(36).substring(2, 8);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { name, jobTitle, company, email, phone, phone2, website, avatarBase64, socialLinks } = req.body;
    checkBlobToken();

    let avatarUrl = "";
    if (avatarBase64) {
      const base64Data = avatarBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      const filename = `avatars/${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      const blobResult = await put(filename, buffer, { 
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      avatarUrl = blobResult.url;
    }

    const hash = generateHash();
    const kv = getKV();
    
    await kv.set(hash, {
      name,
      jobTitle,
      company,
      email,
      phone,
      phone2,
      website,
      avatarUrl,
      socialLinks: socialLinks || []
    });

    return res.status(200).json({ hash });
  } catch (error: any) {
    console.error("Error creating card:", error);
    return res.status(500).json({ error: error.message });
  }
}
