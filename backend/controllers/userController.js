const User = require("../models/User");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Simple skill dictionary – aap apni list badha sakte ho
const SKILL_DICT = [
  // 👉 IT & Software Development
"html", "css", "javascript", "typescript", "react", "angular", "vue", "next.js", "nuxt.js",
"node", "express", "mongodb", "sql", "postgres", "tailwind", "redux", "rest", "api",
"python", "django", "flask", "java", "spring", "docker", "kubernetes", "aws", "gcp", "azure",
"git", "github", "testing", "jest", "cypress", "graphql", "ci", "cd", "redis", "rabbitmq","microservices",
"svelte","jquery","bootstrap","sass","less","webpack","vite",
"nestjs","fastify","php","laravel","ruby","rails",
"kotlin","scala","go","rust","c","c++","c#","dotnet","asp.net",
"mysql","sqlite","mariadb","oracle","firebase",
"axios","postman","soap","grpc","socket.io","websockets","gitlab","bitbucket",
"vscode","intellij","eclipse","pycharm",
"jenkins","githubactions","gitlabci","circleci","travis",
"helm","terraform","ansible","vagrant","cloudflare",
"ec2","s3","lambda","cloudfront","rds","dynamodb","iam","cognito","cloudwatch",
"linux","ubuntu","bash","zsh","powershell","terminal","vim","nano","tmux",
"mocha","chai","playwright","selenium","vitest",
"storybook","tdd","bdd","junit","nunit","robotframework","sonarqube",
"eslint","prettier","husky","commitlint","swagger","openapi","pydantic","sqlalchemy",
"monorepo","nx","turbo","lerna","kafka","nats",
"elasticsearch","logstash","kibana","prometheus","grafana","datadog","newrelic",
"sentry","splunk","auth0","oauth","jwt","saml","keycloak","devops","devsecops",
//👉DataScience&Analytics
"r","excel","msexcel","powerbi","tableau","looker","qlik",
"dataanalysis","datavisualization","datamining","datawrangling","datacleaning",
"etl","bigquery","snowflake","redshift","spark","hadoop","hive","pig","airflow",
"pandas","numpy","matplotlib","seaborn","plotly","dash","statsmodels","scipy",
"scikit-learn","xgboost","lightgbm","catboost","machinelearning","mlops",
"deeplearning","tensorflow","keras","pytorch","onnx","cv2","opencv","computervision",
"nlp","nltk","spacy","transformers","huggingface","llm","langchain","chatgpt",
"generativeai","openai","dvc","mlflow","featureengineering","modeltuning",
"modeldeployment","flaskapi","fastapi","streamlit","gradio","kaggle",
//👉Finance&Accounting
"tally","quickbooks","zohobooks","sapfico","accounting","bookkeeping",
"gst","incometax","tds","balancesheet","p&l","financialstatements",
"auditing","budgeting","forecasting","cfa","ca","investmentanalysis",
"financialanalysis","ratioanalysis","bankreconciliation","payroll","erp","costing",
"valuation","taxation","compliance",
//👉Marketing&Sales
"seo","sem","googleads","facebookads","instagrammarketing",
"linkedinads","emailmarketing","mailchimp","campaigns","a/btesting",
"contentwriting","copywriting","digitalmarketing","socialmedia",
"influencermarketing","hubspot","crm","salesforce","zohocrm",
"leadgeneration","sales","coldcalling","negotiation","marketresearch",
"branding","publicrelations","storytelling","analytics","conversionoptimization",
//👉HR&Management
"recruitment","talentacquisition","interviewing","hrms","laborlaws","employeeengagement",
"traininganddevelopment","onboarding","performanceappraisal","hranalytics","organizationaldevelopment",
"scrum","agile","kanban","jira","confluence","projectmanagement",
"stakeholdermanagement","resourceplanning","riskmanagement","conflictresolution",
"peoplemanagement","teamleadership","changemanagement",
//👉Mechanical/Civil/CoreEngineering
"autocad","solidworks","creo","catia","ansys","matlab","simulink","mechanicaldesign",
"machinedesign","cam","cad","fea","cfd","staadpro","etabs","revit","primavera",
"msproject","construction","structuralengineering","surveying","autodesk","bim",
"plc","scada","hvac","piping","fluidmechanics","thermodynamics","manufacturing",
//👉Healthcare/Medical/Pharma
"nursing","patientcare","diagnosis","pharmacology","mbbs","bds","ayurveda","homeopathy",
"surgery","pathology","radiology","clinicalresearch","labtechnician","dmlt",
"hospitalmanagement","emr","ehr","firstaid","emergencymedicine","medicalwriting",
"public health", "epidemiology", "biostatistics", "vaccination", "medical coding",
// 👉 Soft Skills
"communication", "teamwork", "problem solving", "critical thinking", "time management",
"leadership", "adaptability", "creativity", "presentation", "organization",
"emotional intelligence", "public speaking", "decision making", "conflict resolution",
"resilience", "accountability", "multitasking", "attention to detail", "collaboration", "negotiation"
];

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(text) {
  return text.toLowerCase().replace(/[\W_]+/g, " ");
}

function extractSkillsFromText(text) {
  const normalizedText = normalize(text);
  
  const found = new Set();

  SKILL_DICT.forEach(s => {
    const normalizedSkill = normalize(s);
    const skillPattern = escapeRegex(normalizedSkill);
    const pat = new RegExp(`\\b${skillPattern}\\b`, "i");
    if (pat.test(normalizedText)) {
      found.add(s);
    }
  });

  return Array.from(found);
}

// Extract personal information from resume text
function extractPersonalInfo(text) {
  const normalizedText = text.toLowerCase();
  
  // Extract phone number
  const phonePatterns = [
    /(\+91[\s-]?)?[789]\d{9}/g, // Indian mobile
    /(\+1[\s-]?)?\(?([0-9]{3})\)?[\s-]?([0-9]{3})[\s-]?([0-9]{4})/g, // US format
    /(\+44[\s-]?)?[0-9]{10,11}/g, // UK format
    /[0-9]{10,15}/g // General 10-15 digits
  ];
  
  let phone = "";
  for (const pattern of phonePatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      phone = match[0].replace(/[\s\-\(\)]/g, '');
      break;
    }
  }

  return {
    phone: phone || ""
  };
}

exports.uploadResume = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let text = "";
    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      text = data.text || "";
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = data.value || "";
    } else if (req.file.mimetype.startsWith("text/")) {
      text = req.file.buffer.toString();
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from file" });
    }

    const skills = extractSkillsFromText(text);
    const personalInfo = extractPersonalInfo(text);

    // Get current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        skills, 
        resumeUrl: req.file.originalname,
        phone: personalInfo.phone || currentUser?.phone || ""
      },
      { new: true }
    );

    if (!user) {
      return res.status(500).json({ message: "Failed to update user profile" });
    }

    res.json({ 
      message: "Resume parsed successfully", 
      skills: user.skills, 
      personalInfo,
      user 
    });
  } catch (err) {
    console.error("Upload Resume Error:", err);
    res.status(500).json({ 
      message: "Resume parsing failed", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
