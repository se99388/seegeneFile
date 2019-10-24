const io = require('./util/io');
const fs = require("fs");
const csvParser = require('csv-parser');
const csv = require('fast-csv');
const path = require('path');
const notification = require('./util/notification');
const config = require('config');

console.log("this project is running");
//here you define the file + directory for the temp file and the archive file + dir
const tempDIr = config.get('tempDIr');
const stiFileName = config.get('stiFileName');
const giFileName = config.get('giFileName');

//the debounce because the fs.watch's evenType fires several times
const debounce = () => {
    let timeoutId;
    return (tempDIr, filename) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            // console.log('working')
            executeProject(tempDIr, filename)
        }, 1000);

    }
}
const timeoutFunction = debounce();

fs.watch(tempDIr, (eventType, filename) => {
   
    console.log( eventType)
    if (eventType == 'change') {
        timeoutFunction(tempDIr, filename);
    }

});



const executeProject = (tempDIr, filename) => {
    const pathDirAndFile = path.join(tempDIr, filename);

        if (!io.fileValidation(filename, splitLength = 4)) {
            io.removeFile(pathDirAndFile, filename);
            notification.displayNotification('hylabs-notification-Error', "The file:" + filename + ", hasn't the correct pattern");
            return false;
        }

        let allData = [];
        let fileNameObj = {};
        let responseFile;

        //function that get the file name and return parsed object
        fileNameObj = io.parseFileToObject(filename);

        //read the .csv file and parse it by ","
        fs.createReadStream(pathDirAndFile)
            .pipe(csvParser())
            .on('error', error => { console.error(error) })
            .on('data', row => allData.push(row))
            .on('end', () => {
                //after finish to read all content and after stored it in "allData" array
                const firstObjInAllData = allData[0];
                //checking if it is "STI" file or "GI" file
                for (let key in firstObjInAllData) {
                    if (firstObjInAllData[key].match(/STI/)) {
                        console.log("yes-STI", firstObjInAllData[key]);
                        //write the content in allData array in the archive file
                        io.writeToFIle(allData, stiFileName, fileNameObj);
                        responseFile = stiFileName;
                    }
                    if (firstObjInAllData[key].match(/GI/)) {
                        console.log("yes-GI", firstObjInAllData[key]);
                        //write the content in allData array in the archive file
                        io.writeToFIle(allData, giFileName, fileNameObj);
                        responseFile = giFileName;
                    }
                }
                console.log({ message: "The file:\n" + pathDirAndFile + ",\n \n uploaded to: \n" + responseFile });
                // windows notification
                notification.displayNotification('hylabs-notification', "The file:" + pathDirAndFile + ", uploaded to: " + responseFile);
            });
        io.removeFile(pathDirAndFile, filename);
    
}




