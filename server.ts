import express from "express";
const app = express();
import { ImagesToPDF } from "images-pdf";  //Image to PDF (working fine)
import multer from "multer";
import path from "path";
import fs from "fs";
const PORT = 5700;
import PDFDocument, { file } from "pdfkit";  // image to PDF(working but after every request server needs to restart)
const doc = new PDFDocument();   
import pdfToImage from 'pdf-img-convert';
import cors from 'cors';
// import zip from 'express-zip'

// app.use(cors({origin:'http://localhost:3000'}));
app.use(cors());


let dir = "upload";
let fileArray: any;
var renderPath : any;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
//    upload file
let STORAGE = multer.diskStorage({
  destination: "upload",
  filename: (req: any, file: any, cb: any) => {
    // console.log(file, 'hello')

    let originalName = file.originalname;
    // console.log(originalName);
    let indexPosition = originalName.indexOf(".");
    // console.log(indexPosition);
    let nameWithNoExtension = originalName.substring(0, indexPosition);
    // console.log(nameWithNoExtension); 

    cb(
      null,
      `${nameWithNoExtension}${path.extname(
        // - ${Date.now()}
        file.originalname
      )}`
    );
  },
});

// validate the extension
const imageFilter = (req: any, file: any, cb: any) => {
  if (file) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, .jpeg format allowed !"));
    }
  }
};

let UPLOAD = multer({ storage: STORAGE , fileFilter: imageFilter});

// Router
app.get("/", (req: any, res: any) => {
  setTimeout(() => {
    res.download(path.join(__dirname, "output.pdf"));
    
  }, 1000);
//  res.send('hello world');
});

app.post("/multiple", UPLOAD.array("file", 50), (req: any, res: any) => {
  let imageFolder = path.join(__dirname, "upload");
  new ImagesToPDF().convertFolderToPDF(imageFolder, "output.pdf");
  setTimeout(() => {
    fs.readdir(imageFolder, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(imageFolder, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }, 2000);
  setTimeout(() => {
    res.download(path.join(__dirname, "output.pdf"));
  }, 500);
});


// SINGLE IMAGE 
app.post('/single', UPLOAD.single('file'),(req:any, res:any)=>{
  let imageFolder = path.join(__dirname, "upload");
  new ImagesToPDF().convertFolderToPDF(imageFolder, "output.pdf");
  setTimeout(() => {
    fs.readdir(imageFolder, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(imageFolder, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }, 2000);
  setTimeout(() => {
    res.download(path.join(__dirname, "output.pdf"));
  }, 500);

})

// another library
app.post("/pdfkit", UPLOAD.array("file", 10), (req: any, res: any) => {
  doc.pipe(fs.createWriteStream("pdfkit.pdf"));
  fileArray = req.files;
  if (fileArray) {
    doc.image(fileArray[0].path, {
      fit: [500, 900],
      align: "center",
      valign: "center",
    });

    for (let i = 1; i < fileArray.length; i++)
      doc.addPage().image(fileArray[i].path, {
        fit: [500, 900],
        align: "center",
        valign: "center",
      });
    doc.end();
  }

  // REMOVE IMAGES FROM FOLDR
  let imageFolder = path.join(__dirname, "upload");
  setTimeout(() => {
    fs.readdir(imageFolder, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(imageFolder, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }, 2000);

  //  _____________________________________________

  // let imageFolder = path.join(__dirname, "upload");

  // fs.readdir(imageFolder, (err, files) => {
  //   if (err) throw err;

  //   // for (const file of files) {
  //     console.log(files, 'another block')
  //     doc.image(path.join(__dirname,'upload/'+ files[0]), {
  //           fit: [500, 900],
  //           align: "center",
  //           valign: "center",
  //     });

  //     for (let i = 1; i < files.length; i++)
  //   doc.addPage()
  //   .image(path.join(__dirname,'upload/'+ files[i]), {
  //     fit: [500, 900],
  //     align: "center",
  //     valign: "center",
  //   });
  //   doc.end();
  //   // }
  // });
  // ___________________________________

  res.status(200).send("done");
});











// PDF TO IMAGE 
app.post('/pdf2img', UPLOAD.array('file', 50), (req:any, res:any)=>{
  fileArray = req.files;
  if(fileArray){
    fileArray.forEach((res:any)=>{
      pdfToImage.convert(res.path).then((outPut)=>{
        for (let i = 0; i < outPut.length; i++)
        fs.writeFile(
          path.join(__dirname,'download/'+ "output"+i+".png"),
           outPut[i]
        , (error)=> {
          if (error) { console.error("Error: " + error); }
        });
      });
    });


    fs.readdir(path.join(__dirname,'download'), (err, files) => {
     console.log(typeof(files))
     for( var i = 0; i < files.length; i++);
     console.log(i);
    // console.log(path.join(__dirname,'download/' + files[]));
     setTimeout(()=>{
      res.download(path.join(__dirname,'download/' + files[0]), path.join(__dirname,'download/' + files[1]));
     },1000)
    });
    // res.send('converted successfully');
  }
  

    
});






app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



//CORS = cross origin resource sharing