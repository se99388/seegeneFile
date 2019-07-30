
const fs = require("fs");
const csvParser = require('csv-parser');
const csv = require('fast-csv');
const path = require('path');
const notifier = require('node-notifier');


//here you define the file + directory for the temp file and the archive file + dir
const tempDIr = './TEMPֹ_FILE/';
const stiFileName = "./ARCHIVE_SEEGENE_FILES/STI_archive_file.csv";
const giFileName = "./ARCHIVE_SEEGENE_FILES/GI_archive_file.csv";
let count = 0;

fs.watch(tempDIr, (eventType, filename) => {
    const pathDirAndFile = path.join(tempDIr, filename);
    // i'm using count because fs.watch fires 3 times when i add file to this dir = 1-rename + 2-change
    console.log("count", count)
    if (eventType == 'change') {
        count += 1;
        if (count == 2) {
            if (!fileValidation(filename, splitLength = 4)){
                removeFile(pathDirAndFile, filename);
                displayNotification('hylabs-notification-Error',"The file:" + filename + ", hasn't the correct pattern");
                count=0;
                return false;
            }
            console.log(eventType);

            let allData = [];
            let fileNameObj = {};
            let responseFile;

           

            //function that get the file name and return parsed object
            fileNameObj = parseFileToObject(filename);

            //read the .csv file and parse it by ","
            fs.createReadStream(pathDirAndFile)
                .pipe(csvParser())
                .on('error', error => console.error(error))
                .on('data', row => allData.push(row))
                .on('end', () => {

                    //after finish to read all content and after stored it in "allData" array
                    const firstObjInAllData = allData[0];
                    //checking if it is "STI" file or "GI" file
                    for (let key in firstObjInAllData) {
                        if (firstObjInAllData[key].match(/STI/)) {
                            console.log("yes-STI", firstObjInAllData[key]);
                            //write the content in allData array in the archive file
                            writeToFIle(allData, stiFileName, fileNameObj);
                            responseFile = stiFileName;
                        }
                        if (firstObjInAllData[key].match(/GI/)) {
                            console.log("yes-GI", firstObjInAllData[key]);
                            //write the content in allData array in the archive file
                            writeToFIle(allData, giFileName, fileNameObj);
                            responseFile = giFileName;
                        }
                    }
                    console.log({ message: "The file:\n" + pathDirAndFile + ",\n \n uploaded to: \n" + responseFile });
                    // windows notification
                    displayNotification('hylabs-notification',"The file:" + pathDirAndFile + ", uploaded to: " + responseFile);
                });
                removeFile(pathDirAndFile, filename);
                count = 0;
        }
    }

});

  // windows notification
function displayNotification(title, message){
    notifier.notify({
        title: title,
        message: message
    });
}


function removeFile(pathDirAndFile, filename){
    fs.unlink(pathDirAndFile, (err) => {
        if (err) throw err;
        console.log(filename + " was deleted");
    });
}


function parseFileToObject(fileName) {
    let fileNameObj = {};
    const pathFile = path.parse(fileName);

    //split the name by  "_" and put the results in fileNameObj object
    fileNameObj.starletNum = pathFile.name.split(/_/)[0];
    fileNameObj.runningBarcode = pathFile.name.split(/_/)[1];
    fileNameObj.date = pathFile.name.split(/_/)[2];
    fileNameObj.cfxNum = nameFunction();
    // fileNameObj.cfxNum =  pathFile.name.split(/_/)[3].split(/\s-\s/)[0];

    function nameFunction() {
        if (pathFile.name.split(/_/)[3]) {
            return pathFile.name.split(/_/)[3].split(/\s-\s/)[0];
        }
        return "null";
    }
    console.log("fileNameObj:", fileNameObj);
    return fileNameObj
}

//write to archive file fucntion
async function writeToFIle(allData, archiveFile, fileNameObj) {
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
        console.log("Err", e)
    }
}

function fileValidation(filename, splitLength){
    const fileToValidate = path.parse(filename);
    if ((fileToValidate.ext === '.csv') && (fileToValidate.name.split(/_/).length === splitLength)){
        return true;
    }
    return false;
}


