const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  website: { type: String },
  entryDate: { type: Date, default: Date.now },
});

const contactSchema = new Schema({
  email: { type: String },
  website: { type: String },
  message: { type: String },
  entryDate: { type: Date, default: Date.now },
});

// Schema for Government Issues
const govtIssuesSchema = new Schema({
  issue_id: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_image: { type: String, required: true },
  issue_likes: { type: Number, default: 0 },
  issue_dislikes: { type: Number, default: 0 },
  issue_status: { type: String, required: true },
  entryDate: { type: Date, default: Date.now },
});

const IssueSchema = new mongoose.Schema(
  {
    issue_id: { type: String, required: true, unique: true },
    issue_title: { type: String, required: true },
    issue_image: {type: String, required: false},
    issue_likes: {type: Number, default: 0},
    issue_dislikes: {type: Number, default: 0,},
    issue_status: {type: String, enum: ["Not Solved", "In Progress", "Solved"], required: true},
  }, { timestamps: true });

const Users = mongoose.model("Users", userSchema, "users");
const Contact = mongoose.model("Contact", contactSchema, "contact_form");
const GovtIssues = mongoose.model("GovtIssues", govtIssuesSchema, "govtIssues");
const Issue = mongoose.model("Issue", IssueSchema, 'Issue');

//exporting Schemas
const mySchemas = { Users: Users, Contact: Contact, GovtIssues: GovtIssues, Issue: Issue };

module.exports = mySchemas;
