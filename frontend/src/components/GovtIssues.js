import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function GovtIssues2() {
  const [issues, setIssues] = useState([]);
  const [comment, setComment] = useState(""); // Added for new comment functionality

  // Fetch issues from the backend using axios
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get("http://localhost:1241/govt");
        setIssues(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchIssues();
  }, []);

  // Fallback image for broken or missing URLs
  const fallbackImage = "https://via.placeholder.com/150"; // Placeholder image

  // Handle posting a comment such
  const handleComment = async (issueId) => {
    try {
      const response = await axios.post(`http://localhost:1241/comments/${issueId}`, {
        comment,
      });

      if (response.data) {
        alert("Comment added successfully!");
        setComment(""); // Clear the input after posting
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  // Handle upvote and downvote updates
  const handleVote = async (issueId, voteType) => {
    try {
      // Find the issue by its issue_id (string)
      const issueToUpdate = issues.find((issue) => issue.issue_id === issueId);

      if (!issueToUpdate) return; // If no issue is found, exit early

      // Prepare the updated vote count
      const updatedVotes = {
        upvotes:
          voteType === "upvote"
            ? issueToUpdate.issue_likes + 1
            : issueToUpdate.issue_likes,
        downvotes:
          voteType === "downvote"
            ? issueToUpdate.issue_dislikes + 1
            : issueToUpdate.issue_dislikes,
      };

      // Optimistically update the state
      const updatedIssues = issues.map((issue) =>
        issue.issue_id === issueId
          ? {
              ...issue,
              issue_likes: updatedVotes.upvotes,
              issue_dislikes: updatedVotes.downvotes,
            }
          : issue
      );
      setIssues(updatedIssues);

      // Send the updated votes to the backend
      const response = await axios.put(
        `http://localhost:1241/govt/${issueId}`,
        {
          upvotes: updatedVotes.upvotes,
          downvotes: updatedVotes.downvotes,
        }
      );

      // Sync with backend response (optional)
      if (response.data) {
        const refreshedIssues = await axios.get("http://localhost:1241/govt");
        setIssues(refreshedIssues.data);
      }
    } catch (error) {
      console.error("Error updating votes:", error);
      alert("Failed to update vote. Please try again.");

      // Rollback UI if request fails
      const rolledBackIssues = issues.map((issue) =>
        issue.issue_id === issueId
          ? {
              ...issue,
              issue_likes:
                voteType === "upvote"
                  ? issue.issue_likes - 1
                  : issue.issue_likes,
              issue_dislikes:
                voteType === "downvote"
                  ? issue.issue_dislikes - 1
                  : issue.issue_dislikes,
            }
          : issue
      );
      setIssues(rolledBackIssues);
    }
  };

  return (
    <div className="govt-issues2 container mx-auto py-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Government Issues
      </h1>
      <div className="actions mb-6 flex justify-between items-center">
        <input
          type="text"
          className="input input-bordered w-1/3"
          placeholder="Search issues..."
          value={comment}
          onChange={(e) => setComment(e.target.value)} // Capture comment input
        />
        <button className="btn btn-outline-secondary">Filter / Sort</button>
      </div>

      <div className="issue-list">
        {issues.map((issue) => (
          <div
            key={issue.issue_id}
            className="issue-card card mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="card-body flex items-center p-4">
              <img
                src={issue.issue_image || fallbackImage}
                alt={issue.issue_title}
                onError={(e) => (e.target.src = fallbackImage)}
                className="w-36 h-36 object-cover rounded-lg mr-4"
              />
              <div className="content ml-4 flex-1">
                <Link to={`/govtissuedetails/${issue.issue_id}`}>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">
                    {issue.issue_title}
                  </h4>
                </Link>
                <p className="text-sm text-gray-700 mb-4">
                  {issue.issue_status}
                </p>
                <div className="actions flex justify-between items-center">
                  <div className="flex gap-4">
                    <button
                      className="btn btn-success"
                      onClick={() => handleVote(issue.issue_id, "upvote")}
                    >
                      {issue.issue_likes} Upvotes
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={() => handleVote(issue.issue_id, "downvote")}
                    >
                      {issue.issue_dislikes} Downvotes
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => handleComment(issue.issue_id)}
                    >
                      Post Comment
                    </button>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GovtIssues2;
