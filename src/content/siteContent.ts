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

export const news = [
  { id: 1, date: "2026-10-01", title: "Admissions open for the 2026/2027 session", excerpt: "Places are available from Creche to SSS 1. Book a visit this month." },
  { id: 2, date: "2026-09-22", title: "Our JSS 3 team wins the zonal quiz", excerpt: "Five pupils beat 14 schools in Ondo to take the trophy home." },
  { id: 3, date: "2026-09-10", title: "New science laboratory opens", excerpt: "Every SSS class now has weekly practical sessions in the new lab." },
  { id: 4, date: "2026-08-28", title: "Inter-house sports day: results and photos", excerpt: "Gold House takes the cup after a close finish in the relay." },
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

export const galleryImages = [
  { src: "/images/assembly.webp", alt: "Morning assembly" },
  { src: "/images/science-lab.webp", alt: "Science laboratory session" },
  { src: "/images/sports-day.webp", alt: "Inter-house sports relay" },
  { src: "/images/library.webp", alt: "The school library" },
  { src: "/images/computer-lab.webp", alt: "Computer laboratory" },
  { src: "/images/graduation.webp", alt: "Graduation day" },
  { src: "/images/playground.webp", alt: "Playground break time" },
  { src: "/images/school-bus.webp", alt: "School bus at the gate" },
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
