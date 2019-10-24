const fs = require("fs");
const path = require('path');
const notification = require('./notification');
const csv = require('fast-csv');

const removeFile = (pathDirAndFile, filename) => {
    fs.unlink(pathDirAndFile, (err) => {
        if (err) throw err;
        console.log(filename + " was deleted");
    });
}

const fileValidation = (filename, splitLength) => {
    const fileToValidate = path.parse(filename);
    if ((fileToValidate.ext === '.csv') && (fileToValidate.name.split(/_/).length === splitLength)) {
        return true;
    }
    return false;
}

const parseFileToObject = (fileName) => {
    const pathFile = path.parse(fileName);
    const parts = pathFile.name.split(/_/);
    const [starletNum, runningBarcode, date, cfxNumLong] = parts;
    const cfxNum = cfxNumLong.replace(/[ -].*/g, "")
    return {
        starletNum, runningBarcode, date, cfxNum
    }
}

//write to archive file fucntion
 const writeToFIle = async (allData, archiveFile, fileNameObj)=> {
    try {
        const ws = fs.createWriteStream(archiveFile, { flags: 'a' });
        ws.write('\n');
        for (key in fileNameObj) {
            ws.write(fileNameObj[key] + "," + key + "\n");
        }
        await csv
            .write(allData
                , { headers: true })
            .pipe(ws);
    }
    catch (e) {
        console.log("Err", e);
        notification.displayNotification('hylabs-notification', 'Error! the archive file locked or open');
        return false;
    }
}

module.exports = {
    removeFile,
    fileValidation,
    parseFileToObject,
    writeToFIle
}
