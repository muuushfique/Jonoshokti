import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./Jonoshokti.png"; // Import the logo
import axios from "axios"; // Assuming axios is used for fetching data

function HomePage() {
  const [stats, setStats] = useState({
    currentIssues: { total: 0, inProgress: 0 },
    govtIssues: { total: 0, inProgress: 0 },
    solvedIssues: { total: 0 },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch government issues stats
        const govtResponse = await axios.get("http://localhost:1241/hm/govtissues");
        const { total: govtTotal, inProgress: govtInProgress } = govtResponse.data;

        // Fetch current issues stats
        const currentResponse = await axios.get("http://localhost:1241/hm/currentIssues");
        const { total: currentTotal, inProgress: currentInProgress } = currentResponse.data;

        // Fetch solved issues stats
        const solvedResponse = await axios.get("http://localhost:1241/hm/solvedIssues");
        const { total: solvedTotal } = solvedResponse.data;

        // Update the stats states
        setStats({
          currentIssues: { total: currentTotal, inProgress: currentInProgress },
          govtIssues: { total: govtTotal, inProgress: govtInProgress },
          solvedIssues: { total: solvedTotal },
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="homepage container mx-auto py-6 text-center flex flex-col min-h-screen">
      <header className="flex flex-col items-center mb-6">
        <img src={logo} alt="Jonoshokti Logo" className="h-16 w-auto mb-2" />
        <h1 className="text-4xl font-bold">Welcome to Jonoshokti</h1>
      </header>
      <p className="text-lg mb-8">
        Empowering Bangladeshi citizens to actively participate in governance.
        Raise, prioritize, and resolve issues to make a difference.
      </p>

      <div className="links grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
        <Link to="/current-issues">
          <div className="link-card border-2 border-blue-500 text-blue-500 py-6 px-4 rounded-lg shadow-md hover:shadow-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 bg-transparent">
            <h2 className="text-2xl font-semibold">Current Issues</h2>
            <p className="mt-2">View ongoing issues that need attention from citizens and authorities.</p>
            <p className="mt-4 text-sm text-gray-600">
              Total: {stats.currentIssues.total} | In Progress: {stats.currentIssues.inProgress}
            </p>
          </div>
        </Link>

        <Link to="/govt-issues">
          <div className="link-card border-2 border-green-500 text-green-500 py-6 px-4 rounded-lg shadow-md hover:shadow-xl hover:bg-green-100 hover:text-green-700 transition-all duration-300 bg-transparent">
            <h2 className="text-2xl font-semibold">Government Issues</h2>
            <p className="mt-2">Explore issues related to government policies and initiatives.</p>
            <p className="mt-4 text-sm text-gray-600">
              Total: {stats.govtIssues.total} | In Progress: {stats.govtIssues.inProgress}
            </p>
          </div>
        </Link>

        <Link to="/solved-issues">
          <div className="link-card border-2 border-gray-500 text-gray-500 py-6 px-4 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 bg-transparent">
            <h2 className="text-2xl font-semibold">Solved Issues</h2>
            <p className="mt-2">Celebrate and track the issues that have been resolved successfully.</p>
            <p className="mt-4 text-sm text-gray-600">
              Total: {stats.solvedIssues.total}
            </p>
          </div>
        </Link>
      </div>

      <footer className="mt-12 text-gray-600">
        <p>&copy; 2025 Jonoshokti. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
