function onWindowResize( event ) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    target.x = targetOnDown.x + ( mouse.x - mouseOnDown.x ) * 0.005;
    target.y = targetOnDown.y + ( mouse.y - mouseOnDown.y ) * 0.005;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;

}



function onDocumentMouseUp( event ) {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    container.style.cursor = 'auto';

}

function onDocumentMouseOut( event ) {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}
function onDocumentMouseWheel( event ) {

    distanceTarget -= event.wheelDeltaY * 0.3;

    distanceTarget = distanceTarget > 1500 ? 1500 : distanceTarget;
    distanceTarget = distanceTarget < 300 ? 300 : distanceTarget;
}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouseVector.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouseVector.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVector, camera);

    var intersects = raycaster.intersectObjects([earth]);

    if (intersects.length > 0) {

        var latlng = getEventCenter.call(intersects[0], event);

        var locationData = data;
        var pressedObject = getPressedLocation(latlng, locationData);
        if (pressedObject != null) {
            performLocationPress(pressedObject);
            // panToLocation(latlng);

            updateProjectInfo(pressedObject);
        }
    }

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseOnDown.x = -event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    container.style.cursor = 'move';
}


function getPressedLocation(pressLoc, locationData) {

    var pressRadius = 5;

    for(var i = 0; i < locationData.length; i++) {
        var location = locationData[i];
        var locPos = [location["latLong"]["lat"], location["latLong"]["long"]];

        if (isPointInRange(pressLoc, locPos, pressRadius)) {
            return(location);
        }
    }
    return(null);
}


function isPointInRange(clickPos, locationPos, radius) {

    var xDist = clickPos[0] - locationPos[0];
    var yDist = clickPos[1] - locationPos[1];

    var dist = Math.sqrt(xDist * xDist + yDist * yDist);
    return(dist < radius);
}

function performLocationPress(pressedObject) {
    console.log("Pressed location:", pressedObject);
}

// function panToLocation(latlng) {
//
//     // Get pointc, convert to latitude/longitude
//     // var latlng = getEventCenter.call(this, event);
//
//     // Get new camera position
//     var temp = new THREE.Mesh();
//     temp.position.copy(convertToXYZ(latlng, 900));
//     temp.lookAt(root.position);
//     temp.rotateY(Math.PI);
//
//     for (let key in temp.rotation) {
//         if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
//             temp.rotation[key] -= Math.PI * 2;
//         } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
//             temp.rotation[key] += Math.PI * 2;
//         }
//     }
//
//     var tweenPos = getTween.call(camera, 'position', temp.position);
//     d3.timer(tweenPos);
//
//     var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
//     d3.timer(tweenRot);
// }

function getPoint(event) {

    // Get the vertices
    // console.log(this)
    let a = this.geometry.vertices[event.face.a];
    let b = this.geometry.vertices[event.face.b];
    let c = this.geometry.vertices[event.face.c];

    // Averge them together
    let point = {
        x: (a.x + b.x + c.x) / 3,
        y: (a.y + b.y + c.y) / 3,
        z: (a.z + b.z + c.z) / 3
    };

    return point;
}

function getEventCenter(event, radius) {
    radius = radius || 200;

    var point = this.point;

    var latRads = Math.acos(point.y / radius);
    var lngRads = Math.atan2(point.z, point.x);
    var lat = (Math.PI / 2 - latRads) * (180 / Math.PI);
    var lng = (Math.PI - lngRads) * (180 / Math.PI);

    return [lat, lng - 180];
}
