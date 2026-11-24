import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

const VOTES_KEY = 'jonoshokti-votes-v1';

export function getSavedVotes() {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveVoteState(issueKey, voteType) {
  const votes = getSavedVotes();
  if (!voteType) {
    delete votes[issueKey];
  } else {
    votes[issueKey] = voteType;
  }
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function computeVoteTransition(currentVote, clickedType) {
  let nextVote = clickedType;
  let likesDelta = 0;
  let dislikesDelta = 0;

  if (currentVote === clickedType) {
    // Toggle off
    nextVote = null;
    if (clickedType === 'upvote') likesDelta = -1;
    else dislikesDelta = -1;
  } else if (clickedType === 'upvote') {
    likesDelta = 1;
    if (currentVote === 'downvote') dislikesDelta = -1;
  } else {
    dislikesDelta = 1;
    if (currentVote === 'upvote') likesDelta = -1;
  }

  return { nextVote, likesDelta, dislikesDelta };
}

export const FALLBACK_ISSUE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23047857'/%3E%3Cstop offset='100%25' stop-color='%23064e3b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='260' fill='url(%23g)'/%3E%3Ccircle cx='200' cy='112' r='34' fill='%23dc2626' opacity='0.9'/%3E%3Ccircle cx='200' cy='112' r='12' fill='%23ffffff'/%3E%3Cpath d='M162 168C174 152 187 146 200 146C213 146 226 152 238 168' stroke='%23ffffff' stroke-width='7' stroke-linecap='round' fill='none'/%3E%3Ctext x='200' y='210' text-anchor='middle' fill='%23d1fae5' font-family='sans-serif' font-size='14' font-weight='600'%3EJONOSHOKTI CIVIC REPORT%3C/text%3E%3C/svg%3E";
