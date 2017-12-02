var Shaders = {

	'earth' : {

		uniforms: {

			"texture": { type: "t", value: 0, texture: null }

		},

		vertexShader: [

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"vNormal = normalize( normalMatrix * normal );",
				"vUv = uv;",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D texture;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"void main() {",

				"vec3 diffuse = texture2D( texture, vUv ).xyz;",
				"float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );",
				"vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );",

				"gl_FragColor = vec4( diffuse + atmosphere, 1.0 );",

			"}"

		].join("\n")

	},

	'atmosphere' : {

		uniforms: {},

		vertexShader: [

			"varying vec3 vNormal;",

			"void main() {",

				"vNormal = normalize( normalMatrix * normal );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"varying vec3 vNormal;",

			"void main() {",

				"float intensity = pow( 0.8 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 12.0 );",
				"gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;",

			"}"

		].join("\n")

	}

};


init();
//plotData();

var cube, renderer, scene, camera;

//var distance = 1500, distanceTarget = 900;


function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var geometry = new THREE.SphereGeometry( 200, 40, 30 );
	var shader = Shaders[ 'earth' ];
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	//var material  = new THREE.MeshPhongMaterial({ color: 0x00ff00 } )
	material = new THREE.MeshBasicMaterial( { color: 0x999999 } );
	/*
        uniforms['texture'].texture = new THREE.TextureLoader().load('world.jpg')

        material = new THREE.RawShaderMaterial({

            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        });
	*/
	material.map    = new THREE.TextureLoader().load('world.jpg')
	cube = new THREE.Mesh( geometry, material );
	scene.add( cube );
	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light )
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

	camera.position.z = 650;
}
var animate = function () {
	requestAnimationFrame( animate );

	//cube.rotation.x += 0.1;
	cube.rotation.y += 0.02;

	renderer.render(scene, camera);
};
animate();