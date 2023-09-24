const { AzureAIService } = require("../services/azure_app_service")

class AzureAIController {
    csaChatCompletion = async (req, res, next) => {
        const { status, ...data } = await AzureAIService.customerService(req, res)
        
        res.status(status).send(data)
    }
}


module.exports.AzureAIController = new AzureAIController()