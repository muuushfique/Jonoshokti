const express = require('express');
const crypto = require('crypto');
const {
  GovtIssues,
  Issue,
  Contact,
  CommunityService,
  VolunteerRegistration,
} = require('../models/schemas');

const router = express.Router();

const ALLOWED_STATUSES = ['Not Solved', 'In Progress', 'Solved'];

function getModelBySource(source) {
  if (source === 'govt') return GovtIssues;
  if (source === 'current') return Issue;
  return null;
}

function normalizeIssue(doc, source) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: obj._id,
    issue_id: String(obj.issue_id),
    source,
    issue_title: obj.issue_title || 'Untitled Issue',
    issue_description:
      obj.issue_description ||
      (source === 'govt'
        ? 'Government policy and public infrastructure issue raised by citizens for institutional review and resolution.'
        : 'Community-reported civic issue requiring attention from citizens and local authorities.'),
    issue_location: obj.issue_location || inferLocation(obj.issue_title),
    issue_image: obj.issue_image || '',
    issue_likes: Number(obj.issue_likes) || 0,
    issue_dislikes: Number(obj.issue_dislikes) || 0,
    issue_status: obj.issue_status || 'Not Solved',
    comments: Array.isArray(obj.comments) ? obj.comments : [],
    entryDate: obj.entryDate || obj.createdAt || null,
  };
}

function inferLocation(title = '') {
  const lower = title.toLowerCase();
  if (lower.includes('dhaka')) return 'Dhaka';
  if (lower.includes('chattogram') || lower.includes('chittagong')) return 'Chattogram';
  if (lower.includes('rural')) return 'Rural Bangladesh';
  if (lower.includes('sylhet')) return 'Sylhet';
  if (lower.includes('rajshahi')) return 'Rajshahi';
  if (lower.includes('khulna')) return 'Khulna';
  return 'Bangladesh';
}

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Jonoshokti API' });
});

// Consolidated dashboard & analytics stats
router.get('/stats', async (_req, res) => {
  try {
    const [govtDocs, currentDocs, communityCount, volunteerCount] = await Promise.all([
      GovtIssues.find().lean(),
      Issue.find().lean(),
      CommunityService.countDocuments(),
      VolunteerRegistration.countDocuments(),
    ]);

    const govtNormalized = govtDocs.map((d) => normalizeIssue(d, 'govt'));
    const currentNormalized = currentDocs.map((d) => normalizeIssue(d, 'current'));
    const allIssues = [...govtNormalized, ...currentNormalized];

    const countByStatus = (list, status) =>
      list.filter((item) => item.issue_status === status).length;

    const totalUpvotes = allIssues.reduce((sum, i) => sum + i.issue_likes, 0);
    const totalDownvotes = allIssues.reduce((sum, i) => sum + i.issue_dislikes, 0);
    const totalComments = allIssues.reduce((sum, i) => sum + i.comments.length, 0);

    const solvedTotal = countByStatus(allIssues, 'Solved');
    const inProgressTotal = countByStatus(allIssues, 'In Progress');
    const notSolvedTotal = countByStatus(allIssues, 'Not Solved');

    const topIssues = [...allIssues]
      .sort((a, b) => b.issue_likes - a.issue_likes)
      .slice(0, 5)
      .map(({ issue_image, ...rest }) => rest);

    const recentActivity = [...allIssues]
      .sort((a, b) => b.issue_likes - a.issue_likes)
      .slice(0, 4)
      .map((i) => ({
        id: `${i.source}-${i.issue_id}`,
        source: i.source,
        issue_id: i.issue_id,
        title: i.issue_title,
        status: i.issue_status,
        upvotes: i.issue_likes,
      }));

    res.json({
      currentIssues: {
        total: currentNormalized.length,
        inProgress: countByStatus(currentNormalized, 'In Progress'),
        notSolved: countByStatus(currentNormalized, 'Not Solved'),
        solved: countByStatus(currentNormalized, 'Solved'),
      },
      govtIssues: {
        total: govtNormalized.length,
        inProgress: countByStatus(govtNormalized, 'In Progress'),
        notSolved: countByStatus(govtNormalized, 'Not Solved'),
        solved: countByStatus(govtNormalized, 'Solved'),
      },
      solvedIssues: {
        total: solvedTotal,
      },
      overall: {
        totalIssues: allIssues.length,
        solved: solvedTotal,
        inProgress: inProgressTotal,
        notSolved: notSolvedTotal,
        resolutionRate: allIssues.length
          ? Math.round((solvedTotal / allIssues.length) * 100)
          : 0,
        totalVotes: totalUpvotes + totalDownvotes,
        totalUpvotes,
        totalComments,
      },
      communityPrograms: {
        total: communityCount,
        volunteers: volunteerCount,
      },
      topIssues,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to load platform statistics.' });
  }
});

// List issues with category, status, search, and sort
router.get('/issues', async (req, res) => {
  try {
    const { category = 'all', status = 'all', search = '', sort = 'most-upvoted' } = req.query;

    const query = {};
    if (status && status !== 'all' && ALLOWED_STATUSES.includes(status)) {
      query.issue_status = status;
    }
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { issue_title: { $regex: escaped, $options: 'i' } },
        { issue_description: { $regex: escaped, $options: 'i' } },
        { issue_location: { $regex: escaped, $options: 'i' } },
      ];
    }

    let results = [];

    if (category === 'govt') {
      const docs = await GovtIssues.find(query).lean();
      results = docs.map((d) => normalizeIssue(d, 'govt'));
    } else if (category === 'current') {
      const docs = await Issue.find(query).lean();
      results = docs.map((d) => normalizeIssue(d, 'current'));
    } else if (category === 'solved') {
      const solvedQuery = { ...query, issue_status: 'Solved' };
      const [govtDocs, currentDocs] = await Promise.all([
        GovtIssues.find(solvedQuery).lean(),
        Issue.find(solvedQuery).lean(),
      ]);
      results = [
        ...govtDocs.map((d) => normalizeIssue(d, 'govt')),
        ...currentDocs.map((d) => normalizeIssue(d, 'current')),
      ];
    } else {
      const [govtDocs, currentDocs] = await Promise.all([
        GovtIssues.find(query).lean(),
        Issue.find(query).lean(),
      ]);
      results = [
        ...govtDocs.map((d) => normalizeIssue(d, 'govt')),
        ...currentDocs.map((d) => normalizeIssue(d, 'current')),
      ];
    }

    switch (sort) {
      case 'least-upvoted':
        results.sort((a, b) => a.issue_likes - b.issue_likes);
        break;
      case 'most-discussed':
        results.sort((a, b) => b.comments.length - a.comments.length);
        break;
      case 'newest':
        results.sort((a, b) => {
          const da = a.entryDate ? new Date(a.entryDate).getTime() : 0;
          const db = b.entryDate ? new Date(b.entryDate).getTime() : 0;
          return db - da;
        });
        break;
      case 'most-upvoted':
      default:
        results.sort((a, b) => b.issue_likes - a.issue_likes);
        break;
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Failed to load issues.' });
  }
});

// Create a new issue (citizen or government)
router.post('/issues', async (req, res) => {
  try {
    const {
      source = 'current',
      issue_title,
      issue_description = '',
      issue_location = 'Bangladesh',
      issue_image = '',
      issue_status = 'Not Solved',
    } = req.body;

    if (!issue_title || !issue_title.trim()) {
      return res.status(400).json({ message: 'Issue title is required.' });
    }

    const Model = getModelBySource(source);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid issue category.' });
    }

    const validStatus = ALLOWED_STATUSES.includes(issue_status) ? issue_status : 'Not Solved';
    const issueId = `${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;

    const created = await Model.create({
      issue_id: issueId,
      issue_title: issue_title.trim(),
      issue_description: issue_description.trim(),
      issue_location: issue_location.trim() || 'Bangladesh',
      issue_image: issue_image.trim(),
      issue_likes: 1,
      issue_dislikes: 0,
      issue_status: validStatus,
      comments: [],
    });

    res.status(201).json(normalizeIssue(created, source));
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Failed to create issue.' });
  }
});

// Get single issue details
router.get('/issues/:source/:id', async (req, res) => {
  try {
    const { source, id } = req.params;
    const Model = getModelBySource(source);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid issue source.' });
    }

    const issue = await Model.findOne({ issue_id: id }).lean();
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    res.json(normalizeIssue(issue, source));
  } catch (error) {
    console.error('Error fetching issue details:', error);
    res.status(500).json({ message: 'Failed to load issue details.' });
  }
});

// Atomic vote update (supports toggle + switch)
router.patch('/issues/:source/:id/vote', async (req, res) => {
  try {
    const { source, id } = req.params;
    const { likesDelta = 0, dislikesDelta = 0 } = req.body;

    const Model = getModelBySource(source);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid issue source.' });
    }

    const safeLikes = Math.max(-1, Math.min(1, Number(likesDelta) || 0));
    const safeDislikes = Math.max(-1, Math.min(1, Number(dislikesDelta) || 0));

    const updated = await Model.findOneAndUpdate(
      { issue_id: id },
      { $inc: { issue_likes: safeLikes, issue_dislikes: safeDislikes } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Prevent negative counts
    if (updated.issue_likes < 0 || updated.issue_dislikes < 0) {
      updated.issue_likes = Math.max(0, updated.issue_likes);
      updated.issue_dislikes = Math.max(0, updated.issue_dislikes);
      await updated.save();
    }

    res.json(normalizeIssue(updated, source));
  } catch (error) {
    console.error('Error updating vote:', error);
    res.status(500).json({ message: 'Failed to update vote.' });
  }
});

// Update issue status
router.patch('/issues/:source/:id/status', async (req, res) => {
  try {
    const { source, id } = req.params;
    const { status } = req.body;

    const Model = getModelBySource(source);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid issue source.' });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updated = await Model.findOneAndUpdate(
      { issue_id: id },
      { $set: { issue_status: status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    res.json(normalizeIssue(updated, source));
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update issue status.' });
  }
});

// Add comment to an issue
router.post('/issues/:source/:id/comments', async (req, res) => {
  try {
    const { source, id } = req.params;
    const { author = 'Concerned Citizen', text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const Model = getModelBySource(source);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid issue source.' });
    }

    const newComment = {
      author: (author || 'Concerned Citizen').trim() || 'Concerned Citizen',
      text: text.trim(),
      date: new Date(),
    };

    const updated = await Model.findOneAndUpdate(
      { issue_id: id },
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    res.status(201).json(normalizeIssue(updated, source));
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to post comment.' });
  }
});

// Community service programs
router.get('/community-service', async (req, res) => {
  try {
    const { search = '', category = 'all', mode = 'all' } = req.query;
    const programs = await CommunityService.find().lean();

    let filtered = programs;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.organization?.name || '').toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((p) =>
        (p.activities || []).some(
          (a) => (a.category || '').toLowerCase() === category.toLowerCase()
        )
      );
    }

    if (mode === 'remote') {
      filtered = filtered.filter((p) => Boolean(p.remote_or_online));
    } else if (mode === 'in-person') {
      filtered = filtered.filter((p) => !p.remote_or_online);
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching community service programs:', error);
    res.status(500).json({ message: 'Failed to load community service programs.' });
  }
});

// Register volunteer interest
router.post('/community-service/:id/volunteer', async (req, res) => {
  try {
    const { id } = req.params;
    const { programTitle = 'Community Program', name, email, phone = '', message = '' } = req.body;

    if (!name || !name.trim() || !email || !email.trim()) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const registration = await VolunteerRegistration.create({
      programId: String(id),
      programTitle: programTitle.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      message: 'Thank you for volunteering! Your registration has been recorded.',
      registration,
    });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(500).json({ message: 'Failed to submit volunteer registration.' });
  }
});

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name = '', email, website = 'Direct', message } = req.body;

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please enter a message.' });
    }

    await Contact.create({
      name: name.trim(),
      email: email.trim(),
      website: website.trim() || 'Direct',
      message: message.trim(),
    });

    res.status(201).json({ message: 'Message sent successfully. Thank you for reaching out!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
