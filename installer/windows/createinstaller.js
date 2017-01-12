const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
     .then(createWindowsInstaller)
     .catch((error) => {
     console.error(error.message || error)
     process.exit(1)
 })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds')

    return Promise.resolve({
       appDirectory: path.join('file://'+__dirname+'/CPF-ID-win32-x64/'),
       authors: 'Mohammad khodari',
       noMsi: true,
       outputDirectory: path.join(outPath, 'windows-installer'),
       exe: 'CPFID.exe',
       setupExe: 'CPFIDInstaller.exe'
   })
}