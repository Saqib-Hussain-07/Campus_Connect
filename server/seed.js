const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Group = require('./models/Group');
const Project = require('./models/Project');
const Event = require('./models/Event');
const Connection = require('./models/Connection');
const Message = require('./models/Message');
const Notice = require('./models/Notice');
const Resource = require('./models/Resource');
const Activity = require('./models/Activity');
const Notification = require('./models/Notification');
const Newsletter = require('./models/Newsletter');
const ContactMessage = require('./models/ContactMessage');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from potential locations (.env in root or server folder)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear all existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await Project.deleteMany({});
    await Event.deleteMany({});
    await Connection.deleteMany({});
    await Message.deleteMany({});
    await Notice.deleteMany({});
    await Resource.deleteMany({});
    await Activity.deleteMany({});
    await Notification.deleteMany({});
    await Newsletter.deleteMany({});
    await ContactMessage.deleteMany({});
    console.log('Cleared existing collections.');

    const hash = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const usersData = [
      { name: 'Priya Sharma', email: 'priya@iitmumbai.edu', password: hash, department: 'Computer Science', semester: 6, university: 'IIT Mumbai', skills: ['Python', 'Machine Learning', 'React', 'Node.js'], bio: 'Passionate about AI and web development. Looking for project partners!', isOnline: true },
      { name: 'Arjun Patel', email: 'arjun@nitsurat.edu', password: hash, department: 'Mechanical Engineering', semester: 4, university: 'NIT Surat', skills: ['CAD/SolidWorks', 'Thermodynamics', 'MATLAB', 'AutoCAD'], bio: 'Mechanical enthusiast. Into robotics and automation.', isOnline: true },
      { name: 'Sneha Reddy', email: 'sneha@spjimr.edu', password: hash, department: 'Business Administration', semester: 5, university: 'SPJIMR', skills: ['Marketing', 'Finance', 'Excel', 'Power BI'], bio: 'BBA student with a passion for startups and finance.', isOnline: false },
      { name: 'Vikram Das', email: 'vikram@nift.edu', password: hash, department: 'UX Design', semester: 3, university: 'NIFT Delhi', skills: ['Figma', 'UI Design', 'Prototyping', 'Illustrator'], bio: 'UX designer focused on accessibility and clean interfaces.', isOnline: false },
      { name: 'Meera Joshi', email: 'meera@bits.edu', password: hash, department: 'Computer Science', semester: 8, university: 'BITS Pilani', skills: ['Java', 'Spring Boot', 'AWS', 'Docker'], bio: 'Final year CS student. Backend dev, cloud enthusiast.', isOnline: true },
      { name: 'Karthik Nair', email: 'karthik@vit.edu', password: hash, department: 'Mechanical Engineering', semester: 6, university: 'VIT Vellore', skills: ['Robotics', '3D Printing', 'Arduino', 'Embedded C'], bio: 'Robotics club lead. Building autonomous drones.', isOnline: true }
    ];

    const users = await User.create(usersData);
    console.log('Created Users.');

    // Helper map names to ids
    const uMap = {};
    users.forEach(u => {
      uMap[u.name] = u._id;
    });

    // Add endorsements to users
    // Priya
    users[0].endorsements.push(
      { skill: 'Python', endorserId: uMap['Arjun Patel'] },
      { skill: 'React', endorserId: uMap['Sneha Reddy'] },
      { skill: 'Machine Learning', endorserId: uMap['Vikram Das'] },
      { skill: 'Node.js', endorserId: uMap['Meera Joshi'] }
    );
    // Arjun
    users[1].endorsements.push(
      { skill: 'CAD/SolidWorks', endorserId: uMap['Priya Sharma'] },
      { skill: 'Robotics', endorserId: uMap['Karthik Nair'] },
      { skill: 'MATLAB', endorserId: uMap['Sneha Reddy'] }
    );
    // Sneha
    users[2].endorsements.push(
      { skill: 'Marketing', endorserId: uMap['Priya Sharma'] },
      { skill: 'Finance', endorserId: uMap['Meera Joshi'] },
      { skill: 'Excel', endorserId: uMap['Vikram Das'] }
    );
    // Vikram
    users[3].endorsements.push(
      { skill: 'Figma', endorserId: uMap['Priya Sharma'] },
      { skill: 'UI Design', endorserId: uMap['Sneha Reddy'] },
      { skill: 'Prototyping', endorserId: uMap['Meera Joshi'] }
    );
    // Meera
    users[4].endorsements.push(
      { skill: 'Java', endorserId: uMap['Priya Sharma'] },
      { skill: 'AWS', endorserId: uMap['Arjun Patel'] },
      { skill: 'Docker', endorserId: uMap['Karthik Nair'] }
    );
    // Karthik
    users[5].endorsements.push(
      { skill: 'Robotics', endorserId: uMap['Arjun Patel'] },
      { skill: 'Arduino', endorserId: uMap['Priya Sharma'] },
      { skill: 'Embedded C', endorserId: uMap['Meera Joshi'] }
    );

    for (const u of users) {
      await u.save();
    }
    console.log('Seeded Endorsements.');

    // 2. Connections
    // Let's establish accepted connections between Priya <-> Arjun, Priya <-> Sneha, Priya <-> Vikram, Priya <-> Meera
    // Let's establish pending request from Sneha -> Vikram
    const connectionsData = [
      { fromUser: uMap['Priya Sharma'], toUser: uMap['Arjun Patel'], status: 'accepted' },
      { fromUser: uMap['Priya Sharma'], toUser: uMap['Sneha Reddy'], status: 'accepted' },
      { fromUser: uMap['Priya Sharma'], toUser: uMap['Vikram Das'], status: 'accepted' },
      { fromUser: uMap['Priya Sharma'], toUser: uMap['Meera Joshi'], status: 'accepted' },
      { fromUser: uMap['Arjun Patel'], toUser: uMap['Meera Joshi'], status: 'accepted' },
      { fromUser: uMap['Arjun Patel'], toUser: uMap['Karthik Nair'], status: 'accepted' },
      { fromUser: uMap['Sneha Reddy'], toUser: uMap['Meera Joshi'], status: 'accepted' },
      { fromUser: uMap['Vikram Das'], toUser: uMap['Meera Joshi'], status: 'accepted' },
      { fromUser: uMap['Karthik Nair'], toUser: uMap['Meera Joshi'], status: 'accepted' },
      // Pendings
      { fromUser: uMap['Arjun Patel'], toUser: uMap['Priya Sharma'], status: 'pending' }, // pending to Priya
      { fromUser: uMap['Sneha Reddy'], toUser: uMap['Vikram Das'], status: 'pending' }
    ];
    await Connection.create(connectionsData);
    console.log('Created Connections.');

    // 3. Create Groups
    const groupsData = [
      { name: 'DBMS Study Circle', description: 'Weekly sessions on SQL, normalization, ER diagrams, and exam prep.', type: 'study', status: 'active', createdBy: uMap['Priya Sharma'], members: [uMap['Priya Sharma'], uMap['Arjun Patel'], uMap['Sneha Reddy'], uMap['Vikram Das']] },
      { name: 'AI Research Team', description: 'Building an AI campus assistant. Seeking ML, NLP, full-stack devs.', type: 'project', status: 'recruiting', createdBy: uMap['Priya Sharma'], members: [uMap['Priya Sharma'], uMap['Meera Joshi'], uMap['Karthik Nair']] },
      { name: 'Tech Talk Forum', description: 'Discuss tech trends, career advice, interview prep, industry insights.', type: 'forum', status: 'open', createdBy: uMap['Arjun Patel'], members: [uMap['Arjun Patel'], uMap['Sneha Reddy'], uMap['Vikram Das'], uMap['Meera Joshi'], uMap['Karthik Nair']] },
      { name: 'Math Masters', description: 'Calculus, linear algebra, probability — collaborative problem-solving.', type: 'study', status: 'active', createdBy: uMap['Sneha Reddy'], members: [uMap['Sneha Reddy'], uMap['Vikram Das']] },
      { name: 'App Dev Hub', description: 'Building a campus food ordering app. Needs Flutter, UI, backend devs.', type: 'project', status: 'recruiting', createdBy: uMap['Vikram Das'], members: [uMap['Vikram Das'], uMap['Meera Joshi']] },
      { name: 'Career Connect', description: 'Resume reviews, mock interviews, internship referrals and resources.', type: 'forum', status: 'open', createdBy: uMap['Meera Joshi'], members: [uMap['Priya Sharma'], uMap['Arjun Patel'], uMap['Sneha Reddy'], uMap['Vikram Das'], uMap['Meera Joshi'], uMap['Karthik Nair']] }
    ];
    await Group.create(groupsData);
    console.log('Created Groups.');

    // 4. Create Projects
    const projectsData = [
      {
        userId: uMap['Priya Sharma'],
        title: 'SmartCampus AI Assistant',
        description: 'An AI-powered chatbot for answering campus queries — hostel rules, timetable, events. Built with GPT-4 API and React.',
        techStack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'GPT-4'],
        githubUrl: 'https://github.com/demo/smartcampus',
        liveUrl: 'https://smartcampus.demo.io',
        category: 'ml',
        status: 'completed',
        teamSize: 3,
        likes: [uMap['Arjun Patel'], uMap['Sneha Reddy'], uMap['Vikram Das'], uMap['Meera Joshi'], uMap['Karthik Nair']],
        views: 180,
        comments: [
          { userId: uMap['Arjun Patel'], body: 'Amazing project! Love the UI.' },
          { userId: uMap['Meera Joshi'], body: 'Let me know if you plan to move the backend to AWS!' }
        ]
      },
      {
        userId: uMap['Priya Sharma'],
        title: 'Campus Lost & Found App',
        description: 'Mobile app to report and reclaim lost items on campus. Features image uploads, geo-tagging and real-time notifications.',
        techStack: ['Flutter', 'Firebase', 'Dart', 'Google Maps API'],
        githubUrl: 'https://github.com/demo/lostandfound',
        liveUrl: '',
        category: 'mobile',
        status: 'in_progress',
        teamSize: 2,
        likes: [uMap['Arjun Patel'], uMap['Meera Joshi']],
        views: 94
      },
      {
        userId: uMap['Arjun Patel'],
        title: 'Automated Greenhouse Robot',
        description: 'Arduino-based robot that monitors soil moisture, temperature and auto-waters plants. Presented at National Robotics Expo.',
        techStack: ['Arduino', 'C++', 'Sensors', '3D Printing', 'SolidWorks'],
        githubUrl: 'https://github.com/demo/greenhouse',
        liveUrl: '',
        category: 'hardware',
        status: 'completed',
        teamSize: 2,
        likes: [uMap['Priya Sharma'], uMap['Karthik Nair']],
        views: 142
      },
      {
        userId: uMap['Sneha Reddy'],
        title: 'Campus Budget Tracker',
        description: 'Web app for college societies to track budgets, expenses and generate reports. Used by 5 societies at SPJIMR.',
        techStack: ['PHP', 'MySQL', 'Bootstrap', 'Chart.js'],
        githubUrl: 'https://github.com/demo/budgettracker',
        liveUrl: 'https://budget.demo.io',
        category: 'web',
        status: 'completed',
        teamSize: 1,
        likes: [uMap['Priya Sharma']],
        views: 67
      },
      {
        userId: uMap['Vikram Das'],
        title: 'University Design System',
        description: 'A comprehensive UI kit and design system for university web apps — components, icons, typography guidelines.',
        techStack: ['Figma', 'CSS', 'JavaScript', 'Storybook'],
        githubUrl: 'https://github.com/demo/unidesign',
        liveUrl: 'https://figma.com/demo',
        category: 'web',
        status: 'completed',
        teamSize: 1,
        likes: [uMap['Priya Sharma'], uMap['Arjun Patel'], uMap['Sneha Reddy']],
        views: 210
      },
      {
        userId: uMap['Meera Joshi'],
        title: 'CloudDeploy CLI',
        description: 'Open-source CLI tool to deploy student projects to AWS with a single command. 120+ GitHub stars.',
        techStack: ['Java', 'AWS SDK', 'Spring Boot', 'Docker', 'Terraform'],
        githubUrl: 'https://github.com/demo/clouddeploy',
        liveUrl: '',
        category: 'ml',
        status: 'completed',
        teamSize: 2,
        likes: [uMap['Priya Sharma'], uMap['Arjun Patel'], uMap['Sneha Reddy'], uMap['Vikram Das'], uMap['Karthik Nair']],
        views: 380
      },
      {
        userId: uMap['Karthik Nair'],
        title: 'Drone Swarm Controller',
        description: 'Research project on coordinating multiple drones using a centralised controller. Paper submitted to IEEE.',
        techStack: ['Python', 'ROS', 'C++', 'Arduino', 'Embedded C'],
        githubUrl: 'https://github.com/demo/droneswarm',
        liveUrl: '',
        category: 'hardware',
        status: 'in_progress',
        teamSize: 3,
        likes: [uMap['Priya Sharma'], uMap['Arjun Patel']],
        views: 195
      }
    ];
    await Project.create(projectsData);
    console.log('Created Projects.');

    // 5. Create Events
    const eventsData = [
      {
        userId: uMap['Priya Sharma'],
        title: 'HackFest 2025 — 36-Hour Hackathon',
        description: 'Annual inter-college hackathon. Build anything in 36 hours. Prizes worth ₹2,00,000. Teams of 2-4.',
        category: 'hackathon',
        venue: 'LH-101 Auditorium, IIT Mumbai',
        eventDate: new Date('2025-11-15T09:00:00'),
        registrationDeadline: new Date('2025-11-10T23:59:00'),
        maxAttendees: 200,
        isOnline: false,
        bannerSeed: 'ev1',
        rsvps: [
          { userId: uMap['Priya Sharma'], status: 'going' },
          { userId: uMap['Arjun Patel'], status: 'going' },
          { userId: uMap['Sneha Reddy'], status: 'interested' },
          { userId: uMap['Vikram Das'], status: 'going' },
          { userId: uMap['Meera Joshi'], status: 'going' }
        ]
      },
      {
        userId: uMap['Arjun Patel'],
        title: 'Robotics & Automation Workshop',
        description: 'Hands-on workshop on Arduino, servo motors, and sensor integration. Beginner-friendly. Kit included.',
        category: 'workshop',
        venue: 'Mechanical Lab, Block C',
        eventDate: new Date('2025-10-20T10:00:00'),
        registrationDeadline: new Date('2025-10-18T23:59:00'),
        maxAttendees: 40,
        isOnline: false,
        bannerSeed: 'ev2',
        rsvps: [
          { userId: uMap['Arjun Patel'], status: 'going' },
          { userId: uMap['Karthik Nair'], status: 'going' },
          { userId: uMap['Priya Sharma'], status: 'interested' }
        ]
      },
      {
        userId: uMap['Sneha Reddy'],
        title: 'Startup Pitch Day',
        description: 'Present your startup idea to a panel of investors and industry mentors. Cash prizes and incubation support.',
        category: 'seminar',
        venue: 'Auditorium Hall, SPJIMR',
        eventDate: new Date('2025-10-28T11:00:00'),
        registrationDeadline: new Date('2025-10-25T23:59:00'),
        maxAttendees: 100,
        isOnline: false,
        bannerSeed: 'ev3',
        rsvps: [
          { userId: uMap['Sneha Reddy'], status: 'going' },
          { userId: uMap['Priya Sharma'], status: 'going' },
          { userId: uMap['Meera Joshi'], status: 'going' }
        ]
      },
      {
        userId: uMap['Meera Joshi'],
        title: 'DevOps & Cloud Computing Bootcamp',
        description: 'Two-day intensive bootcamp on Docker, Kubernetes, CI/CD pipelines and AWS. Certificate provided.',
        category: 'workshop',
        venue: 'Online (Zoom)',
        eventDate: new Date('2025-11-05T09:00:00'),
        registrationDeadline: new Date('2025-11-03T23:59:00'),
        maxAttendees: 500,
        isOnline: true,
        bannerSeed: 'ev4',
        rsvps: [
          { userId: uMap['Meera Joshi'], status: 'going' },
          { userId: uMap['Priya Sharma'], status: 'going' },
          { userId: uMap['Karthik Nair'], status: 'going' }
        ]
      },
      {
        userId: uMap['Vikram Das'],
        title: 'UX Design Sprint',
        description: 'A full-day design sprint to solve a real campus problem. Figma, user research, prototyping — all in one day.',
        category: 'workshop',
        venue: 'Design Studio, NIFT',
        eventDate: new Date('2025-10-25T09:00:00'),
        registrationDeadline: new Date('2025-10-22T23:59:00'),
        maxAttendees: 30,
        isOnline: false,
        bannerSeed: 'ev5',
        rsvps: [
          { userId: uMap['Vikram Das'], status: 'going' },
          { userId: uMap['Priya Sharma'], status: 'interested' }
        ]
      },
      {
        userId: uMap['Priya Sharma'],
        title: 'Inter-College Tech Olympiad',
        description: 'Competitive programming + tech quiz. Individual event. Rank in top 10 to win internship referrals.',
        category: 'hackathon',
        venue: 'Online',
        eventDate: new Date('2025-11-22T10:00:00'),
        registrationDeadline: new Date('2025-11-20T23:59:00'),
        maxAttendees: 0,
        isOnline: true,
        bannerSeed: 'ev6',
        rsvps: [
          { userId: uMap['Priya Sharma'], status: 'going' },
          { userId: uMap['Meera Joshi'], status: 'going' },
          { userId: uMap['Arjun Patel'], status: 'going' }
        ]
      }
    ];
    await Event.create(eventsData);
    console.log('Created Events.');

    // 6. Create Notices
    const noticesData = [
      { userId: uMap['Priya Sharma'], title: 'Summer Internship at TechCorp — Apply Now', body: 'TechCorp is hiring summer interns for software development. 3-month paid internship. Min CGPA 7.5. Apply by Oct 30.', category: 'internship', tags: ['tech', 'internship', 'software', 'paid'], isPinned: true },
      { userId: uMap['Meera Joshi'], title: 'AWS Free Tier Study Resources — Shared Drive', body: 'I have compiled all AWS certification study material, mock tests and cheatsheets in a Google Drive folder. DM me for access.', category: 'academic', tags: ['aws', 'cloud', 'resources', 'free'], isPinned: false },
      { userId: uMap['Sneha Reddy'], title: 'Lost: Black Laptop Bag near Library', body: 'Lost my black laptop bag (Dell XPS inside) near the central library on Oct 12. Please contact if found. Reward offered.', category: 'general', tags: ['lost', 'laptop', 'library'], isPinned: false },
      { userId: uMap['Arjun Patel'], title: 'Vacancy: Robotics Club Core Team', body: 'Robotics Club is looking for 2 new core members for AY 2025-26. Must have basic electronics knowledge. Interview on Oct 22.', category: 'opportunity', tags: ['robotics', 'club', 'vacancy', 'interview'], isPinned: false },
      { userId: uMap['Vikram Das'], title: 'Free Figma Pro Account for Students', body: 'Figma is offering free Pro accounts to students. Use your .edu email. Verified it works — grab yours!', category: 'opportunity', tags: ['figma', 'design', 'free', 'tool'], isPinned: true },
      { userId: uMap['Karthik Nair'], title: 'IEEE Paper Call for Submissions — Deadline Nov 1', body: 'IEEE is accepting undergraduate research papers for the 2025 conference. Great for your resume. Guidelines in comments.', category: 'academic', tags: ['ieee', 'research', 'paper', 'conference'], isPinned: false }
    ];
    await Notice.create(noticesData);
    console.log('Created Notices.');

    // 7. Create Study Resources
    const resourcesData = [
      { userId: uMap['Priya Sharma'], title: 'Complete DBMS Notes — IIT Pattern', description: 'Comprehensive notes covering ER diagrams, normalization (1NF-BCNF), SQL, transactions. 80 pages.', subject: 'Database Management Systems', type: 'notes', url: 'https://drive.google.com/demo1', department: 'Computer Science Engineering', semester: 5, likes: [uMap['Arjun Patel'], uMap['Sneha Reddy']] },
      { userId: uMap['Meera Joshi'], title: 'System Design Primer (GitHub)', description: 'The best free resource to learn system design for interviews. Covers scalability, databases, caching.', subject: 'System Design', type: 'article', url: 'https://github.com/donnemartin/system-design-primer', department: 'Computer Science Engineering', semester: 8, likes: [uMap['Priya Sharma'], uMap['Arjun Patel'], uMap['Sneha Reddy']] },
      { userId: uMap['Arjun Patel'], title: 'Engineering Thermodynamics — Cengel', description: 'Full PDF of Cengel & Boles Thermodynamics textbook with solved problems.', subject: 'Thermodynamics', type: 'book', url: 'https://drive.google.com/demo2', department: 'Mechanical Engineering', semester: 3, likes: [uMap['Karthik Nair']] },
      { userId: uMap['Sneha Reddy'], title: 'Financial Accounting Crash Course', description: 'YouTube playlist — 15 videos covering all topics for CA Foundation and BBA exams.', subject: 'Financial Accounting', type: 'video', url: 'https://youtube.com/playlist?list=demo', department: 'Business Administration', semester: 3, likes: [uMap['Vikram Das']] },
      { userId: uMap['Vikram Das'], title: 'Figma Variables & Auto Layout Tutorial', description: 'Step-by-step tutorial on using variables, auto layout and component properties in Figma 2024.', subject: 'UI/UX Design', type: 'video', url: 'https://youtube.com/demo', department: 'UX & Design', semester: 3, likes: [uMap['Priya Sharma']] },
      { userId: uMap['Priya Sharma'], title: 'Machine Learning A-Z (Free Udemy Coupons)', description: 'Coupon codes for top ML courses on Udemy — valid till Nov 30. Updated weekly.', subject: 'Machine Learning', type: 'tool', url: 'https://udemy.com/demo', department: 'Computer Science Engineering', semester: 5, likes: [uMap['Meera Joshi']] },
      { userId: uMap['Karthik Nair'], title: 'Embedded Systems Handbook', description: 'Complete guide to microcontrollers, interrupts, RTOS, and communication protocols.', subject: 'Embedded Systems', type: 'notes', url: 'https://drive.google.com/demo3', department: 'Mechanical Engineering', semester: 5, likes: [uMap['Arjun Patel']] }
    ];
    await Resource.create(resourcesData);
    console.log('Created Study Resources.');

    // 8. Create Messages
    const messagesData = [
      { fromUser: uMap['Priya Sharma'], toUser: uMap['Arjun Patel'], body: 'Hi Arjun! Are you free for the DBMS study session today?', isRead: true, sentAt: new Date(Date.now() - 3600000) },
      { fromUser: uMap['Arjun Patel'], toUser: uMap['Priya Sharma'], body: 'Yes Priya, let\'s connect at 5 PM in the library.', isRead: true, sentAt: new Date(Date.now() - 1800000) },
      { fromUser: uMap['Priya Sharma'], toUser: uMap['Arjun Patel'], body: 'Perfect, see you there!', isRead: false, sentAt: new Date(Date.now() - 600000) },
      { fromUser: uMap['Sneha Reddy'], toUser: uMap['Priya Sharma'], body: 'Hey Priya, love your AI Assistant project! Let\'s discuss over coffee?', isRead: false, sentAt: new Date(Date.now() - 1200000) }
    ];
    await Message.create(messagesData);
    console.log('Created Messages.');

    // 9. Create Activity Logs
    const activitiesData = [
      { userId: uMap['Priya Sharma'], type: 'project_added', refTitle: 'SmartCampus AI Assistant' },
      { userId: uMap['Vikram Das'], type: 'project_added', refTitle: 'University Design System' },
      { userId: uMap['Meera Joshi'], type: 'project_added', refTitle: 'CloudDeploy CLI' },
      { userId: uMap['Priya Sharma'], type: 'event_created', refTitle: 'HackFest 2025 — 36-Hour Hackathon' },
      { userId: uMap['Priya Sharma'], type: 'notice_posted', refTitle: 'Summer Internship at TechCorp — Apply Now' },
      { userId: uMap['Priya Sharma'], type: 'resource_shared', refTitle: 'Complete DBMS Notes — IIT Pattern' },
      { userId: uMap['Meera Joshi'], type: 'resource_shared', refTitle: 'System Design Primer (GitHub)' }
    ];

    // Find database project IDs dynamically
    const dbProjs = await Project.find();
    activitiesData.forEach((act) => {
      const match = dbProjs.find((p) => p.title.startsWith(act.refTitle.split(' ')[0]));
      if (match) act.refId = match._id;
    });

    await Activity.create(activitiesData);
    console.log('Created Activity Logs.');

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
