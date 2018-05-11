## Setup

To run, you need the Python library Flask installed. If you have pip - the
Python package manager installed, you can install Flask by:

```
pip install Flask
```

Then, you are ready to start a local server to serve the program to your browser.
Do this by switching directory into `src` (where the code is), and start the
server.

```
cd src
python3 -m http.server 8000
```

You should now be able to view the globe by navigating to a browser and opening
the address: `127.0.0.1:8000`

## Central libraries

The program makes extensive use of the Javascript Three.js 3D library:

https://threejs.org/

## Program structure

The main code is residing within the `src` directory. The entry point is `index.html`,
and the bulk of the actual javascript code controlling the globe resides in the
`globe.js` file. 

### The data

The data with coordinates and information about the points are stored in the
`src/js/data.js` file. Here, each entry contains information about a particular site.
The `latLong` part is the central used to locate it on the globe. Other than that,
most of the information is used when displaying information by clicking the centers.

If you want to add or remove information from the globe, the easiest way is probably
to make a copy of this, and then edit the `data.js` file directly. You could also likely
relatively easily setup a parser converting your data to this JSON format.

### The globe.js file

The code is somewhat unorganized hackathon code, but roughly
follows the outline:

* Shaders, which are used for visual effects
* Variable setup
* Initialization function calls `init(); plotData(); and animate();`
* The `init()` function which:
    * Initializes scene, camera, shaders, mesh and materials
    * Creates a renderer
    * Adds event listeners allowing mouse interactions
* `loadSetupFromURL` is special function allowing starting looking at certain position
    based on parameters received from URL
* `plotData()` assign new dot to the map based on data read from JSON file
* `addPoint()` called by `plotData()` and is used to do the actual point generation, adding it to the geometry, and returning a reference to the point
* `render()` update the view (camera and automatic rotation of the globe)
* `updateProjectInfo()` updates information by retrieving data from JSON file containing information
    about the particular datapoint
* `emptyProjectInfo()` clears out the fields so that no data is shown
* `makePositionURL()` used to generate URL which can be used to view particular site

## Debugging

If something goes wrong, you can often get hits about it by navigating to the browser terminal.
In Chrome, you can easily open this by pressing F12.

## Resources

Sample code based on: https://newnaw.com/pub/js/webglglobe/worldelevation/

