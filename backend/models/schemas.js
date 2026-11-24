const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSubSchema = new Schema(
  {
    author: { type: String, default: 'Concerned Citizen', trim: true },
    text: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const issueFields = {
  issue_id: { type: String, required: true },
  issue_title: { type: String, required: true, trim: true },
  issue_description: { type: String, default: '', trim: true },
  issue_location: { type: String, default: 'Bangladesh', trim: true },
  issue_image: { type: String, default: '' },
  issue_likes: { type: Number, default: 0 },
  issue_dislikes: { type: Number, default: 0 },
  issue_status: {
    type: String,
    enum: ['Not Solved', 'In Progress', 'Solved'],
    default: 'Not Solved',
  },
  comments: { type: [commentSubSchema], default: [] },
  entryDate: { type: Date, default: Date.now },
};

const govtIssuesSchema = new Schema(issueFields, { timestamps: true });
const citizenIssueSchema = new Schema(issueFields, { timestamps: true });

const contactSchema = new Schema({
  name: { type: String, default: '', trim: true },
  email: { type: String, required: true, trim: true },
  website: { type: String, default: 'Direct', trim: true },
  message: { type: String, required: true, trim: true },
  entryDate: { type: Date, default: Date.now },
});

const communityServiceSchema = new Schema(
  {
    id: Number,
    url: String,
    title: String,
    description: String,
    remote_or_online: Boolean,
    organization: {
      name: String,
      logo: String,
      url: String,
    },
    activities: [{ name: String, category: String }],
    dates: String,
    duration: String,
    audience: {
      scope: String,
      longitude: Number,
      latitude: Number,
    },
  },
  { strict: false }
);

const volunteerRegistrationSchema = new Schema({
  programId: { type: String, required: true },
  programTitle: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '', trim: true },
  message: { type: String, default: '', trim: true },
  entryDate: { type: Date, default: Date.now },
});

const GovtIssues =
  mongoose.models.GovtIssues ||
  mongoose.model('GovtIssues', govtIssuesSchema, 'govtIssues');

const Issue =
  mongoose.models.Issue ||
  mongoose.model('Issue', citizenIssueSchema, 'Issue');

const Contact =
  mongoose.models.Contact ||
  mongoose.model('Contact', contactSchema, 'contact_form');

const CommunityService =
  mongoose.models.CommunityService ||
  mongoose.model('CommunityService', communityServiceSchema, 'community_service');

const VolunteerRegistration =
  mongoose.models.VolunteerRegistration ||
  mongoose.model('VolunteerRegistration', volunteerRegistrationSchema, 'volunteer_registrations');

module.exports = {
  GovtIssues,
  Issue,
  Contact,
  CommunityService,
  VolunteerRegistration,
};
