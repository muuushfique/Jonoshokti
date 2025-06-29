import './App.css';
import Nav from './components/Nav';
// import Home from './components/Home';
import Tweet from './components/Tweet';
import IssueDetails from './components/IssueDetails'
import Contact from './components/Contact'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GovtIssues2 from './components/GovtIssues';
import HomePage from './components/Homepage';

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tweets" element={<Tweet />} />
          <Route path="contact-us" element={<Contact />} />
          <Route path="/govtissuedetail/:id" element={<IssueDetails />} />
          <Route path="/govt-issues" element={<GovtIssues2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;