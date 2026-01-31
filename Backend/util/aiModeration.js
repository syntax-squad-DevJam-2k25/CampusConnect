export const checkPostSafety = async (text = "") => {
   try {
    console.log("Checking safety for text:", text);  
    if (!text.trim()) return "SAFE";
  console.log(process.env.GEMINI_API_KEY);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Classify the text.

SAFE
OFFENSIVE
HATE
SEXUAL
HARASSMENT

Text:
"${text}"

Answer ONLY one word.
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "UNSAFE";

    return result.trim().toUpperCase();
  } catch (error) {
    console.error("Gemini moderation failed:", error.message);
    return "UNSAFE"; // fail closed 🔒
  }
};
