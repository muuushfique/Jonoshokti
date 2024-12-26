const express = require('express');
const router = express.Router();

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




module.exports = router;