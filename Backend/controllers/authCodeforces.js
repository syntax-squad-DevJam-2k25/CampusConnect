exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const user = await User.findById(id);
    if (!user?.codeforcesUsername) {
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
      console.warn("⚠️ Submissions fetch failed");
    }

    // 3️⃣ STREAK (OPTIONAL)
    let streak = 0;
    try {
      const htmlRes = await axios.get(profileLink);
      const dom = new JSDOM(htmlRes.data);
      const document = dom.window.document;
      const streakText = getText(document, ".heatmap div span");
      streak = Number(streakText.replace(/\D/g, "")) || 0;
    } catch {
      console.warn("⚠️ Streak not available");
    }

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
