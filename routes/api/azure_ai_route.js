const { AzureAIController } = require("../../controllers/azure_ai_controller");
const { verifyJWT } = require("../../passport/common");
const { AzureAIService } = require("../../services/azure_app_service");
const router = require("express").Router();

router.post("/query", verifyJWT, AzureAIController.csaChatCompletion)



module.exports.azureAIRouter = router;