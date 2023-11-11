# WebXR Game Template

This is a Vite-powered Three.js project with WebXR capabilities.

## Index

- [Objective](#objective)
- [Motivation](#motivation)
-	Getting started
	- [Installation](#installation)
	- [Run the project](#run-the-project)
- [Deploy](#deploy)
- [Contribution](#contribution)

## Objective

The objective of this project is to make a WebXR ready Template with Three.js, that is aimed for making VR games.

The idea is to have pre-built tools for making levels, scenes and objects to start fast a VR Game project that runs on the web.

## Motivation

Why? Why WebXR? Why not a native engine like Unity, or Unreal?

Because I have an Oculus GO (yes, pretty old) but I can't seem to find a way to make a proper game with the other engines that still support this device.

So my first platform on which I will test this project on, is the Oculus GO.

## Instalation

Clone this template and run the command:
```
npm install
```

## Run the project

Run the next command:

```
npm run dev -- --host
```
This command will start a **https** server that will host the project.

You can launch it from your browser through the **localhost** url, or from another WebXR capable device's browser that's connected on the same local network.

**Note:** *If you try to connect to the server from another local device, the browser will show a warning about the connection not being safe, and it recommends you to step back. This is fine. In the same page, you can select "Advanced options" and "Enter anyways".*

## Deploy

To make a production build, you need to run the next command:
```
npm run build
```
This will generate a "dist" folder at the root of the project. This is the folder that will need to be uploaded to the production environment.

You can use Github Pages, Itch.io or Netlify to test the deployed project.

## Contribution

Any suggestions are welcome.

If you want to suggest a change, you can fork this project, and make a Pull Request.
