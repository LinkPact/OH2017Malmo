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

    console.log("onDocumentMouseDown");

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

    // var point = locationObjects[0];
    // var color = new THREE.Color();
    // color.setRGB(0.2, 0.5, 0.2);
    // console.log(point);
    // for (var i = 0; i < point.geometry.faces.length; i++) {
    //     point.geometry.faces[i].color = color;
    // }
    // addPoint(pressLoc[0], pressLoc[1], 100, color);

    var pressRadius = 5;

    for(var i = 0; i < locationData.length; i++) {
        var location = locationData[i];
        var locPos = [location[1], location[2]];

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
    console.log("Pressed location:", pressedObject)
}

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
