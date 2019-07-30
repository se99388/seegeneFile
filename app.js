const fs = require('fs');
const csvParser = require('csv-parser');
const csv = require('fast-csv');
const path = require('path');
const io = require('./util/io');
const notification = require('./util/notification');
const config = require('config');

const tempDir = config.get('tempDir');
//here you define the file + directory for the temp file and the archive file + dir
const stiFileName = path.resolve(tempDir, 'STI_archive_file.csv');
const giFileName = path.resolve(
    config.get('seegeneFilesDir'),
    'GI_archive_file.csv',
);
let count = 0;

fs.watch(tempDir, (eventType, filename) => {
    const pathDirAndFile = path.join(tempDir, filename);
    // i'm using count because fs.watch fires 3 times when i add file to this dir = 1-rename + 2-change
    console.log('count', count);
    if (eventType == 'change') {
        count += 1;
        if (count == 2) {
            if (!io.fileValidation(filename, (splitLength = 4))) {
                io.removeFile(pathDirAndFile);
                notification.displayNotification(
                    'hylabs-notification-Error',
                    'The file:' + filename + ", hasn't the correct pattern",
                );
                count = 0;
                return false;
            }
            console.log(eventType);

            let allData = [];
            let fileNameObj = {};
            let responseFile;

            //function that get the file name and return parsed object
            fileNameObj = io.parseFileToObject(filename);

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
                            console.log('yes-STI', firstObjInAllData[key]);
                            //write the content in allData array in the archive file
                            io.writeToFile(allData, stiFileName, fileNameObj);
                            responseFile = stiFileName;
                        }
                        if (firstObjInAllData[key].match(/GI/)) {
                            console.log('yes-GI', firstObjInAllData[key]);
                            //write the content in allData array in the archive file
                            io.writeToFile(allData, giFileName, fileNameObj);
                            responseFile = giFileName;
                        }
                    }
                    console.log({
                        message:
                            'The file:\n' +
                            pathDirAndFile +
                            ',\n \n uploaded to: \n' +
                            responseFile,
                    });

                    const message = `The file:${pathDirAndFile}, uploaded to ${responseFile}`;
                    // windows notification
                    notification.displayNotification(
                        'hylabs-notification',
                        message,
                    );
                });
            io.removeFile(pathDirAndFile);
            count = 0;
        }
    }
});
