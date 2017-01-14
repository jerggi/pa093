var electron = require('electron');

electron.app.on('ready', function () {
  var mainWindow = new electron.BrowserWindow({width: 1600, height: 1000});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
});
