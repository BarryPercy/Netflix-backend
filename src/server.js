import Express from "express" 
import listEndpoints from "express-list-endpoints"
import cors from 'cors'
import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notfoundHandler } from "./errorsHandlers.js"
import { join } from "path"
import createHttpError from "http-errors"
import mediaRouter from "./api/medias/index.js"
const server = Express()
const port = process.env.PORT
const publicFolderPath = join(process.cwd(), "./public")

server.use(Express.static(publicFolderPath))

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

console.log("whitelist->",whiteList)
const corsOptions = {
  origin: (origin,corsNext) => {
    if(!origin || whiteList.indexOf(origin)!==-1){
      corsNext(null,true)
    }else{
      corsNext(
        corsNext(createHttpError(400, `Origin ${origin} is not in the whitelist!`))
      )
    }
  }
}
server.use(
  cors(corsOptions)
)

// server.use(cors({
//   origin: {currentOrigin}
// }))
server.use(Express.json())


server.use("/medias", mediaRouter)

server.use(badRequestHandler) // 400
server.use(unauthorizedHandler) // 401
server.use(notfoundHandler) // 404
server.use(genericErrorHandler) // 500

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
