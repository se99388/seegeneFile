const path = require('path');
const fs = require('fs');

const removeFile = filePath => {
    fs.unlink(filePath, err => {
        if (err) throw err;
        console.log(path.basename(filePath) + ' was deleted');
    });
};

// C161_996557606 admin_2019-06-12 10-53-50_BR101723 -  Quantitation Ct Results.csv
const parseFileToObject = fileName => {
    const pathFile = path.parse(fileName);

    const parts = pathFile.name.split('_');
    const [starletNum, runningBarcode, date, cfxNumLong] = parts;
    const cfxNum = cfxNumLong.replace(/[ -].*/g, '');

    return {
        starletNum,
        runningBarcode,
        date,
        cfxNum,
    };
};

const writeToFile = (allData, archiveFile, fileNameObj) => {
    try {
        const ws = fs.createWriteStream(archiveFile, {flags: 'a'});
        ws.write('\n');
        for (key in fileNameObj) {
            ws.write(fileNameObj[key] + ',' + key + '\n');
        }
        csv.write(allData, {headers: true}).pipe(ws);
    } catch (e) {
        console.log('Err', e);
    }
};

const fileValidation = (filename, splitLength) => {
    const fileToValidate = path.parse(filename);
    if (
        fileToValidate.ext === '.csv' &&
        fileToValidate.name.split(/_/).length === splitLength
    ) {
        return true;
    }
    return false;
};

module.exports = {
    removeFile,
    parseFileToObject,
    fileValidation,
    writeToFile,
};
