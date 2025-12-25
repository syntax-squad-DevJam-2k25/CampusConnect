const { JSDOM } = require("jsdom");
const axios = require("axios");
const User = require("./../models/User");

function getText(document, selector) {
  return document.querySelector(selector)?.textContent?.trim() || "";
}

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.body;
  console.log(id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(id);
    if (!user || !user.codeforcesUsername) {
      return res.status(404).json({
        success: false,
        message: "Codeforces username not found",
      });
    }

    const username = user.codeforcesUsername;
    const profileLink = `https://codeforces.com/profile/${username}`;

    /* ------------------ 1️⃣ FETCH USER INFO (API) ------------------ */
    const infoRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    if (infoRes.data.status !== "OK") {
      throw new Error("Invalid Codeforces user");
    }

    const cf = infoRes.data.result[0];

    /* ------------------ 2️⃣ FETCH SUBMISSIONS (API) ------------------ */
    const statusRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${username}`
    );

    const submissions =
      statusRes.data.status === "OK"
        ? statusRes.data.result.length
        : 0;

    /* ------------------ 3️⃣ OPTIONAL: SCRAPE STREAK ------------------ */
    const htmlRes = await axios.get(profileLink, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const dom = new JSDOM(htmlRes.data);
    const document = dom.window.document;

    const streakText = getText(document, ".heatmap div span");
    const streak = streakText.replace(/\D/g, "") || "0";

    /* ------------------ RESPONSE ------------------ */
    return res.status(200).json({
      success: true,
      data: {
        handler: cf.handle,
        rank: cf.rating || 0,
        title: cf.rank || "Unrated",
        streak: Number(streak),
        submissionCount: [
          {
            difficulty: "All",
            count: submissions, // ✅ CORRECT
          },
        ],
        profileLink,
      },
    });
  } catch (error) {
    console.error("❌ Codeforces error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Codeforces data",
    });
  }
};