const router = require("express").Router();
const User = require("./../models/User");
const axios = require("axios");
const authMiddleware = require("./../middleware/authMiddleware");

/* ===================== GET LOGGED USER ===================== */
router.get("/get-logged-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ===================== GET ALL USERS ===================== */
router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ===================== UPDATE CODEFORCES ===================== */
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { codeforcesUsername, year } = req.body;
    console.log(codeforcesUsername)
    if (!codeforcesUsername) {
      return res.status(400).json({
        success: false,
        message: "Codeforces username is required",
      });
    }

    if (!year || isNaN(Number(year))) {
      return res.status(400).json({
        success: false,
        message: "Invalid year provided",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cfResponse;
    try {
      cfResponse = await axios.get(
        `https://codeforces.com/api/user.info?handles=${codeforcesUsername}`
      );
    } catch {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch Codeforces data",
      });
    }

    if (cfResponse.data.status !== "OK") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Codeforces username" });
    }

    const cfData = cfResponse.data.result[0];

    user.codeforcesUsername = codeforcesUsername;
    user.codeforcesRating = cfData.rating || 0;
    user.year = year;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        codeforcesUsername: user.codeforcesUsername,
        codeforcesRating: user.codeforcesRating,
        year: user.year,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ===================== LEETCODE GRAPHQL HELPER ===================== */
async function getLeetcodeGraphqlResponse(query, variables) {
  return axios.post(
    "https://leetcode.com/graphql/",
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/",
      },
    }
  );
}

/* ===================== UPDATE LEETCODE ===================== */
router.put("/update-leetcode", authMiddleware, async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;

    if (!leetcodeUsername) {
      return res.status(400).json({
        success: false,
        message: "LeetCode username is required",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          profile { ranking }
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }
    `;

    let response = await getLeetcodeGraphqlResponse(query, {
      username: leetcodeUsername,
    });

    if (!response.data.data.matchedUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid LeetCode username" });
    }

    query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) { rating }
      }
    `;

    response = await getLeetcodeGraphqlResponse(query, {
      username: leetcodeUsername,
    });

    user.leetcodeUsername = leetcodeUsername;
    user.leetcodeRating =
      response.data.data.userContestRanking?.rating || 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "LeetCode profile updated successfully",
      data: {
        leetcodeUsername: user.leetcodeUsername,
        leetcodeRating: user.leetcodeRating,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ===================== GET LEETCODE DATA (OTHER PROFILE) ===================== */
router.post("/leetcode", async (req, res) => {
  try {
    const { id } = req.body;

    console.log("LeetCode fetch for userId:", id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(id);
    if (!user || !user.leetcodeUsername) {
      return res.status(404).json({
        success: false,
        message: "LeetCode username not found",
      });
    }

    const username = user.leetcodeUsername;

    // 🔹 GraphQL query
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        userContestRanking(username: $username) {
          rating
        }
      }
    `;

    const response = await axios.post(
      "https://leetcode.com/graphql/",
      { query, variables: { username } },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com/",
        },
      }
    );

    const matchedUser = response.data.data.matchedUser;
    if (!matchedUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid LeetCode username",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        handler: matchedUser.username,
        rank: matchedUser.profile?.ranking || null,
        rating: response.data.data.userContestRanking?.rating || null,
        submissionCount: matchedUser.submitStatsGlobal?.acSubmissionNum || [],
        profileLink: `https://leetcode.com/${username}`,
      },
    });
  } catch (error) {
    console.error("LeetCode fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch LeetCode data",
    });
  }
});


module.exports = router;