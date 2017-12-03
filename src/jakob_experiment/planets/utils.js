function latLongToVector3(lat, lon, radius, heigth) {

    let phi = (lat) * Math.PI / 180;
    let theta = (lon - 180) * Math.PI / 180;

    let x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta);
    let y = (radius + heigth) * Math.sin(phi);
    let z = (radius + heigth) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}


// function addDensity(data) {
//
//     // the geometry that will contain all our cubes
//     let geom = new THREE.Geometry();
//     // material to use for each of our elements. Could use a set of materials to
//     // add colors relative to the density. Not done here.
//     let cubeMat = new THREE.MeshLambertMaterial({color: 0x000000, opacity:0.6, emissive:0xffffff});
//     for (let i = 0; i < data.length - 1; i++) {
//
//         //get the data, and set the offset, we need to do this since the x,y coordinates
//         //from the data aren't in the correct format
//         let x = parseInt(data[i][0]) + 180;
//         let y = parseInt((data[i][1]) - 84) * -1;
//         let value = parseFloat(data[i][2]);
//
//         // calculate the position where we need to start the cube
//         let position = latLongToVector3(y, x, 600, 2);
//
//         // create the cube
//         let cube = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 1 + value / 8, 1, 1, 1, cubeMat));
//
//         // position the cube correctly
//         cube.position = position;
//         cube.lookAt(new THREE.Vector3(0, 0, 0));
//
//         // merge with main model
//         THREE.GeometryUtils.merge(geom, cube);
//     }
//
//     // create a new mesh, containing all the other meshes.
//     let total = new THREE.Mesh(geom, new THREE.MeshFaceMaterial());
//
//     // and add the total mesh to the scene
//     scene.add(total);
// }


// xhr.onreadystatechange = function(e) {
//     if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//             var data = [];
//             data = JSON.parse(xhr.responseText);
//             window.data = data;
//             globe.clearData();
//             globe.addData(data);
//             globe.createPoints();
//             globe.animate();
//             document.getElementById('load').innerHTML = ' ';
//         }
//     }
// };

// colorFn = function(x) {
//         var c = new THREE.Color();
//         if (x==0.0) {
//             c.setHSV( ( 0.6 - ( x * 0.5 ) ), 0, 0 );
//         } else {
//             c.setHSV( ( 0.6 - ( x * 0.5 ) ), 1.0, 1.0 );
//         }
//         return c;
//     };


addData = function(data, opts) {

    var lat, lng, size, color, i;

    var subgeo = new THREE.Geometry();
    for (i = 0; i < data.length; i += 3) {
        lat = data[i];
        lng = data[i + 1];
        color = new THREE.Color();
        color.setRGB(1, 0, 0);
        // color = colorFn(data[i+2]);
        size = 0; // data[i + 2]; // CHANGED
        addPoint(lat, lng, size, color, subgeo);
    }
    this._baseGeometry = subgeo;

};


function createPoints() {
    if (this._baseGeometry !== undefined) {
        let points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            vertexColors: THREE.FaceColors,
            morphTargets: false
        }));
        scene.addObject(points);
    }
}

function addPoint(lat, lng, size, color, subgeo) {

    console.log(lat, lng, size, color, subgeo);

    let point = new THREE.Mesh(geometry);

    let phi = (90 - lat) * Math.PI / 180;
    let theta = (180 - lng) * Math.PI / 180;

    point.position.x = 1 * Math.sin(phi) * Math.cos(theta);
    point.position.y = 1 * Math.cos(phi);
    point.position.z = 1 * Math.sin(phi) * Math.sin(theta);

    point.lookAt(mesh.position);

    point.scale.z = -size;
    point.updateMatrix();
    let i;

    for (i = 0; i < point.geometry.faces.length; i++) {

        point.geometry.faces[i].color = color;

    }

    THREE.GeometryUtils.merge(subgeo, point);
    // geometry.merge( geometry2, matrix, materialIndexOffset )
}