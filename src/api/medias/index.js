import Express from "express"
import uniqid from "uniqid"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { getImdb, getMedia, writeMedia } from "../../lib/fs-tools.js"
import { checkMediaSchema, triggerBadRequest } from "./validation.js"
import { v2 as cloudinary } from "cloudinary"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"
import { pipeline } from "stream"

const mediaRouter = Express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {
        folder: "netflix",
      },
    }),
  }).single("poster");

mediaRouter.post("/", checkMediaSchema, triggerBadRequest, async (req, res, next) => {
    let movieData = await getImdb(req.body.title,req.body.year)
    console.log(movieData)
    if (movieData.match==="imdbFind"){
        console.log(movieData.meta.id)
        let postType;
        switch(movieData.meta.type){
            case "series":
                postType = "tv show"
                break;
            case "feature":
                postType = "movie"
                break;
            default:
                postType = movieData.meta.type;
        }
        const newMedia = { ...req.body, imdbID:movieData.meta.id, poster:movieData.meta.image.src,type:postType }
        const mediaArray = await getMedia();
        mediaArray.push(newMedia)
        await writeMedia(mediaArray)
        res.status(201).send({ id: newMedia.id })
    }else{
        next(createHttpError(404, `Media with title ${req.body.title} not found!`))
    }
    
})

mediaRouter.get("/", async (req, res, next) => {
  try{
    const mediaArray = await getMedia();
    res.send(mediaArray)
  }catch(error){
    next(error)
  }
})

mediaRouter.get("/:mediaId", async (req, res, next) => {
  try{
    const mediaArray = await getMedia();
    const media = mediaArray.find(media => media.imdbID === req.params.mediaId)
    if(media){
      res.send(media)
    }else{
      next(createHttpError(404, `Media with id ${req.params.mediaId} not found!`))
    }
  }catch(error){
    next(error)
  }
})

mediaRouter.post("/:mediaId/poster", cloudinaryUploader, async (req, res, next) => {
    try {
         const mediaArray = await getMedia();
         const index = mediaArray.findIndex(media => media.imdbID === req.params.mediaId)
         if(index!==-1){
           const oldMedia = mediaArray[index]
           const updatedMedia = { ...oldMedia, ...req.body, poster: req.file.path}
           mediaArray[index] = updatedMedia
           await writeMedia(mediaArray);
           res.send(updatedMedia)
         }else{
           next(createHttpError(404, `Media with id ${req.params.mediaId} not found!`))
         }
    } catch (error) {
        next(error)
    }
})

mediaRouter.get("/:mediaId/pdf", async (req, res, next) => {
    try {
      res.setHeader("Content-Disposition", "attachment; filename=example.pdf")
      const media = await getMedia();
      const mediaIndex = media.findIndex(media => media.imdbID === req.params.mediaId)
      if(mediaIndex!==-1){
        res.setHeader("Content-Disposition", "attachment; filename=example.pdf")
        console.log(media[mediaIndex]);
        const source = await getPDFReadableStream(media[mediaIndex])
        const destination = res
        
        pipeline(source, destination, err => {
          if (err) console.log(err)
        })
      }else{
        next(createHttpError(404, `Blog Post with id ${req.params.mediaId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })
export default mediaRouter