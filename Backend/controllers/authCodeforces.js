const axios = require("axios");
const { JSDOM } = require("jsdom");
const User = require("../models/User");

exports.getUserDetails = async (req, res) => {
  try {
    // ✅ Use the authenticated user ID from middleware
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.codeforcesUsername) {
      return res.status(404).json({
        success: false,
        message: "Codeforces username not found",
      });
    }

    const username = user.codeforcesUsername;
    const profileLink = `https://codeforces.com/profile/${username}`;

    // 1️⃣ USER INFO
    const infoRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    if (infoRes.data.status !== "OK") {
      throw new Error("Invalid Codeforces user");
    }
  
    const cf = infoRes.data.result[0];

    // 2️⃣ SUBMISSIONS
 let submissions = 0;

try {
  const statusRes = await axios.get(
    `https://codeforces.com/api/user.status?handle=${username}`
  );

  if (statusRes.data.status === "OK") {
    submissions = statusRes.data.result.filter(
      (submission) => submission.verdict === "OK"
    ).length;
  }

  
} catch (error) {
  console.warn("⚠️ Submissions fetch failed", error.message);
}

  
    // 3️⃣ STREAK
    let streak = 0;
    try {
      const htmlRes = await axios.get(profileLink);
      const dom = new JSDOM(htmlRes.data);
      const document = dom.window.document;
      const streakText = document.querySelector(".heatmap div span")?.textContent || "";
      streak = Number(streakText.replace(/\D/g, "")) || 0;
    } catch {
      console.warn("⚠️ Streak not available");
    }
  await User.findByIdAndUpdate(userId, {
  codeforcesRating: Math.trunc(Number(cf.rating)) || 0,
});
    return res.status(200).json({
      success: true,
      data: {
        handler: cf.handle,
        rating: cf.rating || 0,
        rank: cf.rank || "Unrated",
        streak,
        submissionCount: [
          { difficulty: "All", count: submissions },
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

exports.getUserDetails2 = async (req, res) => {
  try {
    const userId = req.body.id; // from auth middleware
    

    const user = await User.findById(userId);
    if (!user || !user.codeforcesUsername) {
      return res.status(404).json({
        success: false,
        message: "Codeforces username not found",
      });
    }

    const username = user.codeforcesUsername;
    const profileLink = `https://codeforces.com/profile/${username}`;

    // 1️⃣ USER INFO
    const infoRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    if (infoRes.data.status !== "OK") {
      throw new Error("Invalid Codeforces user");
    }

    const cf = infoRes.data.result[0];

    // 2️⃣ SUBMISSIONS
    let submissions = 0;
    try {
      const statusRes = await axios.get(
        `https://codeforces.com/api/user.status?handle=${username}`
      );
      if (statusRes.data.status === "OK") {
        submissions = statusRes.data.result.length;
      }
    } catch {
      console.warn("Submissions fetch failed");
    }

    // 3️⃣ STREAK (scraping)
    let streak = 0;
    try {
      const htmlRes = await axios.get(profileLink);
      const dom = new JSDOM(htmlRes.data);
      const document = dom.window.document;
      const streakText =
        document.querySelector(".heatmap div span")?.textContent || "";
      streak = Number(streakText.replace(/\D/g, "")) || 0;
    } catch {
      console.warn("Streak not available");
    }

    // ✅ Update rating in DB
  await User.findByIdAndUpdate(userId, {
  codeforcesRating: Math.trunc(Number(cf.rating)) || 0,
});


    return res.status(200).json({
      success: true,
      data: {
        handle: cf.handle,
        rank: cf.rank || "Unrated",
        maxRank: cf.maxRank || "Unrated",

        rating: cf.rating || 0,
        maxRating: cf.maxRating || 0,

        contribution: cf.contribution || 0,
        avatar: cf.avatar || "",
        titlePhoto: cf.titlePhoto || "",

        registrationTimeSeconds: cf.registrationTimeSeconds,
        lastOnlineTimeSeconds: cf.lastOnlineTimeSeconds,

        streak,
        submissionCount: [{ difficulty: "All", count: submissions }],

        profileLink,
      },
    });

  } catch (error) {
    console.error("Codeforces error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Codeforces data",
    });
  }
};


