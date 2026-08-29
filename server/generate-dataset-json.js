const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

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
  { title: 'CloudDeploy CLI for Students', cat: 'research', tech: ['Golang', 'Docker', 'AWS SDK', 'Kubernetes', 'Terraform'], desc: 'One-command CLI tool that containerizes and deploys student applications to AWS Free Tier with zero DevOps config.' }
];

const GROUP_IDEAS = [
  { name: 'AI & Deep Learning Research Group', desc: 'Reading group and hands-on lab working on Transformers, Vision, and LLM fine-tuning.', type: 'project', status: 'recruiting' },
  { name: 'Competitive Programming Elite (CP-Hub)', desc: 'Daily LeetCode & Codeforces problem discussion, contest post-mortems, and ICPC prep.', type: 'study', status: 'active' },
  { name: 'Full-Stack & Open Source Guild', desc: 'Collaborative repository maintenance, MERN stack hackathons, and Google Summer of Code prep.', type: 'project', status: 'recruiting' },
  { name: 'Robotics & Embedded Systems Lab', desc: 'Hands-on building of drones, rovers, IoT sensors, and ROS simulation pipelines.', type: 'club', status: 'active' },
  { name: 'Product Design & UI/UX Sprint Club', desc: 'Weekly Figma design teardowns, usability testing sessions, and portfolio reviews.', type: 'study', status: 'active' },
  { name: 'FinTech & Quant Trading Society', desc: 'Algorithmic trading models, backtesting with Python, and macroeconomic case studies.', type: 'forum', status: 'open' },
  { name: 'Cloud & DevOps Practitioners', desc: 'Practical labs on Docker containerization, Kubernetes orchestration, AWS architectures, and CI/CD.', type: 'study', status: 'active' },
  { name: 'Campus Startup Incubator & Pitch Club', desc: 'Pitch practice, mentor matching, seed grant applications, and investor networking.', type: 'forum', status: 'open' }
];

const EVENT_IDEAS = [
  { title: 'InnovateX 2026 — 48-Hour Inter-College Hackathon', cat: 'hackathon', desc: 'Build revolutionary AI, Web3, and HealthTech solutions. Cash prizes worth ₹3,50,000 + VC incubation offers.', venue: 'Auditorium Hall 1 & Virtual', online: false },
  { title: 'Modern Cloud Architecture & Kubernetes Masterclass', cat: 'workshop', desc: 'Hands-on workshop building fault-tolerant microservices on AWS with Docker and Kubernetes. Free certification included.', venue: 'Online via Zoom', online: true },
  { title: 'Startup Spark: Angel Investor & Founder Panel', cat: 'seminar', desc: 'Top tier seed investors and YC alumni discuss zero-to-one growth, term sheets, and product market fit.', venue: 'Management Block Auditorium', online: false },
  { title: 'National Autonomous Robotics Grand Prix', cat: 'competition', desc: 'Line follower, maze solver, and battle bot competitions. High adrenaline engineering showdown.', venue: 'Indoor Sports Complex', online: false }
];

const NOTICE_IDEAS = [
  { title: 'Summer Research Fellowship 2026 — Applications Open', cat: 'opportunity', body: 'Undergraduate research assistant positions available in AI, Robotics, and Quantum Computing. Paid stipend ₹25,000/month.', tags: ['research', 'stipend', 'summer', 'internship'], pinned: true },
  { title: 'Google Summer of Code (GSoC) 2026 Orientation Session', cat: 'academic', body: 'Learn how to write winning project proposals and connect with open-source mentors. Session this Saturday at 4 PM.', tags: ['gsoc', 'opensource', 'mentorship'], pinned: true },
  { title: 'Campus Placement Season: Resume Verification Deadline', cat: 'placement', body: 'All final year and pre-final year students must update their verified resume on the portal before Friday 11:59 PM.', tags: ['placement', 'jobs', 'mandatory', 'resume'], pinned: true },
  { title: 'Microsoft & Amazon Off-Campus Drive SDE-1 Hiring', cat: 'internship', body: 'Software Engineering roles for graduating batch of 2026. CTC: 24-44 LPA. Apply through the referral links attached.', tags: ['placement', 'sde', 'faang', 'hiring'], pinned: false }
];

const RESOURCE_IDEAS = [
  { title: 'Complete Operating Systems & Linux Kernel Notes', subject: 'Operating Systems', type: 'notes', dept: 'Computer Science & Engineering', sem: 4, desc: 'Detailed 90-page handwritten and typed notes on process scheduling, virtual memory, paging, concurrency, and semaphores.' },
  { title: 'System Design Interview Comprehensive Roadmap', subject: 'Software Architecture', type: 'article', dept: 'Computer Science & Engineering', sem: 7, desc: 'Curated architectural patterns covering CDN, load balancing, caching, database sharding, CAP theorem, and event-driven architecture.' },
  { title: 'Data Structures & Algorithms in Java & C++ (Cheat Sheet)', subject: 'Data Structures', type: 'tool', dept: 'Computer Science & Engineering', sem: 3, desc: 'Quick reference sheet with asymptotic time/space complexities and implementations for trees, graphs, and dynamic programming.' },
  { title: 'Thermodynamics & Heat Transfer Formula Handbook', subject: 'Thermodynamics', type: 'book', dept: 'Mechanical Engineering', sem: 4, desc: 'Consolidated formula sheet and 50 solved numerical problems for midterms and GATE exam preparation.' }
];

async function generateExportFiles() {
  const outDir = path.join(__dirname, '../dataset');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const now = new Date().toISOString();

  // 1. Generate 100 Users
  const userIds = [];
  const users = [];
  const usedEmails = new Set();

  for (let i = 0; i < 100; i++) {
    const oid = new mongoose.Types.ObjectId().toString();
    userIds.push(oid);
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
    const sem = (i % 8) + 1;

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

    users.push({
      _id: { $oid: oid },
      name: fullName,
      email: email,
      password: passwordHash,
      role: i === 0 ? 'admin' : (i % 25 === 0 ? 'faculty' : (i % 20 === 0 ? 'alumni' : 'student')),
      department: dept,
      semester: sem,
      university: univ,
      skills: skillList,
      bio: `${dept} student at ${univ}. Active in tech clubs, hackathons, and project development.`,
      avatar: 'default.jpg',
      isVerified: true,
      isOnline: i % 3 === 0,
      isDeleted: false,
      endorsements: [],
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // Endorsements
  for (let i = 0; i < users.length; i++) {
    const endorser1 = userIds[(i + 1) % userIds.length];
    const endorser2 = userIds[(i + 5) % userIds.length];
    if (users[i].skills[0]) {
      users[i].endorsements.push({ skill: users[i].skills[0], endorserId: { $oid: endorser1 }, createdAt: { $date: now } });
    }
    if (users[i].skills[1]) {
      users[i].endorsements.push({ skill: users[i].skills[1], endorserId: { $oid: endorser2 }, createdAt: { $date: now } });
    }
  }

  // 2. Groups (25)
  const groups = [];
  for (let i = 0; i < 25; i++) {
    const g = GROUP_IDEAS[i % GROUP_IDEAS.length];
    const members = [userIds[i % userIds.length]];
    for (let m = 1; m <= 5; m++) {
      members.push(userIds[(i * 3 + m) % userIds.length]);
    }

    groups.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      name: i < GROUP_IDEAS.length ? g.name : `${g.name} - Cohort ${Math.floor(i / GROUP_IDEAS.length) + 1}`,
      description: g.desc,
      type: g.type,
      status: g.status,
      createdBy: { $oid: userIds[i % userIds.length] },
      members: members.map(m => ({ $oid: m })),
      isDeleted: false,
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // 3. Projects (40)
  const projects = [];
  for (let i = 0; i < 40; i++) {
    const p = PROJECT_IDEAS[i % PROJECT_IDEAS.length];
    projects.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      userId: { $oid: userIds[i % userIds.length] },
      title: i < PROJECT_IDEAS.length ? p.title : `${p.title} v${Math.floor(i / PROJECT_IDEAS.length) + 1}`,
      description: p.desc,
      techStack: p.tech,
      githubUrl: `https://github.com/campus-demo/${p.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      liveUrl: i % 2 === 0 ? `https://${p.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.demo.app` : '',
      category: p.cat,
      status: i % 3 === 0 ? 'completed' : 'in_progress',
      teamSize: (i % 4) + 1,
      likes: [
        { $oid: userIds[(i + 2) % userIds.length] },
        { $oid: userIds[(i + 4) % userIds.length] }
      ],
      views: (i + 1) * 45,
      comments: [
        {
          userId: { $oid: userIds[(i + 1) % userIds.length] },
          body: 'Great initiative! The architectural clarity is top-notch.',
          createdAt: { $date: now }
        }
      ],
      isDeleted: false,
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // 4. Events (20)
  const events = [];
  for (let i = 0; i < 20; i++) {
    const e = EVENT_IDEAS[i % EVENT_IDEAS.length];
    const eventDate = new Date(Date.now() + (i + 5) * 86400000).toISOString();
    events.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      userId: { $oid: userIds[(i * 2) % userIds.length] },
      title: i < EVENT_IDEAS.length ? e.title : `${e.title} (Vol ${i + 1})`,
      description: e.desc,
      category: e.cat,
      venue: e.venue,
      eventDate: { $date: eventDate },
      registrationDeadline: { $date: new Date(Date.now() + (i + 3) * 86400000).toISOString() },
      maxAttendees: (i + 1) * 30,
      isOnline: e.online,
      bannerSeed: `ev${(i % 6) + 1}`,
      rsvps: [
        { userId: { $oid: userIds[(i * 3 + 1) % userIds.length] }, status: 'going' },
        { userId: { $oid: userIds[(i * 3 + 2) % userIds.length] }, status: 'interested' }
      ],
      isDeleted: false,
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // 5. Notices (30)
  const notices = [];
  for (let i = 0; i < 30; i++) {
    const n = NOTICE_IDEAS[i % NOTICE_IDEAS.length];
    notices.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      userId: { $oid: userIds[(i * 3) % userIds.length] },
      title: i < NOTICE_IDEAS.length ? n.title : `[Update #${i + 1}] ${n.title}`,
      body: n.body,
      category: n.cat,
      tags: n.tags,
      isPinned: n.pinned && (i < 4),
      views: (i + 1) * 32,
      isDeleted: false,
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // 6. Resources (30)
  const resources = [];
  for (let i = 0; i < 30; i++) {
    const r = RESOURCE_IDEAS[i % RESOURCE_IDEAS.length];
    resources.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      userId: { $oid: userIds[(i * 2 + 1) % userIds.length] },
      title: i < RESOURCE_IDEAS.length ? r.title : `${r.title} — Part ${Math.floor(i / RESOURCE_IDEAS.length) + 1}`,
      description: r.desc,
      subject: r.subject,
      type: r.type,
      url: `https://drive.google.com/drive/folders/campus-demo-resource-${i + 1}`,
      department: r.dept,
      semester: r.sem,
      likes: [
        { $oid: userIds[(i + 2) % userIds.length] }
      ],
      isDeleted: false,
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // 7. Connections (100)
  const connections = [];
  for (let i = 0; i < 100; i++) {
    connections.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      fromUser: { $oid: userIds[i] },
      toUser: { $oid: userIds[(i + (i % 6) + 1) % userIds.length] },
      status: i % 4 === 0 ? 'pending' : 'accepted',
      createdAt: { $date: now },
      updatedAt: { $date: now }
    });
  }

  // 8. Messages (100)
  const messages = [];
  const sampleChats = [
    'Hey! Are you working on the hackathon project tonight?',
    'Yes, I just pushed the latest Docker Compose and Redis adapter updates.',
    'Awesome! I will test the WebSocket notification subscriptions now.',
    'Let me know if you want to pair program on the UI design components.'
  ];
  for (let i = 0; i < 100; i++) {
    messages.push({
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      fromUser: { $oid: userIds[i % userIds.length] },
      toUser: { $oid: userIds[(i + 1) % userIds.length] },
      body: sampleChats[i % sampleChats.length],
      isRead: i % 2 === 0,
      sentAt: { $date: now }
    });
  }

  // Write individual files
  const collections = {
    users,
    groups,
    projects,
    events,
    notices,
    resources,
    connections,
    messages
  };

  for (const [name, data] of Object.entries(collections)) {
    const filePath = path.join(outDir, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved ${data.length} records to dataset/${name}.json`);
  }

  // Write single monolithic dataset bundle
  const bundlePath = path.join(outDir, 'campusconnect_full_dataset.json');
  fs.writeFileSync(bundlePath, JSON.stringify(collections, null, 2), 'utf-8');
  console.log(`Saved full dataset bundle to dataset/campusconnect_full_dataset.json`);

  console.log('✅ MongoDB JSON Dataset successfully generated!');
}

generateExportFiles().catch(console.error);
