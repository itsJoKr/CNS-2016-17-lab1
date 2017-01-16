'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, insertWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

function createWindow () {
    // Create the browser window.
    var browserOptions = { 
        width: 800, 
        height: 800, 
        frame: true, 
        show: false, 
        fullscreen: false
    };
    
    mainWindow = new BrowserWindow(browserOptions);	

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.show();	
    
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

ipc.on('toggle-insert-view', function(event, arg) {
    if(!insertWindow) {
        passwordInsertWindow(mainWindow);
    }    
    return (insertWindow.isVisible()) ? insertWindow.destroy() : insertWindow.show();
});

ipc.on('loadAsymmKeys', function(event, arg) { 
    if (insertWindow.isVisible()) {
        insertWindow.destroy();    
    }    
    mainWindow.webContents.send('loadAsymmKeys', arg); // forward to the mainWindow (app.js)
});

ipc.on('asymmKeysLoaded', function(event, arg) {
    mainWindow.webContents.send('asymmKeysLoaded', arg); // forward to the mainWindow (app.js)
});

ipc.on('alert', function(event, arg) {
    mainWindow.webContents.send('alert', arg); // forward alert to the mainWindow (app.js)
});

function passwordInsertWindow(mainWindow) {
    insertWindow = new BrowserWindow({
        width: 500,
        height: 300,
        show: false,
        alwaysOnTop: true,
        resizable: false,
        frame: false,
        skipTaskbar: true           
    });
    
    insertWindow.loadURL('file://' + __dirname + '/view/password.html');

    // Centering the main window.    
    var posMain = mainWindow.getPosition(),
        sizeMain = mainWindow.getSize(),
        posThis = insertWindow.getPosition(),
        sizeThis = insertWindow.getSize();
    
    var x = posMain[0] + (sizeMain[0]-sizeThis[0])/2,
        y = posMain[1] + (sizeMain[1]-sizeThis[1])/2;
    
    insertWindow.setPosition(Math.round(x), Math.round(y));    
                         
    insertWindow.on('closed',function() {
        insertWindow = null;
    });
}