import { useEffect, useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";

const LeetcodeLeaderboard = ({ selectedCourse, selectedYear }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(
        "http://localhost:5001/api/users/get-all-users",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched users data:", data);

      if (!data.success) {
        throw new Error("API returned failure");
      }

      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      await fetchAllUsers();
      setLoading(false);
    };

    fetchRatings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        users.map((user) =>
          fetch("http://localhost:5001/api/users/leetcode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: user._id }),
          })
        )
      );

      await fetchAllUsers();
      setCurrentPage(1);
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredUsers = users.filter((user) => {
    const courseMatch =
      selectedCourse === "All" || user.branch === selectedCourse;
    const yearMatch =
      selectedYear === "All" || user.year?.toString() === selectedYear;
    return courseMatch && yearMatch;
  });

  const sortedUsers = [...filteredUsers].sort(
    (a, b) => (b.leetcodeRating || 0) - (a.leetcodeRating || 0)
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages) pages.push("...");

    return pages;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <button
          className="refresh-btn-styled"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Stats"}
        </button>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Course</th>
            <th>Year</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user, index) => (
            <tr key={user._id}>
              <td className="rank">
                {startIndex + index === 0 ? "🥇" : startIndex + index === 1 ? "🥈" : startIndex + index === 2 ? "🥉" : startIndex + index + 1}
              </td>
              <td>
                <Link to={`/u/${user._id}`} className="leaderboard-link">
                  {user.name}
                </Link>
              </td>
              <td>{user.branch}</td>
              <td>{user.year || "NA"}</td>
              <td>{user.leetcodeRating || "NA"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls - Only show if more than 10 items */}
      {sortedUsers.length > itemsPerPage && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                className={`page-number ${page === currentPage ? "active" : ""} ${page === "..." ? "dots" : ""}`}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default LeetcodeLeaderboard;
