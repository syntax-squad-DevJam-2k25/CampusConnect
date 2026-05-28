const originalFetch = window.fetch;

export const setupAuthFetch = () => {
    window.fetch = async (url, options = {}) => {
        const token = localStorage.getItem("token");

        const headers = {
            ...options.headers,
        };
        if (token && !headers.Authorization) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await originalFetch(url, { ...options, headers });

        if (response.status === 401) {
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");

                const res = await originalFetch("http://localhost:5001/api/auth/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });

                const data = await res.json();
                const newToken = data.token;
                localStorage.setItem("token", newToken);

                headers.Authorization = `Bearer ${newToken}`;
                return originalFetch(url, { ...options, headers });

            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                window.location.href = "/";
            }
        }

        return response;
    };
};