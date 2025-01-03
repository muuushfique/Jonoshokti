const express = require('express');
const router = express.Router();
const schemas = require('../models/schemas')

router.get('/tweets', (req, res) => {
    const str = [
        {
            "name": "Codr Kai",
            "msg": "This is my first tweet!",
            "username": "codrkai"
        },
        {
            "name": "Samantha Kai",
            "msg": "React JS is so simple!",
            "username": "samanthakai"
        },
        {
            "name": "John K",
            "msg": "Sweep the leg!",
            "username": "johnk"
        }
    ];
    res.end(JSON.stringify(str));
});

let issues = [
    {
        id: 1,
        title: "Broken Streetlights",
        description: "Several streetlights are broken in downtown.",
        upvotes: 20,
        downvotes: 5,
        comments: 10,
        location: "Downtown"
    },
    {
        id: 2,
        title: "Potholes on Main Road",
        description: "Dangerous potholes on the main road need fixing.",
        upvotes: 50,
        downvotes: 3,
        comments: 25,
        location: "Main Road"
    }
];

router.get('/govt-issues', (req, res) => {
    res.json(issues);
});

router.post('/govt-issues', (req, res) => {
    const newIssue = {
        id: issues.length + 1, // Generate a unique ID
        title: req.body.title,
        description: req.body.description,
        upvotes: req.body.upvotes || 0, // Default to 0 if not provided
        downvotes: req.body.downvotes || 0, // Default to 0 if not provided
        comments: req.body.comments || 0, // Default to 0 if not provided
        location: req.body.location || "Unknown"
    };

    issues.push(newIssue);
    res.status(201).json({ message: "Issue added successfully!", issue: newIssue });
});

router.post('/addTweet', (req, res) => {
    res.end('NA');
});

let currentIssues = [
    {
        id: 1,
        title: "Climate Change Action Needed",
        description: "Immediate action is required to combat climate change.",
        urgency: "High",
        location: "Global"
    },
    {
        id: 2,
        title: "Homelessness in Urban Areas",
        description: "Increasing homelessness in cities is a major concern.",
        urgency: "Medium",
        location: "Urban Areas"
    }
];



router.delete('/current-issues/:id', (req, res) => {
    const { id } = req.params;
    const issueIndex = currentIssues.findIndex(issue => issue.id == id);

    if (issueIndex !== -1) {
        currentIssues.splice(issueIndex, 1);
        res.json({ message: "Current issue deleted successfully!" });
    } else {
        res.status(404).json({ message: "Current issue not found" });
    }
});

// Route to update a current issue by ID
router.put('/current-issues/:id', (req, res) => {
    const { id } = req.params;
    const issueIndex = currentIssues.findIndex(issue => issue.id == id);

    if (issueIndex !== -1) {
        const updatedIssue = {
            id: currentIssues[issueIndex].id,
            title: req.body.title || currentIssues[issueIndex].title,
            description: req.body.description || currentIssues[issueIndex].description,
            urgency: req.body.urgency || currentIssues[issueIndex].urgency,
            location: req.body.location || currentIssues[issueIndex].location
        };

        currentIssues[issueIndex] = updatedIssue;
        res.json({ message: "Issue updated successfully!", issue: updatedIssue });
    } else {
        res.status(404).json({ message: "Current issue not found" });
    }
});


//For Contact-us
router.post('/contact', async (req, res) => {
    const {email, website, message} = req.body
    
    const contactData = {email: email, website: website, message:message}
    const newContact = new schemas.Contact(contactData)
    const saveContact = await newContact.save()
    if (saveContact) {
        res.send('Message sent. Thank you.')
    }
    else{
        res.send('Failed to send message')
    }
    res.end()
})

router.get('/users', (req, res) => {
    const userData = 
    [
        {
            "id": 1,
            "name": "Leanne Graham",
            "username": "Bret",
            "email": "Sincere@april.biz",
            "phone": "1-770-736-8031 x56442",
            "website": "DotGovtBD",
          },
          {
            "id": 2,
            "name": "Ervin Howell",
            "username": "Antonette",
            "email": "Shanna@melissa.tv",
            "phone": "010-692-6593 x09125",
            "website": "Google",
          },
          {
            "id": 3,
            "name": "Clementine Bauch",
            "username": "Samantha",
            "email": "Nathan@yesenia.net",
            "website": "YouTube",
          },
    ]
    res.send(userData)
})

// Route to get all govt issues
router.get('/govt', async (req, res) => {
    try {
        // Fetch all documents from the govtIssues collection
        const issues = await schemas.GovtIssues.find();
        res.json(issues); // Send the fetched issues as a JSON response
    } catch (error) {
        console.error("Error fetching issues:", error);
        res.status(500).json({ message: "Error fetching issues" });
    }
});


const mongoose = require('mongoose');

router.put('/govt/:id', async (req, res) => {
    try {
        const { id } = req.params;  // This is the issue_id (string)
        const { upvotes, downvotes } = req.body;  

        // Update by issue_id (string), not _id
        const updatedIssue = await schemas.GovtIssues.findOneAndUpdate(
            { issue_id: id },  // Match by issue_id instead of _id
            {
                $set: {
                    issue_likes: upvotes,
                    issue_dislikes: downvotes
                }
            },
            { new: true }  // Return the updated document
        );

        if (!updatedIssue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json(updatedIssue);  // Return the updated issue
    } catch (error) {
        console.error("Error updating the issue:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Route to get issue details by issue_id
router.get('/govtissuedetails/:id', async (req, res) => {
    try {
        const { id } = req.params;  // Extract issue_id from request parameters

        // Find the issue by issue_id
        const issue = await schemas.GovtIssues.findOne({ issue_id: id });

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json(issue);  // Send the fetched issue as a JSON response
    } catch (error) {
        console.error("Error fetching issue details:", error);
        res.status(500).json({ message: "Error fetching issue details", error: error.message });
    }
});

//for homepage

// Government Issues
router.get('/hm/govtissues', async (req, res) => {
    try {
        const totalIssues = await schemas.GovtIssues.countDocuments();
        const inProgressIssues = await schemas.GovtIssues.countDocuments({ issue_status: "In Progress" });

        res.json({
            total: totalIssues,
            inProgress: inProgressIssues
        });
    } catch (error) {
        console.error("Error fetching government issues:", error);
        res.status(500).json({ message: "Error fetching government issues" });
    }
});


// Current Issues
router.get('/hm/currentIssues', async (req, res) => {
    try {
        const totalIssues = await schemas.Issue.countDocuments();
        const inProgressIssues = await schemas.Issue.countDocuments({ issue_status: "In Progress" });

        res.json({
            total: totalIssues,
            inProgress: inProgressIssues
        });
    } catch (error) {
        console.error("Error fetching current issues:", error);
        res.status(500).json({ message: "Error fetching current issues" });
    }
});

// Solved Issues
router.get('/hm/solvedIssues', async (req, res) => {
    try {
        const solvedIssues = await schemas.Issue.countDocuments({ issue_status: "Solved" });

        res.json({
            total: solvedIssues
        });
    } catch (error) {
        console.error("Error fetching solved issues:", error);
        res.status(500).json({ message: "Error fetching solved issues" });
    }
});

router.get('/search', async (req, res) => {
    const { title } = req.query;
    try {
        const issues = await schemas.GovtIssues.find({ issue_title: { $regex: title, $options: 'i' } });
        res.json(issues);
    } catch (error) {
        console.error("Error searching issues:", error);
        res.status(500).json({ message: "Error searching issues" });
    }
});

router.post('/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
  
    try {
      const issue = await schemas.GovtIssues.findOne({ issue_id: id });
  
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
  
      // Add the comment to the issue
      if (!issue.comments) {
        issue.comments = [];
      }
  
      issue.comments.push({ text: comment, date: new Date() });
      await issue.save();
  
      res.json({ message: "Comment added successfully!" });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  


module.exports = router;