const path = require('path');

const tempDIr = path.resolve(__dirname, '..', 'TEMPֹ_FILE/');
const archiveDir = path.resolve(__dirname, '..', 'ARCHIVE_SEEGENE_FILES');
const stiFileName = path.resolve(archiveDir, 'STI_archive_file.csv');
const giFileName = path.resolve(archiveDir, 'GI_archive_file.csv');

module.exports = {
    tempDIr,
    archiveDir,
    stiFileName,
    giFileName
}
