import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function IssueDetails() {
  const { id } = useParams(); // Get the issue_id from URL params
  const [issue, setIssue] = useState(null); // State to store the issue details
  const [loading, setLoading] = useState(true); // State to manage loading

  const fallbackImage = "https://via.placeholder.com/150"; // Fallback for missing or broken images

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get(`http://localhost:1241/govtissuedetails/${id}`);
        setIssue(response.data);
      } catch (error) {
        console.error("Error fetching issue details:", error);
        alert("Failed to load issue details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  // Handle upvote and downvote updates
  const handleVote = async (voteType) => {
    if (!issue) return;

    try {
      const updatedVotes = {
        upvotes: voteType === "upvote" ? issue.issue_likes + 1 : issue.issue_likes,
        downvotes: voteType === "downvote" ? issue.issue_dislikes + 1 : issue.issue_dislikes,
      };

      // Optimistic update
      setIssue({
        ...issue,
        issue_likes: updatedVotes.upvotes,
        issue_dislikes: updatedVotes.downvotes,
      });

      // Send updated votes to the backend
      await axios.put(`http://localhost:1241/govt/${id}`, {
        upvotes: updatedVotes.upvotes,
        downvotes: updatedVotes.downvotes,
      });
    } catch (error) {
      console.error("Error updating votes:", error);
      alert("Failed to update votes. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading issue details...</div>;
  }

  if (!issue) {
    return <div>Issue not found. Please check the issue ID.</div>;
  }

  return (
    <div className="issue-details container mx-auto py-6">
      <h1 className="text-3xl font-semibold text-center mb-6">{issue.issue_title}</h1>

      <div className="issue-card card mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="card-body flex items-center p-4">
          <img
            src={issue.issue_image || fallbackImage}
            alt={issue.issue_title}
            onError={(e) => (e.target.src = fallbackImage)}
            className="w-48 h-48 object-cover rounded-lg mr-4"
          />
          <div className="content ml-4 flex-1">
            <p className="text-lg text-gray-700 mb-2">
              <strong>Status:</strong> {issue.issue_status}
            </p>
            <p className="text-lg text-gray-700 mb-2">
              <strong>Description:</strong> {issue.issue_description || "No description provided."}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              <strong>Location:</strong> {issue.issue_location || "Not specified."}
            </p>
            <div className="actions flex justify-between items-center">
              <button
                className="btn btn-success"
                onClick={() => handleVote("upvote")}
              >
                {issue.issue_likes} Upvotes
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleVote("downvote")}
              >
                {issue.issue_dislikes} Downvotes
              </button>
              <button className="btn btn-info">Comments (0)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetails;
