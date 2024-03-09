//For Multiselect

const mongoose = require("mongoose");

const TechnologiesSchema = new mongoose.Schema({
  frontend: [{
    type: String,
    enum: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Svelte", "Next.js", "Redux", "Bootstrap", "Tailwind CSS", "SASS/LESS"],
  }],
  backend: [{
    type: String,
    enum: ["Node.js", "Express.js", "Django", "Ruby on Rails", "Java", "PHP Laravel", "Kotlin", "Go", "C#"],
  }],
  design: [{
    type: String,
    enum: ["Adobe XD", "Sketch", "Figma", "InVision", "Photoshop", "Illustrator"],
  }],
  projectManagement: [{
    type: String,
    enum: ["Jira", "Trello", "Asana", "Confluence", "Linear"],
  }],
  devOps: [{
    type: String,
    enum: ["Docker", "AWS", "Azure", "GCP", "Jenkins", "GitHub Actions", "GitLab CI/CD"],
  }],
  qualityAssurance: [{
    type: String,
    enum: ["Selenium", "Jest", "Mocha", "Chai", "Cypress", "Postman", "JMeter"],
  }],
  database: [{
    type: String,
    enum: ["SQL", "NoSQL", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Cassandra"],
  }],
}, { _id: false }); 

module.exports = TechnologiesSchema;

/*

//For Editable Multiselect

const mongoose = require("mongoose");

const predefinedTechs = {
  frontend: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Svelte", "Next.js", "Redux", "Bootstrap", "Tailwind CSS", "SASS/LESS"],
  backend: ["Node.js", "Express.js", "Django", "Ruby on Rails", "Java", "PHP Laravel", "Kotlin", "Go", "C#"],
  design: ["Adobe XD", "Sketch", "Figma", "InVision", "Photoshop", "Illustrator"],
  projectManagement: ["Jira", "Trello", "Asana", "Confluence", "Linear"],
  devOps: ["Docker", "AWS", "Azure", "GCP", "Jenkins", "GitHub Actions", "GitLab CI/CD"],
  qualityAssurance: ["Selenium", "Jest", "Mocha", "Chai", "Cypress", "Postman", "JMeter"],
  database: ["SQL", "NoSQL", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Cassandra"],
};

const validateTechnology = (technologyCategory) => {
  return {
    validator: function(technology) {
      return predefinedTechs[technologyCategory].includes(technology) || (typeof technology === "string" && technology.trim() !== "");
    },
    message: `Please provide a valid ${technologyCategory} technology, type your own, or skip.`
  };
};

const TechnologiesSchema = new mongoose.Schema({
  frontend: [{
    type: String,
    validate: validateTechnology("frontend")
  }],
  backend: [{
    type: String,
    validate: validateTechnology("backend")
  }],
  design: [{
    type: String,
    validate: validateTechnology("design")
  }],
  projectManagement: [{
    type: String,
    validate: validateTechnology("projectManagement")
  }],
  devOps: [{
    type: String,
    validate: validateTechnology("devOps")
  }],
  qualityAssurance: [{
    type: String,
    validate: validateTechnology("qualityAssurance")
  }],
  database: [{
    type: String,
    validate: validateTechnology("database")
  }],
}, { _id: false });


module.exports = TechnologiesSchema;

*/