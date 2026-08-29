const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

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

// Load environment variables from possible locations
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

// ==========================================
// 100 Realistic Seed Names & User Templates
// ==========================================
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Advait', 'Aishwarya', 'Akash', 'Amara', 'Amit', 'Ananya', 'Anik', 'Ananya',
  'Anmol', 'Anushka', 'Arjun', 'Arya', 'Aryan', 'Ayush', 'Bhavna', 'Chetan', 'Devansh', 'Dia',
  'Dhruv', 'Diya', 'Divyansh', 'Eesha', 'Farhan', 'Gaurav', 'Gayatri', 'Harsh', 'Ila', 'Ishaan',
  'Ishita', 'Jatin', 'Kabir', 'Kavya', 'Karan', 'Khushi', 'Kiran', 'Kunal', 'Lakshay', 'Lavanya',
  'Madhav', 'Manish', 'Mayank', 'Meera', 'Mihir', 'Mohit', 'Nakul', 'Navya', 'Neha', 'Nikhil',
  'Nisha', 'Om', 'Palak', 'Parth', 'Pooja', 'Pranav', 'Pranay', 'Prashant', 'Priya', 'Rahul',
  'Rhea', 'Rishi', 'Ritika', 'Rohan', 'Rohit', 'Roshni', 'Rudra', 'Saahil', 'Sakshi', 'Sameer',
  'Samarth', 'Sana', 'Sanjay', 'Sanvi', 'Sarthak', 'Shaurya', 'Shivani', 'Shlok', 'Shreya', 'Siddharth',
  'Sneha', 'Soham', 'Sparsh', 'Tanvi', 'Tarun', 'Tejas', 'Trisha', 'Utkarsh', 'Vaibhav', 'Vandana',
  'Varun', 'Vedant', 'Vidhi', 'Vihan', 'Vikram', 'Vipin', 'Vishal', 'Yash', 'Yukta', 'Zaid'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Singh', 'Kumar', 'Mehta',
  'Joshi', 'Chopra', 'Malhotra', 'Bhatia', 'Deshmukh', 'Kulkarni', 'Banerjee', 'Chatterjee', 'Das', 'Roy',
  'Menon', 'Pillai', 'Rao', 'Shetty', 'Hegde', 'Saxena', 'Kapoor', 'Khanna', 'Agarwal', 'Mishra'
];

const UNIVERSITIES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kharagpur', 'IIT Roorkee',
  'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Rourkela',
  'BITS Pilani', 'BITS Goa', 'IIIT Hyderabad', 'DTU Delhi', 'NSUT Delhi',
  'VIT Vellore', 'Manipal Institute of Tech', 'Thapar University', 'SRM University',
  'SPJIMR Mumbai', 'IIM Ahmedabad', 'NIFT Delhi', 'NID Ahmedabad'
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology & Bioinformatics',
  'Business Administration (BBA/MBA)',
  'UX & Interaction Design',
  'Aerospace & Robotics Engineering'
];

const SKILL_POOLS = {
  tech: ['React', 'Node.js', 'Python', 'Machine Learning', 'Docker', 'Kubernetes', 'AWS', 'Next.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'GraphQL', 'FastAPI', 'Golang', 'Rust', 'Redis', 'TailwindCSS', 'Flutter', 'TensorFlow', 'PyTorch'],
  hardware: ['Arduino', 'Raspberry Pi', 'Embedded C', 'SolidWorks', 'MATLAB', 'AutoCAD', 'ROS', 'Circuit Design', '3D Printing', 'IoT Protocols', 'PLC', 'FPGA'],
  business: ['Financial Modeling', 'Market Research', 'Agile/Scrum', 'Product Management', 'Excel/VBA', 'Power BI', 'Pitch Decks', 'SEO Marketing', 'Valuation', 'Content Strategy'],
  design: ['Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Adobe Illustrator', 'Design Systems', 'Motion Design', 'Typography', 'Storybook', 'Prototyping']
};

const PROJECT_IDEAS = [
  { title: 'SmartCampus AI Navigator', cat: 'ai_ml', tech: ['Python', 'FastAPI', 'React', 'GPT-4', 'PostgreSQL'], desc: 'An intelligent campus assistant that answers questions about hostel rules, professor office hours, and timetables using RAG.' },
  { title: 'Autonomous Agri-Drone Swarm', cat: 'iot_hardware', tech: ['ROS', 'Python', 'C++', 'Raspberry Pi', 'Computer Vision'], desc: 'Drone coordination system that captures spectral imagery over crops to detect plant disease and automate pesticide delivery.' },
  { title: 'Peer-to-Peer Campus Marketplace', cat: 'web', tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO'], desc: 'A verified student marketplace to buy, sell, and rent textbooks, bicycles, calculators, and lab gear safely on campus.' },
  { title: 'CampusRide — Carpooling & Shuttle Tracker', cat: 'mobile', tech: ['Flutter', 'Firebase', 'Google Maps API', 'Node.js'], desc: 'Real-time shuttle tracking and verified campus ride-sharing mobile app for university commuters and day-scholars.' },
  { title: 'Decentralized Academic Credential Vault', cat: 'research', tech: ['Solidity', 'Ethereum', 'IPFS', 'Next.js', 'Web3.js'], desc: 'Tamper-proof blockchain platform enabling universities to issue cryptographically verifiable degrees and transcripts.' },
  { title: 'MindPulse — Student Mental Wellbeing Tracker', cat: 'mobile', tech: ['React Native', 'FastAPI', 'PyTorch', 'TailwindCSS'], desc: 'Daily mood logger and AI wellbeing assistant offering confidential counseling bookings and stress analytics.' },
  { title: 'Automated Smart Greenhouse with IoT', cat: 'iot_hardware', tech: ['Arduino', 'NodeMCU', 'MQTT', 'React', 'Chart.js'], desc: 'Closed-loop environmental control system that monitors humidity, soil moisture, and lux levels with automated irrigation.' },
  { title: 'CodeReviewer AI GitHub Bot', cat: 'ai_ml', tech: ['TypeScript', 'Node.js', 'OpenAI API', 'GitHub Actions', 'Docker'], desc: 'An automated pull request reviewer that comments with security vulnerability warnings and style optimization suggestions.' },
  { title: 'Kavach — Campus Women Safety Guardian', cat: 'mobile', tech: ['Flutter', 'Node.js', 'Socket.IO', 'Twilio API', 'MongoDB'], desc: 'Emergency SOS alert app with real-time location sharing, ambient audio recording, and automated dispatch to campus security.' },
  { title: 'EcoBin — Smart Waste Segregator', cat: 'iot_hardware', tech: ['Raspberry Pi', 'OpenCV', 'TensorFlow Lite', 'Python', 'Servo Motors'], desc: 'AI-enabled trash bin that uses computer vision to classify recyclable, organic, and electronic waste automatically.' },
  { title: 'AlumniMentorship & Referral Portal', cat: 'web', tech: ['React', 'GraphQL', 'Express', 'PostgreSQL', 'AWS S3'], desc: 'Platform connecting university alumni at top tech firms with students for 1-on-1 resume reviews and mock interviews.' },
  { title: 'CloudDeploy CLI for Students', cat: 'research', tech: ['Golang', 'Docker', 'AWS SDK', 'Kubernetes', 'Terraform'], desc: 'One-command CLI tool that containerizes and deploys student applications to AWS Free Tier with zero DevOps config.' },
  { title: 'OpenNotes — Collaborative Markdown Hub', cat: 'web', tech: ['Next.js', 'TailwindCSS', 'Prisma', 'PostgreSQL', 'KaTeX'], desc: 'Real-time collaborative note-taking and math formula renderer tailored for engineering and sciences coursework.' },
  { title: 'Biometric Attendance with Anti-Spoofing', cat: 'ai_ml', tech: ['Python', 'OpenCV', 'FaceNet', 'FastAPI', 'MongoDB'], desc: 'High-speed classroom facial recognition attendance app with 3D liveness detection to prevent proxy logins.' },
  { title: 'Robotic Arm for Lab Automation', cat: 'iot_hardware', tech: ['SolidWorks', '3D Printing', 'Arduino', 'C++', 'Kinematics'], desc: 'A 6-DOF robotic manipulator designed for pipetting and chemical sample handling in high school and college chemistry labs.' },
  { title: 'FinTrack — College Club Treasury Management', cat: 'web', tech: ['React', 'Node.js', 'Express', 'MySQL', 'Stripe'], desc: 'Financial management dashboard for student unions to budget events, track expense reimbursements, and collect club dues.' },
  { title: 'HoloLearn — AR Anatomy & Mechanics Explorer', cat: 'mobile', tech: ['Unity', 'C#', 'ARCore', 'Blender', 'WebXR'], desc: 'Augmented reality mobile application allowing students to dismantle virtual 3D car engines and human biological systems.' },
  { title: 'PlacementPrep — Algorithmic Mock Interviewer', cat: 'ai_ml', tech: ['Next.js', 'Python', 'LangChain', 'Monaco Editor', 'Docker'], desc: 'Interactive coding simulator that assesses data structures knowledge, tests time complexity, and simulates technical FAANG interviews.' }
];

const GROUP_IDEAS = [
  { name: 'AI & Deep Learning Research Group', desc: 'Reading group and hands-on lab working on Transformers, Vision, and LLM fine-tuning.', type: 'project', status: 'recruiting' },
  { name: 'Competitive Programming Elite (CP-Hub)', desc: 'Daily LeetCode & Codeforces problem discussion, contest post-mortems, and ICPC prep.', type: 'study', status: 'active' },
  { name: 'Full-Stack & Open Source Guild', desc: 'Collaborative repository maintenance, MERN stack hackathons, and Google Summer of Code prep.', type: 'project', status: 'recruiting' },
  { name: 'Robotics & Embedded Systems Lab', desc: 'Hands-on building of drones, rovers, IoT sensors, and ROS simulation pipelines.', type: 'club', status: 'active' },
  { name: 'Product Design & UI/UX Sprint Club', desc: 'Weekly Figma design teardowns, usability testing sessions, and portfolio reviews.', type: 'study', status: 'active' },
  { name: 'FinTech & Quant Trading Society', desc: 'Algorithmic trading models, backtesting with Python, and macroeconomic case studies.', type: 'forum', status: 'open' },
  { name: 'Cloud & DevOps Practitioners', desc: 'Practical labs on Docker containerization, Kubernetes orchestration, AWS architectures, and CI/CD.', type: 'study', status: 'active' },
  { name: 'Campus Startup Incubator & Pitch Club', desc: 'Pitch practice, mentor matching, seed grant applications, and investor networking.', type: 'forum', status: 'open' },
  { name: 'Cybersecurity & Ethical Hacking Squad', desc: 'CTF challenge walkthroughs, web app vulnerability scanning, reverse engineering, and bug bounties.', type: 'project', status: 'recruiting' },
  { name: 'Biotech & Bioinformatics Thinktank', desc: 'Genomic data analysis, CRISPR computational pipelines, and bio-inspired robotics discussions.', type: 'forum', status: 'open' },
  { name: 'Data Science & Kaggle Grandmasters', desc: 'Team participation in global Kaggle challenges, feature engineering, and ensemble modeling.', type: 'study', status: 'active' },
  { name: 'Game Dev & XR Creators', desc: 'Building 2D/3D games in Unity, Unreal Engine 5, Blender asset creation, and VR prototypes.', type: 'project', status: 'active' }
];

const EVENT_IDEAS = [
  { title: 'InnovateX 2026 — 48-Hour Inter-College Hackathon', cat: 'hackathon', desc: 'Build revolutionary AI, Web3, and HealthTech solutions. Cash prizes worth ₹3,50,000 + VC incubation offers.', venue: 'Auditorium Hall 1 & Virtual', online: false },
  { title: 'Modern Cloud Architecture & Kubernetes Masterclass', cat: 'workshop', desc: 'Hands-on workshop building fault-tolerant microservices on AWS with Docker and Kubernetes. Free certification included.', venue: 'Online via Zoom', online: true },
  { title: 'Startup Spark: Angel Investor & Founder Panel', cat: 'seminar', desc: 'Top tier seed investors and YC alumni discuss zero-to-one growth, term sheets, and product market fit.', venue: 'Management Block Auditorium', online: false },
  { title: 'National Autonomous Robotics Grand Prix', cat: 'competition', cat2: 'iot_hardware', desc: 'Line follower, maze solver, and battle bot competitions. High adrenaline engineering showdown.', venue: 'Indoor Sports Complex', online: false },
  { title: 'Figma to Code: Design Systems at Scale', cat: 'workshop', desc: 'Learn how modern product teams bridge design tokens, Tailwind CSS, and Storybook components seamlessly.', venue: 'Design Studio 3B', online: false },
  { title: 'CyberQuest: 24-Hour Capture The Flag (CTF)', cat: 'competition', desc: 'Test your offensive and defensive security skills in web exploitation, cryptography, forensics, and binary reversing.', venue: 'Online / HackerRank Platform', online: true },
  { title: 'Alumni Tech Talk: Landing Software Roles at FAANG', cat: 'seminar', desc: 'Senior engineers share secrets on resume tailoring, system design rounds, and behavioral interview mastery.', venue: 'Online (YouTube Live Stream)', online: true },
  { title: 'Generative AI & Agentic Workflows Bootcamp', cat: 'workshop', desc: 'Build custom autonomous agents using LangChain, OpenAI APIs, and vector databases from scratch.', venue: 'Computer Center Lab 4', online: false }
];

const NOTICE_IDEAS = [
  { title: 'Summer Research Fellowship 2026 — Applications Open', cat: 'opportunity', body: 'Undergraduate research assistant positions available in AI, Robotics, and Quantum Computing. Paid stipend ₹25,000/month.', tags: ['research', 'stipend', 'summer', 'internship'], pinned: true },
  { title: 'Google Summer of Code (GSoC) 2026 Orientation Session', cat: 'academic', body: 'Learn how to write winning project proposals and connect with open-source mentors. Session this Saturday at 4 PM.', tags: ['gsoc', 'opensource', 'mentorship'], pinned: true },
  { title: 'Campus Placement Season: Resume Verification Deadline', cat: 'placement', body: 'All final year and pre-final year students must update their verified resume on the portal before Friday 11:59 PM.', tags: ['placement', 'jobs', 'mandatory', 'resume'], pinned: true },
  { title: 'Microsoft & Amazon Off-Campus Drive SDE-1 Hiring', cat: 'internship', body: 'Software Engineering roles for graduating batch of 2026. CTC: 24-44 LPA. Apply through the referral links attached.', tags: ['placement', 'sde', 'faang', 'hiring'], pinned: false },
  { title: 'Lost & Found: Blue Noise-Cancelling Headphones in Library', cat: 'general', body: 'Sony WH-1000XM4 left on 2nd-floor study desk on Wednesday evening. Please contact security desk with proof of ownership.', tags: ['lost', 'headphones', 'library'], pinned: false },
  { title: 'Urgent: Server Maintenance & Portal Downtime Tonight', cat: 'urgent', body: 'CampusConnect API and student portal will undergo routine database upgrades between 2:00 AM and 4:00 AM UTC.', tags: ['maintenance', 'server', 'downtime'], pinned: true },
  { title: 'Call for Student Core Team: TEDxUniversity 2026', cat: 'opportunity', body: 'Recruiting leads for curation, sponsorships, stage design, marketing, and video production. All departments welcome.', tags: ['tedx', 'leadership', 'event', 'volunteers'], pinned: false },
  { title: 'IEEE Global Student Paper Contest — Travel Grants Available', cat: 'academic', body: 'Selected research papers will receive full airfare and conference registration sponsorships for the Tokyo summit.', tags: ['ieee', 'conference', 'paper', 'grant'], pinned: false }
];

const RESOURCE_IDEAS = [
  { title: 'Complete Operating Systems & Linux Kernel Notes', subject: 'Operating Systems', type: 'notes', dept: 'Computer Science & Engineering', sem: 4, desc: 'Detailed 90-page handwritten and typed notes on process scheduling, virtual memory, paging, concurrency, and semaphores.' },
  { title: 'System Design Interview Comprehensive Roadmap', subject: 'Software Architecture', type: 'article', dept: 'Computer Science & Engineering', sem: 7, desc: 'Curated architectural patterns covering CDN, load balancing, caching, database sharding, CAP theorem, and event-driven architecture.' },
  { title: 'Data Structures & Algorithms in Java & C++ (Cheat Sheet)', subject: 'Data Structures', type: 'tool', dept: 'Computer Science & Engineering', sem: 3, desc: 'Quick reference sheet with asymptotic time/space complexities and implementations for trees, graphs, and dynamic programming.' },
  { title: 'Thermodynamics & Heat Transfer Formula Handbook', subject: 'Thermodynamics', type: 'book', dept: 'Mechanical Engineering', sem: 4, desc: 'Consolidated formula sheet and 50 solved numerical problems for midterms and GATE exam preparation.' },
  { title: 'Complete Digital Electronics & Verilog Cheatsheet', subject: 'Digital Electronics', type: 'notes', dept: 'Electronics & Communication Engineering', sem: 3, desc: 'K-maps, combinational circuits, flip-flops, FSM state diagrams, and synthesizable Verilog modules.' },
  { title: 'Financial Modeling & Valuation in Excel (Video Series)', subject: 'Corporate Finance', type: 'video', dept: 'Business Administration (BBA/MBA)', sem: 5, desc: '10-part hands-on video series on 3-statement financial models, DCF valuations, and LBO models.' },
  { title: 'Figma UI/UX Masterclass & Component Library', subject: 'Design Systems', type: 'tool', dept: 'UX & Interaction Design', sem: 4, desc: 'Production-ready Figma UI Kit featuring accessible WCAG 2.1 color contrast tokens, auto-layout cards, and interactive variants.' },
  { title: 'Machine Learning Mathematics: Linear Algebra & Calculus', subject: 'Machine Learning', type: 'notes', dept: 'Artificial Intelligence & Data Science', sem: 5, desc: 'Intuitive notes explaining eigenvalues, gradients, SVD, and Lagrange multipliers with visual graphs.' }
];

// ==========================================
// Main Seeding Engine
// ==========================================
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB database at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Wipe old data
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Project.deleteMany({}),
      Event.deleteMany({}),
      Connection.deleteMany({}),
      Message.deleteMany({}),
      Notice.deleteMany({}),
      Resource.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      Newsletter.deleteMany({}),
      ContactMessage.deleteMany({})
    ]);
    console.log('Collections cleared.');

    // 2. Generate 100 Unique Demo Users
    console.log('Generating 100 realistic student and faculty users...');
    const defaultHash = await bcrypt.hash('password123', 10);
    const usersToInsert = [];
    const usedEmails = new Set();

    for (let i = 0; i < 100; i++) {
      const fName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lName = LAST_NAMES[(i + Math.floor(i / 10)) % LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      
      let baseEmail = `${fName.toLowerCase()}.${lName.toLowerCase()}`;
      let email = `${baseEmail}@campus.edu`;
      let counter = 1;
      while (usedEmails.has(email)) {
        email = `${baseEmail}${counter}@campus.edu`;
        counter++;
      }
      usedEmails.add(email);

      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const univ = UNIVERSITIES[i % UNIVERSITIES.length];
      const semester = (i % 8) + 1;

      // Pick skills according to department
      let skillList = [];
      if (dept.includes('Computer') || dept.includes('Artificial') || dept.includes('Information')) {
        skillList = [SKILL_POOLS.tech[i % SKILL_POOLS.tech.length], SKILL_POOLS.tech[(i + 3) % SKILL_POOLS.tech.length], SKILL_POOLS.tech[(i + 7) % SKILL_POOLS.tech.length]];
      } else if (dept.includes('Mechanical') || dept.includes('Robotics') || dept.includes('Electrical')) {
        skillList = [SKILL_POOLS.hardware[i % SKILL_POOLS.hardware.length], SKILL_POOLS.hardware[(i + 2) % SKILL_POOLS.hardware.length], 'Python'];
      } else if (dept.includes('Business')) {
        skillList = [SKILL_POOLS.business[i % SKILL_POOLS.business.length], SKILL_POOLS.business[(i + 2) % SKILL_POOLS.business.length], 'Data Analysis'];
      } else if (dept.includes('Design')) {
        skillList = [SKILL_POOLS.design[i % SKILL_POOLS.design.length], SKILL_POOLS.design[(i + 2) % SKILL_POOLS.design.length], 'CSS'];
      } else {
        skillList = ['Research', 'Data Analysis', 'Python', 'Communication'];
      }

      usersToInsert.push({
        name: fullName,
        email: email,
        password: defaultHash,
        role: i === 0 ? 'admin' : (i % 25 === 0 ? 'faculty' : (i % 20 === 0 ? 'alumni' : 'student')),
        department: dept,
        semester: semester,
        university: univ,
        skills: skillList,
        bio: `${dept} enthusiast at ${univ}. Active in college clubs, hackathons, and research projects. Passionate about building impactful software!`,
        avatar: `default.jpg`,
        isVerified: true,
        isOnline: i % 3 === 0,
        endorsements: []
      });
    }

    const createdUsers = await User.insertMany(usersToInsert);
    console.log(`Created ${createdUsers.length} Users successfully.`);

    // 3. Add Skill Endorsements
    console.log('Generating skill endorsements...');
    for (let i = 0; i < createdUsers.length; i++) {
      const u = createdUsers[i];
      const endorser1 = createdUsers[(i + 1) % createdUsers.length]._id;
      const endorser2 = createdUsers[(i + 5) % createdUsers.length]._id;
      if (u.skills && u.skills.length > 0) {
        u.endorsements.push({ skill: u.skills[0], endorserId: endorser1, createdAt: new Date() });
      }
      if (u.skills && u.skills.length > 1) {
        u.endorsements.push({ skill: u.skills[1], endorserId: endorser2, createdAt: new Date() });
      }
      await u.save();
    }
    console.log('Endorsements seeded.');

    // 4. Generate 25 Groups & Clubs
    console.log('Generating campus groups and clubs...');
    const groupsToInsert = [];
    for (let i = 0; i < 25; i++) {
      const gIdea = GROUP_IDEAS[i % GROUP_IDEAS.length];
      const owner = createdUsers[i % createdUsers.length];
      const memberList = [owner._id];
      // Add 4-8 random members
      for (let m = 1; m <= 6; m++) {
        const candidate = createdUsers[(i * 3 + m) % createdUsers.length]._id;
        if (!memberList.includes(candidate)) {
          memberList.push(candidate);
        }
      }

      groupsToInsert.push({
        name: i < GROUP_IDEAS.length ? gIdea.name : `${gIdea.name} - Chapter ${Math.floor(i / GROUP_IDEAS.length) + 1}`,
        description: gIdea.desc,
        type: gIdea.type,
        status: gIdea.status,
        createdBy: owner._id,
        members: memberList
      });
    }
    const createdGroups = await Group.insertMany(groupsToInsert);
    console.log(`Created ${createdGroups.length} Groups.`);

    // 5. Generate 40 Projects
    console.log('Generating 40 student projects...');
    const projectsToInsert = [];
    for (let i = 0; i < 40; i++) {
      const pIdea = PROJECT_IDEAS[i % PROJECT_IDEAS.length];
      const owner = createdUsers[i % createdUsers.length];
      const likers = [
        createdUsers[(i + 2) % createdUsers.length]._id,
        createdUsers[(i + 4) % createdUsers.length]._id,
        createdUsers[(i + 6) % createdUsers.length]._id
      ];

      projectsToInsert.push({
        userId: owner._id,
        title: i < PROJECT_IDEAS.length ? pIdea.title : `${pIdea.title} v${Math.floor(i / PROJECT_IDEAS.length) + 1}.0`,
        description: pIdea.desc,
        techStack: pIdea.tech,
        githubUrl: `https://github.com/campus-demo/${pIdea.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        liveUrl: i % 2 === 0 ? `https://${pIdea.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.demo.app` : '',
        category: pIdea.cat,
        status: i % 3 === 0 ? 'completed' : 'in_progress',
        teamSize: (i % 4) + 1,
        likes: likers,
        views: (i + 1) * 37,
        comments: [
          {
            userId: createdUsers[(i + 1) % createdUsers.length]._id,
            body: 'Super impressive work! Love the architecture and UI simplicity.',
            createdAt: new Date(Date.now() - 3600000 * (i + 1))
          },
          {
            userId: createdUsers[(i + 3) % createdUsers.length]._id,
            body: 'Are you looking for another frontend collaborator? Would love to contribute.',
            createdAt: new Date(Date.now() - 1800000 * (i + 1))
          }
        ]
      });
    }
    const createdProjects = await Project.insertMany(projectsToInsert);
    console.log(`Created ${createdProjects.length} Projects.`);

    // 6. Generate 25 Campus Events
    console.log('Generating 25 events and hackathons...');
    const eventsToInsert = [];
    for (let i = 0; i < 25; i++) {
      const eIdea = EVENT_IDEAS[i % EVENT_IDEAS.length];
      const owner = createdUsers[(i * 2) % createdUsers.length];
      const daysAhead = (i % 30) + 3;
      const eventDate = new Date(Date.now() + daysAhead * 86400000);
      const regDeadline = new Date(eventDate.getTime() - 2 * 86400000);

      const rsvpList = [];
      for (let r = 1; r <= 8; r++) {
        rsvpList.push({
          userId: createdUsers[(i * 4 + r) % createdUsers.length]._id,
          status: r % 3 === 0 ? 'interested' : 'going'
        });
      }

      eventsToInsert.push({
        userId: owner._id,
        title: i < EVENT_IDEAS.length ? eIdea.title : `${eIdea.title} (Edition ${i + 1})`,
        description: eIdea.desc,
        category: eIdea.cat,
        venue: eIdea.venue,
        eventDate: eventDate,
        registrationDeadline: regDeadline,
        maxAttendees: (i + 1) * 25,
        isOnline: eIdea.online,
        bannerSeed: `ev${(i % 6) + 1}`,
        rsvps: rsvpList
      });
    }
    const createdEvents = await Event.insertMany(eventsToInsert);
    console.log(`Created ${createdEvents.length} Events.`);

    // 7. Generate 35 Notices
    console.log('Generating 35 notices and announcements...');
    const noticesToInsert = [];
    for (let i = 0; i < 35; i++) {
      const nIdea = NOTICE_IDEAS[i % NOTICE_IDEAS.length];
      const owner = createdUsers[(i * 3) % createdUsers.length];
      noticesToInsert.push({
        userId: owner._id,
        title: i < NOTICE_IDEAS.length ? nIdea.title : `[Notice #${i + 1}] ${nIdea.title}`,
        body: nIdea.body,
        category: nIdea.cat,
        tags: nIdea.tags,
        isPinned: nIdea.pinned && (i < 5),
        views: (i + 1) * 28
      });
    }
    const createdNotices = await Notice.insertMany(noticesToInsert);
    console.log(`Created ${createdNotices.length} Notices.`);

    // 8. Generate 35 Study Resources
    console.log('Generating 35 study resources and textbooks...');
    const resourcesToInsert = [];
    for (let i = 0; i < 35; i++) {
      const rIdea = RESOURCE_IDEAS[i % RESOURCE_IDEAS.length];
      const owner = createdUsers[(i * 2 + 1) % createdUsers.length];
      const likers = [
        createdUsers[(i + 2) % createdUsers.length]._id,
        createdUsers[(i + 5) % createdUsers.length]._id
      ];

      resourcesToInsert.push({
        userId: owner._id,
        title: i < RESOURCE_IDEAS.length ? rIdea.title : `${rIdea.title} — Part ${Math.floor(i / RESOURCE_IDEAS.length) + 1}`,
        description: rIdea.desc,
        subject: rIdea.subject,
        type: rIdea.type,
        url: `https://drive.google.com/drive/folders/campus-demo-resource-${i + 1}`,
        department: rIdea.dept,
        semester: rIdea.sem,
        likes: likers
      });
    }
    const createdResources = await Resource.insertMany(resourcesToInsert);
    console.log(`Created ${createdResources.length} Study Resources.`);

    // 9. Generate 100 Connection Links
    console.log('Generating 100 connection graphs...');
    const connectionsToInsert = [];
    for (let i = 0; i < 100; i++) {
      const from = createdUsers[i]._id;
      const to = createdUsers[(i + (i % 7) + 1) % createdUsers.length]._id;
      if (from.toString() !== to.toString()) {
        connectionsToInsert.push({
          fromUser: from,
          toUser: to,
          status: i % 4 === 0 ? 'pending' : 'accepted',
          createdAt: new Date(Date.now() - (i + 1) * 3600000)
        });
      }
    }
    await Connection.insertMany(connectionsToInsert);
    console.log(`Created ${connectionsToInsert.length} Connections.`);

    // 10. Generate 120 Direct Messages
    console.log('Generating 120 direct chat messages...');
    const messagesToInsert = [];
    const sampleChats = [
      'Hey! Are you free to review our system architecture diagram today?',
      'Yes, absolutely! Let\'s meet in the library cafe around 4:30 PM.',
      'Great! I will bring my laptop with the PostgreSQL schema and API contracts.',
      'Awesome. Did you check out the new hackathon notice? Let\'s team up!',
      'Count me in! I can handle the backend API and Docker deployment.',
      'Hey, could you endorse me for React and Machine Learning on my profile?',
      'Done! By the way, your recent project looks super sleek.',
      'Thanks a lot! Let me know if you need study notes for midterms.'
    ];

    for (let i = 0; i < 120; i++) {
      const sender = createdUsers[i % createdUsers.length]._id;
      const receiver = createdUsers[(i + 1) % createdUsers.length]._id;
      messagesToInsert.push({
        fromUser: sender,
        toUser: receiver,
        body: sampleChats[i % sampleChats.length],
        isRead: i % 2 === 0,
        sentAt: new Date(Date.now() - (120 - i) * 600000)
      });
    }
    await Message.insertMany(messagesToInsert);
    console.log(`Created ${messagesToInsert.length} Messages.`);

    // 11. Generate 50 Activities & 50 Notifications
    console.log('Generating 50 activities and 50 notifications...');
    const activitiesToInsert = [];
    const notificationsToInsert = [];

    for (let i = 0; i < 50; i++) {
      const u = createdUsers[i];
      const p = createdProjects[i % createdProjects.length];
      const e = createdEvents[i % createdEvents.length];

      activitiesToInsert.push({
        userId: u._id,
        type: i % 3 === 0 ? 'project_added' : (i % 3 === 1 ? 'event_created' : 'resource_shared'),
        refTitle: i % 3 === 0 ? p.title : (i % 3 === 1 ? e.title : 'Calculus Cheat Sheet'),
        refId: i % 3 === 0 ? p._id : e._id,
        createdAt: new Date(Date.now() - (50 - i) * 3600000)
      });

      notificationsToInsert.push({
        userId: u._id,
        actorId: createdUsers[(i + 2) % createdUsers.length]._id,
        type: i % 3 === 0 ? 'project_like' : (i % 3 === 1 ? 'connection_accepted' : 'endorsement'),
        message: i % 3 === 0 ? `liked your project "${p.title}"` : (i % 3 === 1 ? 'accepted your connection request' : 'endorsed you for Python'),
        refId: p._id,
        isRead: i % 3 === 0,
        createdAt: new Date(Date.now() - (50 - i) * 1800000)
      });
    }

    await Promise.all([
      Activity.insertMany(activitiesToInsert),
      Notification.insertMany(notificationsToInsert)
    ]);
    console.log('Created Activities & Notifications.');

    console.log('====================================================');
    console.log('🎉 100+ DEMO DATASETS SUCCESSFULLY SEEDED!');
    console.log(`- 100 Users (Pass: password123)`);
    console.log(`- ${createdGroups.length} Groups & Study Circles`);
    console.log(`- ${createdProjects.length} Student Projects`);
    console.log(`- ${createdEvents.length} Campus Events & Hackathons`);
    console.log(`- ${createdNotices.length} Notices & Announcements`);
    console.log(`- ${createdResources.length} Study Notes & Resources`);
    console.log(`- ${connectionsToInsert.length} Connection Graph Edges`);
    console.log(`- ${messagesToInsert.length} Real-Time Chat Messages`);
    console.log(`- 50 Activities & 50 Notifications`);
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
