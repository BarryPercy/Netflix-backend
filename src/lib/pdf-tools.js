import PdfPrinter from "pdfmake"
import fetch from "node-fetch"
import { Buffer } from "buffer"
import createHttpError from "http-errors";

const getImageDataURL = async (imageUrl) => {
    try{
        const response = await fetch(imageUrl);
        if(!response.ok){
            next(createHttpError(404, `Blog post image not found`))
        }
        const buffer = await response.buffer();
        const dataUrl = `data:${response.headers.get('content-type')};base64,${buffer.toString('base64')}`;
        return dataUrl;
    }catch(error){
        console.error(error);
    }
  };

export const getPDFReadableStream = async media => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  }
  const imageUrl = media.poster;
  const imageDataUrl = await getImageDataURL(imageUrl);
  const printer = new PdfPrinter(fonts)
  const docDefinition = {
    content: [
        { 
            image: imageDataUrl,
            fit:[250,250]
        },
        { text: media.title+"("+media.year+")", style:'header'},
        { text: "type:"+media.type+" imdbID:"+media.imdbID, style: 'subHeader' },
    ],
    defaultStyle: {
      font: "Helvetica",
    },
    styles: {
        header: {
          fontSize: 22,
          bold: true
        },
        subHeader: {
          fontSize: 15,
          bold:true
        }
      }
  };


  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}
