import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import nameToImdb from "name-to-imdb"

const { readJSON, writeJSON, writeFile, createReadStream } = fs

// const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
// const authorsJSONPath = join(dataFolderPath, "authors.json")
// const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json")
// const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors")
// const blogPostsPublicFolderPath = join(process.cwd(), "./public/img/blogPosts")

// export const getAuthors = () => readJSON(authorsJSONPath)
// export const writeAuthors = authorsArray => writeJSON(authorsJSONPath, authorsArray)
// export const getBlogPosts = () => readJSON(blogPostsJSONPath)
// export const writeBlogPosts = blogPostsArray => writeJSON(blogPostsJSONPath, blogPostsArray)

// export const saveAuthorsAvatars = (fileName, fileContentAsBuffer) => writeFile(join(authorsPublicFolderPath, fileName), fileContentAsBuffer)
// export const saveBlogPostAvatars = (fileName, fileContentAsBuffer) => writeFile(join(blogPostsPublicFolderPath, fileName), fileContentAsBuffer)

// export const getBlogPostsJSONReadableStream = () => createReadStream(blogPostsJSONPath)

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const mediaJSONPath = join(dataFolderPath, "media.json")
export const getMedia = () => readJSON(mediaJSONPath)
export const writeMedia = mediaArray => writeJSON(mediaJSONPath, mediaArray)
export const getImdb = (movieTitle, movieYear)=> {
    return new Promise((resolve,reject)=>{
        nameToImdb({name:movieTitle, year:movieYear}, function(err,res,inf){
            if (err){
                reject(err)
            }else{
                resolve(inf)
            }
        });    
    });
};