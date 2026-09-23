require("dotenv").config()

const mongoose = require("mongoose")
const JobsSchema = require("./src/models/job")
const { verifySchemaData } = require("./joiSchema")

const jobData = [

    {title: "Front Desk Receptionist",description: "Manage incoming calls, greet visitors, and handle basic administrative tasks at a busy corporate office.",budget: "400-500",jobstatus: "ACTIVE",location: "Nigeria",duration: "12-months"},
    {title: "Social Media Manager",description: "Create engaging content, manage community interactions, and run ad campaigns across Instagram and TikTok.",budget: "700-900",jobstatus: "ACTIVE",location: "Nigeria",duration: "3-months"},
    {title: "Data Entry Clerk",description: "Input customer data and financial records into the company database with high speed and accuracy.",budget: "350-450",jobstatus: "ACTIVE",location: "Nigeria",duration: "1-month"},
    {title: "Graphic Designer",description: "Design marketing flyers, branding materials, and digital assets for an upcoming product launch.",budget: "800-1000",jobstatus: "ACTIVE",location: "Nigeria",duration: "2-months"},
    {title: "Delivery Rider",description: "Dispatch packages and documents safely and timely to clients across metropolitan areas.",budget: "450-550",jobstatus: "ACTIVE",location: "Nigeria",duration: "6-months"},
    {title: "Content Writer",description: "Write SEO-optimized blog posts, website copy, and weekly newsletters for a tech startup.",budget: "600-800",jobstatus: "ACTIVE",location: "Nigeria",duration: "4-months"},
    {title: "Customer Support Agent",description: "Respond to customer inquiries via live chat and email to resolve order and technical issues.",budget: "500-650",jobstatus: "ACTIVE",location: "Nigeria",duration: "6-months"},
    {title: "Sales Representative",description: "Promote and sell retail products to walk-in customers and manage store inventory levels.",budget: "550-700",jobstatus: "ACTIVE",location: "Nigeria",duration: "12-months"},
    {title: "UI/UX Designer",description: "Create wireframes, prototypes, and user flows for a new mobile banking application.",budget: "1200-1500",jobstatus: "ACTIVE",location: "Nigeria",duration: "5-months"},
    {title: "Virtual Assistant",description: "Provide remote administrative support, schedule meetings, and manage email correspondence for executives.",budget: "600-750",jobstatus: "ACTIVE",location: "Nigeria",duration: "6-months"},
    {title: "Video Editor",description: "Edit raw footage into high-quality promotional videos and YouTube shorts for a digital media agency.",budget: "900-1100",jobstatus: "ACTIVE",location: "Nigeria",duration: "3-months"},
    {title: "Quality Assurance Tester",description: "Perform manual and automated testing on web applications to identify and report bugs.",budget: "1000-1300",jobstatus: "ACTIVE",location: "Nigeria",duration: "6-months"},
    {title: "Storekeeper",description: "Receive, log, and organize raw materials in the warehouse while maintaining safety standards.",budget: "400-500",jobstatus: "ACTIVE",location: "Nigeria",duration: "12-months"},
    {title: "SEO Specialist",description: "Optimize website architecture and conduct keyword research to improve organic search rankings.",budget: "850-1100",jobstatus: "ACTIVE",location: "Nigeria",duration: "3-months"},
    {title: "HR Assistant",description: "Assist with the recruitment process, schedule interviews, and maintain physical and digital employee records.",budget: "650-800",jobstatus: "ACTIVE",location: "Nigeria",duration: "6-months"},
    {title: "Web Developer",description: "Build and maintain a responsive WordPress e-commerce website for a fashion brand.",budget: "1100-1400",jobstatus: "ACTIVE",location: "Nigeria",duration: "2-months"},
    {title: "Accountant",description: "Prepare monthly financial statements, manage payroll, and handle tax filings for a retail chain.",budget: "900-1200",jobstatus: "CLOSED",location: "Nigeria",duration: "12-months"},
    {title: "Mobile App Developer",description: "Develop and deploy a cross-platform Flutter application for a logistics company.",budget: "1500-2000",jobstatus: "EXPIRED",location: "Nigeria",duration: "4-months"},
    {title: "Office Cleaner",description: "Maintain cleanliness and hygiene standards across all office floors and common areas daily.",budget: "300-400",jobstatus: "CLOSED",location: "Nigeria",duration: "12-months"},
    {title: "Digital Marketing Executive",description: "Plan and execute all web, SEO, SEM, marketing database, email, and display advertising campaigns.",budget: "800-1000",jobstatus: "EXPIRED",location: "Nigeria",duration: "6-months"},
    {title: "Security Guard",description: "Monitor premises to prevent theft, violence, or infractions of rules, and secure all exits.",budget: "400-500",jobstatus: "CLOSED",location: "Nigeria",duration: "12-months"},
    {title: "Project Manager",description: "Coordinate internal resources and third parties/vendors for the flawless execution of real estate projects.",budget: "1800-2200",jobstatus: "EXPIRED",location: "Nigeria",duration: "8-months"},
    {title: "Copywriter",description: "Write clear, persuasive sales copy for landing pages, social media ads, and product descriptions.",budget: "700-900",jobstatus: "CLOSED",location: "Nigeria",duration: "3-months"},
    {title: "Business Analyst",description: "Evaluate business processes, anticipate requirements, uncover areas for improvement, and implement solutions.",budget: "1300-1600",jobstatus: "EXPIRED",location: "Nigeria",duration: "6-months"},
    {title: "Electrician",description: "Install, maintain, and repair electrical systems and equipment in a newly constructed commercial facility.",budget: "600-850",jobstatus: "CLOSED",location: "Nigeria",duration: "1-month"},
    {title: "Brand Ambassador",description: "Represent the brand at promotional events and trade shows to drive product awareness and sign-ups.",budget: "500-700",jobstatus: "EXPIRED",location: "Nigeria",duration: "2-months"},
    {title: "Network Administrator",description: "Support, configure, maintain, and upgrade corporate customer networks and in-house servers.",budget: "1100-1400",jobstatus: "CLOSED",location: "Nigeria",duration: "12-months"},
    {title: "Logistics Coordinator",description: "Manage shipping schedules, track incoming inventory, and coordinate with local dispatch carriers.",budget: "750-950",jobstatus: "EXPIRED",location: "Nigeria",duration: "6-months"},
    {title: "Fashion Illustrator",description: "Create detailed sketches and digital mockups for a new ready-to-wear clothing collection.",budget: "650-800",jobstatus: "CLOSED",location: "Nigeria",duration: "2-months"},
    {title: "Cybersecurity Specialist",description: "Conduct vulnerability assessments and implement data protection measures across corporate networks.",budget: "2000-2500",jobstatus: "EXPIRED",location: "Nigeria",duration: "6-months"},
    {title: "Call Center Representative",description: "Handle large volumes of inbound customer service calls, resolving billing disputes and service complaints.",budget: "450-550",jobstatus: "CLOSED",location: "Nigeria",duration: "6-months"}

];


(async function seedJobQuery(){
    try {

        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected")

        await JobsSchema.deleteMany()

        const {error,value} = verifySchemaData(jobData)

        if(error) {
            throw new Error(error)
        }

        await JobsSchema.insertMany(value)



    } catch (err) {
        console.log("error seeding database:" + ' ' + err)
        await mongoose.disconnect()
        process.exit(1)
    }finally{
        await mongoose.disconnect()
        console.log("mongoose disconnected gracefully")
    }
}())