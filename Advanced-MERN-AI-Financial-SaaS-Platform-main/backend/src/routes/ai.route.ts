import express from "express";
import { getAiCoachController } from "../controllers/ai.controller";
import { aiChatController } from "../controllers/ai-chatcontroller";
import { passportAuthenticateJwt } from "../config/passport.config";
import { voiceChatController } from "../controllers/voice.controller";

const airouter = express.Router();

airouter.post("/chat", passportAuthenticateJwt, aiChatController);
airouter.get("/ai-coach", getAiCoachController);
airouter.post("/voice", passportAuthenticateJwt, voiceChatController);

export default airouter;