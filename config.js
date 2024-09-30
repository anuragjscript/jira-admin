import { config } from "dotenv";
config();

export default {
  jiraDomain: process.env.JIRA_DOMAIN,
  jiraEmail: process.env.JIRA_EMAIL,
  jiraApiToken: process.env.JIRA_API_TOKEN,
};
