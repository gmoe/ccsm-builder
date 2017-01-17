const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let server
let browserWindow

app.on('ready', () => {
  server = require('http-server').createServer('build/')
  browserWindow = new BrowserWindow({width: 1200, height: 800})

  browserWindow.loadURL('http://localhost:8080/')

  browserWindow.on('closed', () => {
    browserWindow = null
  })
})

app.on('window-all-closed', () => {
  server.close()
	app.quit()
})
