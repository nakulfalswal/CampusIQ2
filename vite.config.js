import { defineConfig } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "AIzaSyCANYBrodG2lcxU9U6UPkpwro_84xAFK_s" });

// Schemas for structured output
const AttendanceSchema = {
  type: Type.OBJECT,
  properties: {
    isValid: { type: Type.BOOLEAN, description: "True if the image clearly contains attendance data. False if the image is unrelated (like a profile picture, scenery, etc)." },
    overall: { type: Type.NUMBER, description: "Overall attendance percentage" },
    dangerCount: { type: Type.NUMBER, description: "Number of subjects with attendance below 75%" },
    totalClasses: { type: Type.NUMBER, description: "Total number of classes held across all subjects" },
    subjects: {
      type: Type.ARRAY,
      description: "List of subjects",
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: "Subject code, e.g. CS201" },
          name: { type: Type.STRING, description: "Subject name" },
          attended: { type: Type.NUMBER, description: "Classes attended" },
          total: { type: Type.NUMBER, description: "Total classes held for this subject" },
          percentage: { type: Type.NUMBER, description: "Attendance percentage for this subject" },
          verdict: { type: Type.STRING, description: "A short, actionable verdict (e.g., 'Can bunk 3 more', 'Attend next 2 to be safe', 'Need 5 more to recover')" }
        },
        required: ["code", "name", "attended", "total", "percentage", "verdict"]
      }
    }
  },
  required: ["isValid", "overall", "dangerCount", "totalClasses", "subjects"]
};

const MarksSchema = {
  type: Type.OBJECT,
  properties: {
    isValid: { type: Type.BOOLEAN, description: "True if the image clearly contains academic marks/grades data. False if the image is unrelated (like a profile picture, scenery, etc)." },
    cgpa: { type: Type.NUMBER, description: "Calculated CGPA based on the marks" },
    subjects: {
      type: Type.ARRAY,
      description: "List of subjects",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Subject name" },
          marks: { type: Type.NUMBER, description: "Total marks obtained" },
          credits: { type: Type.NUMBER, description: "Credits for the subject (use standard values or infer around 3-4)" },
          grade: { type: Type.STRING, description: "Letter grade obtained (e.g., A, B+, B, C, D, F)" },
          points: { type: Type.NUMBER, description: "Grade points (e.g., A=10, A-=9, B=8, etc.)" }
        },
        required: ["name", "marks", "credits", "grade", "points"]
      }
    }
  },
  required: ["isValid", "cgpa", "subjects"]
};

export default defineConfig({
  root: './',
  server: {
    port: 5173,
    open: false
  },
  plugins: [
    {
      name: 'campusiq-api',
      configureServer(server) {
        // Handle POST /api/extract
        server.middlewares.use('/api/extract', async (req, res, next) => {
          if (req.method !== 'POST') return next();

          // Read body stream
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { image, type } = data; // image is DataURL string

              if (!image || !image.startsWith('data:image/')) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid image format' }));
              }

              // Extract pure base64 and mime type
              const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
              if (!matches) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid base64 string' }));
              }

              const mimeType = matches[1];
              const base64Data = matches[2];

              // Configure Gemini Call
              const prompt = type === 'attendance'
                ? "First, verify if this image contains attendance/academic data. If it does not (e.g. it is a profile picture), set isValid to false and return dummy data for the rest. If it does, set isValid to true, then extract the attendance information and calculate the overall statistics and danger count (subjects below 75%). For each subject, provide a short actionable verdict on whether they can miss classes or need to attend."
                : "First, verify if this image contains academic marks/grades data. If it does not, set isValid to false and return dummy data for the rest. If it does, set isValid to true, then extract the subjects, marks, grades, and calculate the overall CGPA from this screenshot. Estimate standard credit points for courses if missing.";

              const schema = type === 'attendance' ? AttendanceSchema : MarksSchema;

              console.log(`[API] Processing ${type} extraction with Gemini...`);

              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                  prompt,
                  {
                    inlineData: {
                      data: base64Data,
                      mimeType: mimeType
                    }
                  }
                ],
                config: {
                  responseMimeType: 'application/json',
                  responseSchema: schema,
                  temperature: 0.1 // Low temperature for factual extraction
                }
              });

              console.log(`[API] Gemini extraction successful!`);
              const responseData = response.text; // The text is a JSON string because of responseMimeType

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(responseData);

            } catch (error) {
              console.error("[API] Error extracting data:", error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to extract data' }));
            }
          });
        });
      }
    }
  ]
});
