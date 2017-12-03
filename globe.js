  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
  };


//plotData();

var container, stats;
var camera, scene, sceneAtmosphere, renderer;
var vector, mesh, atmosphere, point, points, pointsGeometry, earth;

var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
var rotation = { x: 0, y: 0 }, incr_rotation = { x: -0.001, y: 0 };
var target = { x: 0, y: 0 }, targetOnDown = { x: 0, y: 0 };
var distance = 1500;
var distanceTarget = 900;

var segments = 155; // number of vertices. Higher = better mouse accuracy

var PI_HALF = Math.PI / 2;

var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector2();

var locationObjects = [];
var pointLights = [];

var rotateEnabled = true;

var currentlyActiveProjectIndex;

container = document.getElementById( 'container' );

init();
plotData();
animate();

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 1, 10000 );

	var geometry = new THREE.SphereGeometry(200, 50, 40);

	shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);


	var texture   = new THREE.TextureLoader().load('images/night.jpg')
	material = new THREE.ShaderMaterial({  
	  uniforms: {"texture": { type: "t", value: texture }},
	  vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
      //lights: true
	});

	var ballMat = new THREE.MeshStandardMaterial( {
					color: 0xffffff,
					roughness: 0.8,
					metalness: 0.05
				});
	ballMat.map = new THREE.TextureLoader().load( "images/night.jpg");
	ballMat.needsUpdate = true;

	var material = new THREE.MeshPhongMaterial();

    //material.specular = new THREE.Color('grey'),
    material.shininess =  0.00

    material.map = new THREE.TextureLoader().load( "images/night.jpg");
    material.normalMap = new THREE.TextureLoader().load( "images/EarthNormal.png");
    //material.specularMap = new THREE.TextureLoader().load( 'images/EarthSpec.png');
    material.normalScale.set(3,3)
	material.needsUpdate = true;
	earth = new THREE.Mesh( geometry, material );
	scene.add( earth );

	shader = Shaders['atmosphere'];
	uniforms = THREE.UniformsUtils.clone(shader.uniforms);

	material = new THREE.ShaderMaterial({
	    uniforms: uniforms,
	    vertexShader: shader.vertexShader,
	    fragmentShader: shader.fragmentShader,
	    side: THREE.BackSide,
	    blending: THREE.AdditiveBlending,
	    transparent: true

	});

	mesh = new THREE.Mesh(geometry, material);
	mesh.scale.set( 1.1, 1.1, 1.1 );
	scene.add(mesh);

	var light = new THREE.AmbientLight( 0x909090, 1 ); // soft white light
	scene.add( light );

	pointsGeometry = new THREE.Geometry();

	camera.position.z = distanceTarget;

	loadSetupFromURL();

	renderer = new THREE.WebGLRenderer(  { alpha: true }  );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function loadSetupFromURL() {

    var url = new URL(window.location);
    var rotationX = url.searchParams.get("x");
    var rotationY = url.searchParams.get("y");
    var shareLoc = url.searchParams.get("project");

    if (rotationX != null && rotationY != null && shareLoc != null) {
        rotation.x = parseFloat(rotationX);
        rotation.y = parseFloat(rotationY);
		target.x = rotation.x;
		target.y = rotation.y;
		currentlyActiveProjectIndex = parseInt(shareLoc);
		rotateEnabled = false;

		updateProjectInfo(data[currentlyActiveProjectIndex])
	}
	else {
    	console.log("No recorded rotation!");
    	emptyProjectInfo();
	}
}

function animate() {

	requestAnimationFrame( animate );
	render();
}


function randomRgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

function plotData() {

	var lat, lng, size, color;

	var color = 0xffffff;
    // points = new THREE.Mesh( pointsGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } ) );

    var pointMaterial = new THREE.MeshBasicMaterial( { color: color, vertexColors: THREE.FaceColors } )

    pointMaterial.transparent = true;
    pointMaterial.opacity = 0.8

    points = new THREE.Mesh(pointsGeometry, pointMaterial);

    for (var i = 0, l = data.length; i < l; i++) {

		lat = data[i]["latLong"]["lat"];
		lng = data[i]["latLong"]["long"];
		color = new THREE.Color();
		color.setHSL( ( 0.6 - ( size * 1.6 ) ), 1.0, 1.0 ); // column color

		let point = addPoint(lat, lng, 7, color); // column size
		locationObjects.push(point);
	}

    scene.add(points);
}

function addPoint(lat, lng, size, color) {

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (0 - lng) * Math.PI / 180;

    var radius = 0.3;
    var height = 0.5;
    var segments = 10;

    // geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
	geometry = new THREE.CylinderGeometry(radius, radius, height, 20, 10, false);
	geometry.rotateX(Math.PI / 2);

    for (var i = 0; i < geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        vertex.z += 0.5;
    }

    point = new THREE.Mesh(geometry);

    var globeRadius = 200;

    // position
	point.position.x = globeRadius * Math.sin(phi) * Math.cos(theta);
	point.position.y = globeRadius * Math.cos(phi);
	point.position.z = globeRadius * Math.sin(phi) * Math.sin(theta);

	var light = new THREE.PointLight( 0xffffff, 6, 50, 1 );
	light.position.set( 215 * Math.sin(phi) * Math.cos(theta),
	  215 * Math.cos(phi), 215 * Math.sin(phi) * Math.sin(theta));
	scene.add( light );
    pointLights.push(light);

	// rotation
	point.lookAt(earth.position);

	// scaling
	point.scale.x = size;
    point.scale.y = size;
    point.scale.z = -size * 0.2;
	point.updateMatrix();

	// color
	for (var i = 0; i < point.geometry.faces.length; i++) {
		point.geometry.faces[i].color = color;
	}

	pointsGeometry.merge(point.geometry, point.matrix);

	return(point);
}

function render() {

	if (rotateEnabled) {
        target.x += incr_rotation.x;
        target.y += incr_rotation.y;
	}

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

function updateProjectInfo(locationEntry) {

	var title = locationEntry["title"];
	var tags = locationEntry["focus"];
	tags = '#' + tags.map(function(d){return d.replace(/ /g, '-')}).join(' #')
	var location_name = locationEntry["country"];
	var startTime = locationEntry["startDate"];
	var endTime = locationEntry["endDate"];
	var pageURL = locationEntry["url"];
    // title, tags, location_name, startTime, endTime, page_url

    $("#project-title").text(title);
    $("#project-tags").text(tags);
    $("#project-location").text(location_name);
    $("#project-time").text(startTime + " " + endTime);
    $("#project-page").html("<a href=\"" + pageURL + "\">Project Page</a>");

    $("#share-buttons").show();
    $("#share-url").show();
}

function emptyProjectInfo() {
    $("#project-title").text("");
    $("#project-tags").text("");
    $("#project-location").text("");
    $("#project-time").text("");
    $("#project-page").html("");
    $("#share-buttons").hide();
    $("#share-url").hide();
}

function makePositionURL() {

	console.log("makePositionURL");

	// ?client=ubuntu&channel=fs&q=j
    // var url = new URL(window.location);
    var url = window.location.href.split('?')[0].split('#')[0];

    console.log(url.href);
    console.log("Camera rotation:", rotation.x, rotation.y);

    var url_string = url + "?x=" + rotation.x + "&y=" + rotation.y + "&project=" + currentlyActiveProjectIndex;
	console.log(url_string);

	$("#share-url").html("<a href=\"" + url_string + "\">Share link</a>");
    // $("#share-url").text(url_string);

}
