


//plotData();

var container, stats;
var camera, scene, sceneAtmosphere, renderer;
var vector, mesh, atmosphere, point, points, pointsGeometry, earth;

var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
var rotation = { x: 0, y: 0 }, target = { x: 0, y: 0 }, targetOnDown = { x: 0, y: 0 };
var distance = 1500;
var distanceTarget = 900;

var segments = 155; // number of vertices. Higher = better mouse accuracy

var PI_HALF = Math.PI / 2;

var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector2();

container = document.getElementById( 'container' );

init();
plotData();
animate();

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 1, 10000 );

	var geometry = new THREE.SphereGeometry(200, 40, 30);

	material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

	material.map    = new THREE.TextureLoader().load('world.jpg')
	earth = new THREE.Mesh( geometry, material );
	scene.add( earth );

	var wireMaterial  = new THREE.MeshPhongMaterial({wireframe: true, transparent: true});
	var wireFrame = new THREE.Mesh(new THREE.SphereGeometry(201, segments, segments), wireMaterial);
	wireFrame.rotation.y = Math.PI;
	scene.add(wireFrame)

	pointsGeometry = new THREE.Geometry();

	camera.position.z = distanceTarget;

	renderer = new THREE.WebGLRenderer( /* { antialias: false } */ );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	//document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function animate() {

	requestAnimationFrame( animate );
	render();
}


function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

function plotData() {

	var lat, lng, size, color;

	var color = random_rgba();
    // points = new THREE.Mesh( pointsGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } ) );

	for (var i = 0, l = data.length; i < l; i++) {

		lat = data[i][1];
		lng = data[i][2];
		size = data[i][0];
		color = new THREE.Color();
		color.setHSL( ( 0.6 - ( size * 1.6 ) ), 1.0, 1.0 ); //column color

		addPoint(lat, lng, size * 200, color); //column size
	}

    points = new THREE.Mesh(pointsGeometry, new THREE.MeshBasicMaterial( { color: color, vertexColors: THREE.FaceColors } ));

    scene.add(points);
}

function addPoint(lat, lng, size, color) {

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (0 - lng) * Math.PI / 180;

    geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
    for (var i = 0; i < geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        vertex.z += 0.5;
    }

    point = new THREE.Mesh(geometry);

    // position
	point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
	point.position.y = 200 * Math.cos(phi);
	point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

	// rotation
	point.lookAt(earth.position);

	// scaling
    point.scale.z = -size;
	point.updateMatrix();

	// color
	for (var i = 0; i < point.geometry.faces.length; i++) {
		point.geometry.faces[i].color = color;
	}

	pointsGeometry.merge(point.geometry, point.matrix);
}

function render() {

	rotation.x += ( target.x - rotation.x ) * 0.05;

	rotation.y += ( target.y - rotation.y ) * 0.05;
	distance += ( distanceTarget - distance ) * 0.05;

	camera.position.x = distance * Math.sin( rotation.x ) * Math.cos( rotation.y );
	camera.position.y = distance * Math.sin( rotation.y );
	camera.position.z = distance * Math.cos( rotation.x ) * Math.cos( rotation.y );

	camera.lookAt(0, 0, 0);

	/*
	// Do not render if camera hasn't moved.

	if ( vector.distanceTo( camera.position ) == 0 ) {
		return;
	}

	vector.copy( camera.position );
	*/

	renderer.clear();
	renderer.render( scene, camera );
	//renderer.render( sceneAtmosphere, camera );
}

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

function onDocumentMouseDown( event ) {

	event.preventDefault();

	mouseVector.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouseVector.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouseVector, camera );

    var intersects = raycaster.intersectObjects( scene.children ); 

    if ( intersects.length > 0 ) {

        
		var latlng = getEventCenter.call(intersects[0], event);
		console.log(latlng)
    }

	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseOnDown.x = - event.clientX;
	mouseOnDown.y = event.clientY;

	targetOnDown.x = target.x;
	targetOnDown.y = target.y;

	container.style.cursor = 'move';

}

function getPoint(event) {

  // Get the vertices
  console.log(this)
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
