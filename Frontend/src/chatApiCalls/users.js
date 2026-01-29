import { axiosInstance } from "./index";

export const getLoggedUser = async () => {
  try {
    const response = await axiosInstance.get("api/users/get-logged-user");
    console.log("Logged user response:", response);

    // ✅ Always return a plain object
    return { user: response.data.data, errorMessage: null };
  } catch (error) {
    console.error("Error fetching logged user:", error);

    // ✅ Return a serializable error object
    return {
      user: null,
      errorMessage:
        error.response?.data?.message || error.message || "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};
