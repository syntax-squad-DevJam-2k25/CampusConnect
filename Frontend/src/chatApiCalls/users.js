import axios from "axios";

export const getLoggedUser = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(
      "http://localhost:5001/api/users/get-logged-user",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("🔹 getLoggedUser response:", response.data);

    // Handle different response structures
    // Sometimes the user data is directly in response.data
    // Sometimes it's in response.data.data or response.data.user
    const userData = response.data.data || response.data.user || response.data;

    if (!userData) {
      throw new Error("No user data in response");
    }

    return {
      user: userData,
      success: true,
    };
  } catch (error) {
    console.error("❌ Error fetching logged user:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};