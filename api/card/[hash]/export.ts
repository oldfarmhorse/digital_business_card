import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from "@upstash/redis";
import { PKPass } from "passkit-generator";
import jwt from "jsonwebtoken";

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
    const { hash, type } = req.query;
    if (!hash || Array.isArray(hash) || Array.isArray(type)) {
      return res.status(400).json({ error: 'Invalid hash or type' });
    }

    const kv = getKV();
    const card: any = await kv.get(hash);
    
    if (!card) return res.status(404).send("Card not found");

    if (type === "vcard") {
      const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\nORG:${card.company}\nTITLE:${card.jobTitle}\nEMAIL:${card.email}\nTEL:${card.phone}\n${card.phone2 ? `TEL:${card.phone2}\n` : ""}${card.website ? `URL:${card.website}\n` : ""}${card.avatarUrl ? `PHOTO;VALUE=URI:${card.avatarUrl}\n` : ""}${card.socialLinks?.map((url: string) => `URL:${url}`).join("\n")}\nEND:VCARD`;

      res.setHeader("Content-Type", "text/vcard");
      res.setHeader("Content-Disposition", `attachment; filename="${card.name.replace(/\s+/g, "_")}.vcf"`);
      return res.send(vcf);
    } 
    
    else if (type === "apple") {
      if (!process.env.APPLE_WWDR_CERT_BASE64 || !process.env.APPLE_SIGNER_CERT_BASE64) {
         return res.status(500).json({ 
           error: "Apple Wallet environment variables are not configured.",
         });
      }

      const pass = new PKPass({}, {
        wwdr: Buffer.from(process.env.APPLE_WWDR_CERT_BASE64, "base64"),
        signerCert: Buffer.from(process.env.APPLE_SIGNER_CERT_BASE64, "base64"),
        signerKey: Buffer.from(process.env.APPLE_SIGNER_KEY_BASE64 || "", "base64"),
        signerKeyPassphrase: process.env.APPLE_SIGNER_PASSPHRASE
      }, {
        "passTypeIdentifier": process.env.APPLE_PASS_TYPE_ID || "pass.com.example",
        "teamIdentifier": process.env.APPLE_TEAM_ID || "XYZ123456",
        "organizationName": card.company || "Digital Profile",
        "description": "Digital Business Card",
        "logoText": card.name,
        "foregroundColor": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(15, 23, 42)", 
        "labelColor": "rgb(148, 163, 184)",
        "barcodes": [{
          "format": "PKBarcodeFormatQR",
          "message": `${process.env.APP_URL || "http://localhost:3000"}/${hash}`,
          "messageEncoding": "iso-8859-1"
        }]
      } as any);

      if (card.avatarUrl) {
         try {
           const imgRes = await fetch(card.avatarUrl);
           const arrBuffer = await imgRes.arrayBuffer();
           pass.addBuffer('thumbnail.png', Buffer.from(arrBuffer));
         } catch (err) {
           console.error("Failed to load image for Apple Pass:", err);
         }
      }

      const buffer = pass.getAsBuffer();
      res.setHeader("Content-Type", "application/vnd.apple.pkpass");
      res.setHeader("Content-Disposition", `attachment; filename="${card.name.replace(/\s+/g, "_")}.pkpass"`);
      return res.send(buffer);
    } 
    
    else if (type === "google") {
      if (!process.env.GOOGLE_CREDENTIALS_JSON) {
        return res.status(500).json({ 
          error: "Google Wallet environment variables are not configured.",
        });
      }

      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

      const issuerId = process.env.GOOGLE_ISSUER_ID;
      const classId = process.env.GOOGLE_CLASS_ID;
      const objectId = `${issuerId}.${hash}`;

      const newObject = {
        id: objectId,
        classId: `${issuerId}.${classId}`,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: { uri: card.avatarUrl }
        },
        textModulesData: [
          { id: 'name', header: 'Name', body: card.name },
          { id: 'title', header: 'Title', body: card.jobTitle },
          { id: 'company', header: 'Company', body: card.company }
        ],
        linksModuleData: {
          uris: [
            { uri: `${process.env.APP_URL || "http://localhost:3000"}/${hash}`, description: 'View Profile' }
          ]
        },
        barcode: {
          type: 'QR_CODE',
          value: `${process.env.APP_URL || "http://localhost:3000"}/${hash}`
        }
      };

      const claims = {
        iss: credentials.client_email,
        aud: 'google',
        typ: 'savetowallet',
        origins: [],
        payload: {
          genericObjects: [newObject]
        }
      };

      const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
      const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
      return res.redirect(saveUrl);
    } 
    
    else {
      return res.status(400).send("Invalid export type");
    }

  } catch (error: any) {
    console.error("Export Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
