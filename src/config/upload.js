const multer = require('multer');
const path = require("path");

module.exports = {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, "..", "..", "files"),
        filename: (req, file, cb) => {
            const ext  = path.extname(file.originalname)
            const name = path.basename(file.originalname, ext)

            //cb(null, 'abcd1234')  // replace space
            cb(null, name + Date.now() + '.jpg')
            //cb(null, '${name.replace(/\s/g, "")}-${(Date.now()}${ext}')  // replace space
        }
    })
}