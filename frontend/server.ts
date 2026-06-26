import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  
  const PORT = 3000;

  // Initialize Gemini client safely with standard options
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } else {
    console.warn("Warning: GEMINI_API_KEY environment variable is missing.");
  }

  // API endpoint for spiritual assistant
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, userMessage } = req.body;
      
      if (!userMessage) {
        return res.status(400).json({ error: "userMessage is required" });
      }

      if (!ai) {
        // Safe mock mode with deep, reflective fallback in case the key is not set yet
        const fallbacks = [
          {
            text: "L'anxiété ou le doute font partie du chemin. Les Écritures nous enseignent de cultiver la patience et la confiance. Ne vous inquiétez de rien, mais dans toute situation, présentez vos prières avec gratitude.",
            quote: "Psaumes 27:1",
            textQuote: "Le Seigneur est ma lumière et mon salut; de qui aurais-je crainte ?"
          },
          {
            text: "Le pardon libère d'abord l'âme qui l'offre. C'est un acte de miséricorde divine qui nous ramène vers notre propre humanité.",
            quote: "Al-Imran 3:159",
            textQuote: "Pardonne-leur donc, et implore pour eux le pardon d'Allah."
          },
          {
            text: "La paix intérieure est un calme profond au-delà du tumulte de notre quotidien. Elle grandit à travers la réflexion silencieuse et le recueillement.",
            quote: "Jean 14:27",
            textQuote: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne."
          }
        ];
        
        // Select one fallback based on user content
        let choice = fallbacks[0];
        if (userMessage.toLowerCase().includes("pardon") || userMessage.toLowerCase().includes("pardonne")) {
          choice = fallbacks[1];
        } else if (userMessage.toLowerCase().includes("paix") || userMessage.toLowerCase().includes("calme") || userMessage.toLowerCase().includes("silence")) {
          choice = fallbacks[2];
        }
        
        return res.json({
          text: `[Sagesse Divine - Mode Démo] ${choice.text}`,
          scriptureQuote: {
            text: choice.textQuote,
            reference: choice.quote,
            source: choice.quote.includes("Al-") || choice.quote.includes("Coran") ? "Coran" : "Bible"
          }
        });
      }

      // Prepare conversation history context
      let promptWithContext = "";
      if (messages && messages.length > 0) {
        promptWithContext = messages.map((m: any) => {
          const sender = m.role === 'user' ? 'Seeker' : 'Sagesse Divine';
          return `${sender}: ${m.text}`;
        }).join("\n") + `\nSeeker: ${userMessage}\nSagesse Divine:`;
      } else {
        promptWithContext = `Seeker: ${userMessage}\nSagesse Divine:`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptWithContext,
        config: {
          systemInstruction: "Tu es 'Sagesse Divine', un guide spirituel bienveillant, profondément pacifique et très érudit sur l'application SpiritTalk. Ton rôle est d'accompagner les utilisateurs ('Seekers') dans leur recherche de paix, de pardon, de force intérieure et de foi en français.\n" +
            "Consignes impératives:\n" +
            "1. Réponds avec amour, respect et sérénité. Adopte un ton calme et poétique.\n" +
            "2. Cite TOUJOURS au moins un verset de la Bible ou du Coran en rapport avec la préoccupation de l'utilisateur, en l'identifiant précisément par sa référence (ex: Matthieu 6:34 ou Sourate Al-Baqarah 2:153).\n" +
            "3. Reste œcuménique et ouvert d'esprit, célébrant l'union spirituelle, la tolérance et la paix universelle.\n" +
            "4. Écris tes réponses de façon claire et aérée avec des paragraphes.\n" +
            "5. N'invente jamais de versets.",
          temperature: 0.7,
        }
      });

      const text = response.text || "Que la paix et la clarté guident vos pas. Je n'ai pas pu formuler ma réponse, mais sachez que vous n'êtes pas seul.";
      
      // Let's attempt to extract a scripture quote programmatically if possible to display in the premium UI card.
      // We will look for text in quotes or formatted nicely. If not found, the frontend will display the main response text with Markdown beautifully.
      let scriptureQuote = undefined;
      
      // Basic regex to find quotes or reference indicators like "(Psaume ...)" or "— ..."
      const refRegex = /(Psaumes?|Matthieu|Coran|Sourate|Jean|Corinthiens|Philippiens|Proverbes|Galates|Al-[A-Za-z]+)\s+\d+:\d+(-\d+)?/gi;
      const match = text.match(refRegex);
      if (match && match.length > 0) {
        scriptureQuote = {
          text: "Cliquez pour lire la réflexion complète guidée par cette Écriture sainte.",
          reference: match[0],
          source: match[0].toLowerCase().includes("coran") || match[0].toLowerCase().includes("sourate") || match[0].toLowerCase().includes("al-") ? "Coran" : "Bible"
        };
      }

      res.json({ text, scriptureQuote });
    } catch (err: any) {
      console.error("Gemini route error:", err);
      res.status(500).json({ error: err.message || "Failed to generate spiritual response" });
    }
  });

  // API proxy route to bypass client CORS restrictions for bible-api.com
  app.get("/api/bible", async (req, res) => {
    try {
      const { book, chapter } = req.query;
      if (!book || !chapter) {
        return res.status(400).json({ error: "book and chapter are required parameters" });
      }
      
      const url = `https://bible-api.com/${encodeURIComponent(book as string)}+${encodeURIComponent(chapter as string)}?translation=lsg`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`External Bible API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Bible proxy server error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch from Bible API" });
    }
  });

  // Serve static files in production / Vite middlewares in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} with environment ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
