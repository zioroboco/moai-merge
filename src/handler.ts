import { toLambda } from "probot-serverless-now"
import appFunction from "./app"

export default toLambda(appFunction)
