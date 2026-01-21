import React, { useState } from "react";
import "./Sidebar.css";
import CodeforcesLeaderboard from "./CodeforcesLeaderboard";
import LeetcodeLeaderboard from "./LeetcodeLeaderboard";
import Navbar from "./Navbar";

const Sidebar = () => {
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("codeforces");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  return (
    <div>
      {/* Navbar for platform switch */}
      <Navbar onPlatformChange={setSelectedPlatform} />

      <div className="sidebar-layout">
        {/* ================= SIDEBAR ================= */}
        <div className="sidebar">

          {/* Search Bar */}
          <h2 className="sidebar-title">Search User</h2>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar-search"
          />

          {/* Course Filter */}
          <h2 className="sidebar-title">Courses</h2>
          <ul>
            <li onClick={() => handleCourseClick("All")}>All</li>
            <li onClick={() => handleCourseClick("MCA")}>MCA</li>
            <li onClick={() => handleCourseClick("MBA")}>MBA</li>
            <li onClick={() => handleCourseClick("MTECH")}>MTech</li>
            <li onClick={() => handleCourseClick("MSC")}>MSc</li>
            <li onClick={() => handleCourseClick("BTECH")}>BTech</li>
          </ul>

          {/* Year Filter */}
          <h2 className="sidebar-title">Year</h2>
          <ul>
            <li onClick={() => handleYearClick("All")}>All Years</li>
            <li onClick={() => handleYearClick("2024")}>2024</li>
            <li onClick={() => handleYearClick("2025")}>2025</li>
            <li onClick={() => handleYearClick("2026")}>2026</li>
            <li onClick={() => handleYearClick("2027")}>2027</li>
            <li onClick={() => handleYearClick("2028")}>2028</li>
          </ul>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="main-content">
          <div className="content-body">
            {selectedPlatform === "codeforces" ? (
              <CodeforcesLeaderboard
                selectedCourse={selectedCourse}
                selectedYear={selectedYear}
                searchQuery={searchQuery}
              />
            ) : (
              <LeetcodeLeaderboard
                selectedCourse={selectedCourse}
                selectedYear={selectedYear}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
