/**
 * PLACEHOLDER CONTENT — every name, figure and route below is invented so the
 * site looks real during build. Replace each block with confirmed details before
 * launch. Search "TODO-REAL" to find what still needs real data.
 * Keep this file as the single source; pages import from here.
 */
export const PLACEHOLDER = true;

export const school = {
  name: "Temidire International College",
  short: "Temidire",
  motto: "Knowledge with character",
  crestMotto: "Scientia et Virtus",
  founded: 2006,
  address: "18 Adegoke Street, Ondo Town, Ondo State, Nigeria",
  phone: "+234 803 555 0142",
  whatsapp: "2348035550142",
  email: "info@temidirecollege.ng",
  session: "2026/2027",
  hours: "Mon–Fri, 7:30am – 4:00pm",
  socials: {
    facebook: "https://facebook.com/temidireinternationalcollege",
    instagram: "https://instagram.com/temidirecollege",
    x: "https://x.com/temidirecollege",
    youtube: "https://youtube.com/@temidirecollege",
  },
};

export const stats = [
  { label: "Students", value: 512, suffix: "" },
  { label: "Years of excellence", value: 20, suffix: "" },
  { label: "WAEC credit passes", value: 96, suffix: "%" },
  { label: "Qualified teachers", value: 46, suffix: "" },
];

export const schools = [
  {
    id: "creche",
    name: "Creche",
    ages: "6 months – 2 years",
    line: "Play, routine, and gentle first steps.",
    image: "/images/school-creche.webp",
  },
  {
    id: "nursery",
    name: "Nursery",
    ages: "3 – 5 years",
    line: "Letters, numbers and plenty of mud.",
    image: "/images/school-nursery.webp",
  },
  {
    id: "primary",
    name: "Primary",
    ages: "6 – 11 years",
    line: "Strong foundations in reading, maths and curiosity.",
    image: "/images/school-primary.webp",
  },
  {
    id: "secondary",
    name: "Secondary",
    ages: "JSS 1 – SSS 3",
    line: "BECE, WAEC and NECO preparation with real mentoring.",
    image: "/images/school-secondary.webp",
  },
];

// Per term, in naira. Confirm with the bursar before each session.
export const fees = [
  { level: "Creche", tuition: 85000, levies: 15000, transport: 30000 },
  { level: "Nursery", tuition: 95000, levies: 16000, transport: 30000 },
  { level: "Primary 1–6", tuition: 120000, levies: 20000, transport: 32000 },
  { level: "JSS 1–3", tuition: 150000, levies: 25000, transport: 34000 },
  { level: "SSS 1–3", tuition: 175000, levies: 30000, transport: 34000 },
];

export const principal = {
  name: "Mrs. Olufunmilayo Akinwale",
  title: "Principal",
  photo: "/images/principal.webp",
  welcome:
    "Every child who walks through our gates carries something worth discovering. Our work is to notice it early, protect it, and give it room to grow. At Temidire we keep our classes small so that no pupil is a stranger to a teacher, and we keep our standards high because we believe your child can meet them. Come and see the school on an ordinary day. Sit in a lesson, ask our pupils what they think, and judge us by what you see.",
};

export const leadership = [
  { name: "Mrs. Olufunmilayo Akinwale", role: "Principal", photo: "/images/portrait-teacher-a.webp", bio: "Leads the college with twenty years in Nigerian education." },
  { name: "Mr. Adebayo Fasanya", role: "Vice Principal (Academics)", photo: "/images/portrait-teacher-b.webp", bio: "Keeps our teaching sharp and our results honest." },
  { name: "Mrs. Bukola Oyelade", role: "Vice Principal (Student Welfare)", photo: "/images/portrait-teacher-c.webp", bio: "Every child known, every concern heard." },
  { name: "Mr. Segun Adewale", role: "Bursar", photo: "/images/portrait-teacher-b.webp", bio: "Clear fees, clear receipts, no surprises." },
];

export const staff = [
  { name: "Mrs. Titilayo Bamidele", role: "Head of Primary" },
  { name: "Mr. Kayode Ogunleye", role: "Head of Science" },
  { name: "Mrs. Folake Ajayi", role: "Class Teacher, JSS 1 A" },
  { name: "Mr. Tunde Ogundele", role: "Class Teacher, JSS 2 B" },
  { name: "Mrs. Ronke Adegoke", role: "Class Teacher, Primary 4" },
  { name: "Miss Damilola Ojo", role: "Class Teacher, Nursery 2" },
];

export const routes = [
  { id: "r1", name: "Yaba – Odojomu", stops: ["Yaba Junction", "Odojomu Market", "Ondo Poly Gate", "School"], pickup: "6:45am", termFee: 34000 },
  { id: "r2", name: "Fagun – Sabo", stops: ["Fagun Roundabout", "Sabo Park", "Lagos Garage", "School"], pickup: "6:50am", termFee: 32000 },
  { id: "r3", name: "Akure Road", stops: ["Akure Road Junction", "Bolorunduro", "Town Hall", "School"], pickup: "6:40am", termFee: 36000 },
  { id: "r4", name: "Ife Road", stops: ["Ife Road Filling Station", "Oke-Odo", "Market Square", "School"], pickup: "6:55am", termFee: 32000 },
];

/** Fallback posts — used when the news table is empty or unreachable, so every
 *  `/news/...` link on the site still resolves to a real page. Slugs match the
 *  ones the admin CMS generates. */
export const news = [
  {
    id: 1,
    slug: "admissions-open-for-the-2026-2027-session",
    date: "2026-10-01",
    title: "Admissions open for the 2026/2027 session",
    excerpt: "Places are available from Creche to SSS 1. Book a visit this month.",
    body: "Places are open from Creche to SSS 1 for the 2026/2027 session, and the school office is receiving applications now. Book a campus visit this month — sit in a lesson on an ordinary day, meet the class teacher, and judge the school by what you see.\n\nEvery application is answered within a week, and entrance assessments run on the dates published on the admissions page.",
  },
  {
    id: 2,
    slug: "our-jss-3-team-wins-the-zonal-quiz",
    date: "2026-09-22",
    title: "Our JSS 3 team wins the zonal quiz",
    excerpt: "Five pupils beat 14 schools in Ondo to take the trophy home.",
    body: "Five pupils from JSS 3 beat 14 schools across Ondo to take the zonal quiz trophy home. The team trained after closing for three weeks with Mr. Ogunleye, and came from behind in the final round.\n\nThey now go on to the state competition in November. We are proud of all five.",
  },
  {
    id: 3,
    slug: "new-science-laboratory-opens",
    date: "2026-09-10",
    title: "New science laboratory opens",
    excerpt: "Every SSS class now has weekly practical sessions in the new lab.",
    body: "The new laboratory seats forty at a time and is equipped for chemistry, biology and physics practicals. Every SSS class now has a weekly session there, and JSS classes visit twice a term.\n\nIt was funded partly by the Parents–Teachers Association, and we are grateful to everyone who gave.",
  },
  {
    id: 4,
    slug: "inter-house-sports-day-results-and-photos",
    date: "2026-08-28",
    title: "Inter-house sports day: results and photos",
    excerpt: "Gold House takes the cup after a close finish in the relay.",
    body: "Gold House took the cup after a close finish in the senior relay, with Blue House second by a single point. House positions for the term are now on the noticeboard.\n\nPhotographs from the day — the relay, the marches and the crowd — are in the gallery.",
  },
];

export const events = [
  { date: "2026-10-17", title: "Open day", where: "Main campus" },
  { date: "2026-10-31", title: "Mid-term break begins", where: "—" },
  { date: "2026-11-14", title: "Entrance assessment", where: "Main hall" },
  { date: "2026-12-10", title: "First term examination begins", where: "All classrooms" },
  { date: "2026-12-19", title: "End of first term / vacation", where: "—" },
];

export const testimonials = [
  { quote: "My daughter walked in shy and left leading the debate team. The teachers noticed her before she did.", name: "Adaeze O.", role: "Parent, JSS 2" },
  { quote: "Small classes meant I could ask the question I was embarrassed to ask. That changed my grades.", name: "Tunde A.", role: "Alumnus, class of 2021" },
  { quote: "I came to teach physics and learned how to teach people. The school takes both seriously.", name: "Mr. Ogunleye", role: "Head of Science" },
];

export const timeline = [
  { year: "2006", title: "Founded", text: "Twelve pupils, two teachers and one borrowed classroom." },
  { year: "2011", title: "Secondary section opens", text: "First JSS 1 class admitted." },
  { year: "2016", title: "First full WAEC set", text: "Our first SSS 3 class sits the exam on campus." },
  { year: "2021", title: "School bus service", text: "Four routes across Ondo Town." },
  { year: "2025", title: "New science block", text: "Purpose-built laboratories for every year group." },
];

export const alumni = [
  { name: "Dr. Ifeoluwa Adesina", set: "2012", now: "Medical doctor, Lagos" },
  { name: "Engr. Tobi Akintola", set: "2014", now: "Civil engineer, Abuja" },
  { name: "Mrs. Chiamaka Eze", set: "2018", now: "Software engineer, Lagos" },
  { name: "Mr. Femi Adebisi", set: "2015", now: "Chartered accountant, Ibadan" },
];

export const whyTemidire = [
  { statement: "Classes small enough to know every child.", body: "An average of 18 pupils per class means every name is known, every weakness noticed early, every strength given room." },
  { statement: "Teachers who stay.", body: "Our teachers choose Temidire and remain — your child is not re-learning new faces every session." },
  { statement: "Results you can see each term.", body: "Continuous assessment published every half term, so progress is never a surprise in June." },
];

export const admissionSteps = [
  { title: "Apply online", when: "Any time", text: "Send us a short form. We reply within two working days with dates and fees." },
  { title: "Visit", when: "Weekdays 9:00–14:00", text: "Tour the campus, sit in a lesson and meet the head of year." },
  { title: "Assessment", when: "First Saturday of the month", text: "A friendly written test and a conversation. No preparation needed." },
  { title: "Offer", when: "Within one week", text: "We send a place offer with a fee schedule and a start date." },
  { title: "Enrol", when: "Before term starts", text: "Upload documents, pay the acceptance fee and receive your portal login." },
];

export const admissionRequirements: Record<string, string[]> = {
  Creche: ["Child's birth certificate", "2 passport photographs", "Immunisation card", "Guardian's ID"],
  Nursery: ["Child's birth certificate", "2 passport photographs", "Immunisation card", "Guardian's ID"],
  Primary: ["Child's birth certificate", "2 passport photographs", "Last school report", "Guardian's ID"],
  Secondary: ["Child's birth certificate", "2 passport photographs", "Last school report", "Primary School Leaving Certificate", "Guardian's ID"],
};

export const departments = [
  { name: "Sciences", subjects: "Mathematics · Further Maths · Physics · Chemistry · Biology · Agricultural Science" },
  { name: "Arts & Humanities", subjects: "English · Literature · Government · CRS/IRS · History · Yoruba" },
  { name: "Commercial", subjects: "Economics · Accounting · Commerce · Office Practice" },
];

export const gradingSystem = [
  { grade: "A1", range: "75–100", remark: "Excellent" },
  { grade: "B2", range: "70–74", remark: "Very good" },
  { grade: "B3", range: "65–69", remark: "Good" },
  { grade: "C4", range: "60–64", remark: "Credit" },
  { grade: "C5", range: "55–59", remark: "Credit" },
  { grade: "C6", range: "50–54", remark: "Credit" },
  { grade: "D7", range: "45–49", remark: "Pass" },
  { grade: "E8", range: "40–44", remark: "Pass" },
  { grade: "F9", range: "0–39", remark: "Fail" },
];

/** Real photographs in public/images. `album` drives the filter chips on /gallery. */
export const galleryImages = [
  { id: "assembly", src: "/images/assembly.webp", alt: "Morning assembly on the courtyard", album: "Campus life", caption: "Rows of pupils in navy uniforms line up for assembly" },
  { id: "playground", src: "/images/playground.webp", alt: "Children playing on the school playground", album: "Campus life", caption: "Break time on the playground" },
  { id: "school-bus", src: "/images/school-bus.webp", alt: "Pupils boarding the school bus", album: "Campus life", caption: "The bus at the gate after closing" },
  { id: "library", src: "/images/library.webp", alt: "Quiet school library with wooden shelves", album: "Classrooms", caption: "Reading period in the library" },
  { id: "computer-lab", src: "/images/computer-lab.webp", alt: "Students at desktop computers in the school computer room", album: "Classrooms", caption: "Computer studies, two pupils to a machine" },
  { id: "classroom", src: "/images/classroom.webp", alt: "Wide shot of a secondary classroom in session", album: "Classrooms", caption: "A secondary class mid-lesson" },
  { id: "science-lab", src: "/images/science-lab.webp", alt: "Modern school science lab with microscopes and glassware", album: "Science", caption: "Practical work at the lab benches" },
  { id: "sports-day", src: "/images/sports-day.webp", alt: "Children in house colours running a relay", album: "Sports", caption: "Inter-house relay on sports day" },
  { id: "graduation", src: "/images/graduation.webp", alt: "Graduates in navy gowns throwing their caps", album: "Celebrations", caption: "Leavers throw their caps at the closing ceremony" },
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

/** Sample week for the student/parent portal timetable.
 *  Real per-class timetables arrive with the Phase 2 schema. */
export const portalTimetable = {
  Mon: [
    { id: "mon-1", start: "08:00", end: "08:45", subject: "Assembly", room: "Courtyard" },
    { id: "mon-2", start: "08:45", end: "09:30", subject: "Mathematics", teacher: "Mr. Kayode Ogunleye", room: "Room 12" },
    { id: "mon-3", start: "09:30", end: "10:15", subject: "English Language", teacher: "Mrs. Folake Ajayi", room: "Room 12" },
    { id: "mon-4", start: "10:15", end: "10:45", subject: "Break", kind: "break" as const },
    { id: "mon-5", start: "10:45", end: "11:30", subject: "Basic Science", teacher: "Mr. Kayode Ogunleye", room: "Lab 1" },
    { id: "mon-6", start: "11:30", end: "12:15", subject: "Civic Education", teacher: "Mrs. Ronke Adegoke", room: "Room 12" },
    { id: "mon-7", start: "12:15", end: "13:00", subject: "Lunch", kind: "break" as const },
    { id: "mon-8", start: "13:00", end: "13:45", subject: "Yoruba", teacher: "Miss Damilola Ojo", room: "Room 12" },
    { id: "mon-9", start: "13:45", end: "14:30", subject: "Creative Arts", teacher: "Mrs. Titilayo Bamidele", room: "Art room" },
  ],
  Tue: [
    { id: "tue-1", start: "08:00", end: "08:45", subject: "Morning reading", room: "Room 12" },
    { id: "tue-2", start: "08:45", end: "09:30", subject: "Mathematics", teacher: "Mr. Kayode Ogunleye", room: "Room 12" },
    { id: "tue-3", start: "09:30", end: "10:15", subject: "Social Studies", teacher: "Mrs. Ronke Adegoke", room: "Room 12" },
    { id: "tue-4", start: "10:15", end: "10:45", subject: "Break", kind: "break" as const },
    { id: "tue-5", start: "10:45", end: "11:30", subject: "English Language", teacher: "Mrs. Folake Ajayi", room: "Room 12" },
    { id: "tue-6", start: "11:30", end: "12:15", subject: "Computer Studies", teacher: "Mr. Adebayo Fasanya", room: "Computer room" },
    { id: "tue-7", start: "12:15", end: "13:00", subject: "Lunch", kind: "break" as const },
    { id: "tue-8", start: "13:00", end: "13:45", subject: "Physical Education", teacher: "Mr. Tunde Ogundele", room: "Field" },
    { id: "tue-9", start: "13:45", end: "14:30", subject: "Library period", room: "Library" },
  ],
  Wed: [
    { id: "wed-1", start: "08:00", end: "08:45", subject: "Devotion", room: "Hall" },
    { id: "wed-2", start: "08:45", end: "09:30", subject: "Basic Science", teacher: "Mr. Kayode Ogunleye", room: "Lab 1" },
    { id: "wed-3", start: "09:30", end: "10:15", subject: "Mathematics", teacher: "Mr. Kayode Ogunleye", room: "Room 12" },
    { id: "wed-4", start: "10:15", end: "10:45", subject: "Break", kind: "break" as const },
    { id: "wed-5", start: "10:45", end: "11:30", subject: "Creative Arts", teacher: "Mrs. Titilayo Bamidele", room: "Art room" },
    { id: "wed-6", start: "11:30", end: "12:15", subject: "English Language", teacher: "Mrs. Folake Ajayi", room: "Room 12" },
    { id: "wed-7", start: "12:15", end: "13:00", subject: "Lunch", kind: "break" as const },
    { id: "wed-8", start: "13:00", end: "14:30", subject: "Inter-house sports", teacher: "Mr. Tunde Ogundele", room: "Field" },
  ],
  Thu: [
    { id: "thu-1", start: "08:00", end: "08:45", subject: "Morning reading", room: "Room 12" },
    { id: "thu-2", start: "08:45", end: "09:30", subject: "English Language", teacher: "Mrs. Folake Ajayi", room: "Room 12" },
    { id: "thu-3", start: "09:30", end: "10:15", subject: "Basic Technology", teacher: "Mr. Adebayo Fasanya", room: "Workshop" },
    { id: "thu-4", start: "10:15", end: "10:45", subject: "Break", kind: "break" as const },
    { id: "thu-5", start: "10:45", end: "11:30", subject: "Mathematics", teacher: "Mr. Kayode Ogunleye", room: "Room 12" },
    { id: "thu-6", start: "11:30", end: "12:15", subject: "Civic Education", teacher: "Mrs. Ronke Adegoke", room: "Room 12" },
    { id: "thu-7", start: "12:15", end: "13:00", subject: "Lunch", kind: "break" as const },
    { id: "thu-8", start: "13:00", end: "13:45", subject: "Yoruba", teacher: "Miss Damilola Ojo", room: "Room 12" },
    { id: "thu-9", start: "13:45", end: "14:30", subject: "Music", teacher: "Mrs. Titilayo Bamidele", room: "Music room" },
  ],
  Fri: [
    { id: "fri-1", start: "08:00", end: "08:45", subject: "Assembly", room: "Courtyard" },
    { id: "fri-2", start: "08:45", end: "09:30", subject: "Mathematics", teacher: "Mr. Kayode Ogunleye", room: "Room 12" },
    { id: "fri-3", start: "09:30", end: "10:15", subject: "English Language", teacher: "Mrs. Folake Ajayi", room: "Room 12" },
    { id: "fri-4", start: "10:15", end: "10:45", subject: "Break", kind: "break" as const },
    { id: "fri-5", start: "10:45", end: "11:30", subject: "Quiz & club activities", teacher: "Mr. Kayode Ogunleye", room: "Hall" },
    { id: "fri-6", start: "11:30", end: "12:15", subject: "Close of week", kind: "break" as const },
  ],
};

/** Demo fee position for the portal. Real balances come from the fee table in Phase 3. */
export const portalFees = {
  level: "Primary 1–6",
  paid: 85000,
  total: 140000,
  status: "PARTIAL" as const,
};
