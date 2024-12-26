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
            "address": {
              "street": "Kulas Light",
              "suite": "Apt. 556",
              "city": "Gwenborough",
              "zipcode": "92998-3874",
              "geo": {
                "lat": "-37.3159",
                "lng": "81.1496"
              }
            },
            "phone": "1-770-736-8031 x56442",
            "website": "DotGovtBD",
            "company": {
              "name": "Romaguera-Crona",
              "catchPhrase": "Multi-layered client-server neural-net",
              "bs": "harness real-time e-markets"
            }
          },
          {
            "id": 2,
            "name": "Ervin Howell",
            "username": "Antonette",
            "email": "Shanna@melissa.tv",
            "address": {
              "street": "Victor Plains",
              "suite": "Suite 879",
              "city": "Wisokyburgh",
              "zipcode": "90566-7771",
              "geo": {
                "lat": "-43.9509",
                "lng": "-34.4618"
              }
            },
            "phone": "010-692-6593 x09125",
            "website": "Google",
            "company": {
              "name": "Deckow-Crist",
              "catchPhrase": "Proactive didactic contingency",
              "bs": "synergize scalable supply-chains"
            }
          },
          {
            "id": 3,
            "name": "Clementine Bauch",
            "username": "Samantha",
            "email": "Nathan@yesenia.net",
            "address": {
              "street": "Douglas Extension",
              "suite": "Suite 847",
              "city": "McKenziehaven",
              "zipcode": "59590-4157",
              "geo": {
                "lat": "-68.6102",
                "lng": "-47.0653"
              }
            },
            "phone": "1-463-123-4447",
            "website": "YouTube",
            "company": {
              "name": "Romaguera-Jacobson",
              "catchPhrase": "Face to face bifurcated interface",
              "bs": "e-enable strategic applications"
            }
          },
    ]
    res.send(userData)
})

module.exports = router;