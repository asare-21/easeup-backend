const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { AzureCSAModel } = require("../models/azure_csa_model");
const { save } = require("node-cron/src/storage");
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.AZURE_OPENAI_KEY;

class AzureAIService {
    // Customer Service Agent
    async customerService(req, res) {
        try {
            const { query } = req.body
            const user = req.user.id
            const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
            const deploymentId = "testing";
            const azureQuery = {
                content: query,
                role: "user"
            }
            // get past queries for the day
            var pastQueries = await AzureCSAModel.find({
                user
            }).limit(30)

            pastQueries.push(azureQuery)
            // get past queries for the day
            const completions = await client.getChatCompletions(deploymentId, pastQueries)
            if (completions.choices)
                await this.saveQuery(query, completions.choices, user)
            return {
                status: 200,
                message: "success",
                data: completions.choices[0].message
            }
        } catch (e) {
            console.error(e)
            return {
                status: 500,
                message: "Internal Server Error",
                data: e
            }
        }
    }

    async saveQuery(query, completions, user) {
        if (completions) { // save the response
            const newQuery = new AzureCSAModel({
                role: "user",
                content: query,
                response: completions[0].message.content,
                user
            })
            return await Promise.all([
                newQuery.save(),
            ])
        }
        return
    }
}


module.exports.AzureAIService = new AzureAIService()