var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var radius = 100, theta = 0;
var robot_idle;

var robot_mixer = {};
var deadAnimator;
var morphs = [];

var duration = 20000; // ms
var currentTime = Date.now();

var animator = null,
duration = 2, // sec
loopAnimation = false;

var animation = "idle";

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( 'Robot/robot_run.fbx', function ( object ) 
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.05, 0.05, 0.05);
        object.rotation.set(0, 0, 0);
        object.position.set(0, 0, -100);
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );

        robot_idle = object;
        scene.add( robot_idle );
              
        createDeadAnimation();

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();

        loader.load( 'Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
    } );
}

function initAnimations() 
{
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, .5, 1], 
                    values:[
                            { y : 0 },
                            { y : Math.PI  },
                            { y : Math.PI * 2 },
                            ],
                },
            ],
        loop: loopAnimation,
        duration:duration * 1000,
    });
}

function playAnimations()
{
    animator.start();
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 500 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 100 );
    scene.add( light );

    loadFBX();
    
   /*var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    
    for ( var i = 0; i < 10; i ++ ) 
    {
        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
        
        object.name = 'Cube' + i;
        object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200);
        
        scene.add( object );
    }*/
    
    raycaster = new THREE.Raycaster();
        
    document.addEventListener( 'mousemove', onDocumentMouseMove );
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    window.addEventListener( 'resize', onWindowResize);

    initAnimations();
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) 
    {
        if ( INTERSECTED != intersects[ 0 ].object ) 
        {
            if ( INTERSECTED )
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ 0 ].object;
        CLICKED.material.emissive.setHex( 0x00ff00 );

        if(!animator.running)
        {
            for(var i = 0; i<= animator.interps.length -1; i++)
            {
                animator.interps[i].target = CLICKED.rotation;
            }
            playAnimations();
        }
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    if(robot_idle && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat);
    }

    if(animation =="dead")
    {
        KF.update();
    }
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
    animate();
    KF.update();
}