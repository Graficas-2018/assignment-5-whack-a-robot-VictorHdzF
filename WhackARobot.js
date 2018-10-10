var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var radius = 100, theta = 0;
var robot_idle;
var robot_mixer = {};
var deadAnimator;
var robots = [];
var currentTime = Date.now();
var animation = "idle";
var score = 0;
var timer = 0;
var start = false;
var reset = null;
var count = 0;
var last = 7;

function DeadAnimation(object)
{
    animator2 = new KF.KeyFrameAnimator;
    animator2.init({ 
        interps: [
            {
                keys: [0, 0.5, 1, 1.5],
                values: [
                    {z: 0},
                    {x: 0, z: -2},
                    {x: 0, z: 0},
                ],
                target: object.rotation
            }
            ],
        loop: false,
        duration: 800,
    });
    animator2.start();
}

function UpAnimation(object, animator)
{
    if (!object)
        return;
    //duration = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
    if (!animator)
        animator = new KF.KeyFrameAnimator;
    var zpos = object.position.z;
    animator.init({ 
        interps: [
            {
                keys: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
                values: [
                    {z: zpos},
                    {z: zpos + 5},
                    {z: zpos + 15},
                    {z: zpos + 15},
                    {z: zpos + 15},
                    {z: zpos + 15},
                    {z: zpos + 5},
                    {z: zpos},
                ],
                target: object.position
            }
            ],
        loop: false,
        duration:100,
    });
    animator.start();
}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( 'Robot/robot_run.fbx', function ( object ) 
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.035, 0.035, 0.035);
        object.rotation.set(0, 0, 0);
        object.position.set(-110, 18, -115);
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );

        robot_idle = object;
        //robot_idle = "robot_idle";
        group.add( robot_idle );
              
        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();

        loader.load( 'Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        });

        var robot = cloneFbx(robot_idle);
        //robot.name="Robot";
        robot.position.set(0, 18, -115);
        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot).play();
        //robot_mixer["attack"].clipAction( object.animations[ 0 ], robot).play();
        group.add( robot );

        console.log(robot_idle);

        var robot2 = cloneFbx(object);
        //robot2.name="Robot2";
        robot2.position.set(110, 18, -115);
        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot2).play();
        //robot_mixer["attack"].clipAction( object.animations[ 0 ], robot2 ).play();
        group.add( robot2 );

        var robot3 = cloneFbx(object);
        //robot3.name="Robot3";
        robot3.position.set(-102, -40, -115);
        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot3).play();
        //robot_mixer["attack"].clipAction( object.animations[ 0 ], robot3 ).play();
        group.add( robot3 );

        var robot4 = cloneFbx(object);
        //robot4.name="Robot4";
        robot4.position.set(0, -40, -115);
        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot4).play();
        //robot_mixer["attack"].clipAction( object.animations[ 0 ], robot4 ).play();
        group.add( robot4 );

        var robot5 = cloneFbx(object);
        //robot5.name="Robot5";
        robot5.position.set(102, -40, -115);
        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot5).play();
        //robot_mixer["attack"].clipAction( object.animations[ 0 ], robot5 ).play();
        group.add( robot5 );

        robots.push(robot_idle);
        robots.push(robot);
        robots.push(robot2);
        robots.push(robot3);
        robots.push(robot4);
        robots.push(robot5);
    });
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 500 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    group = new THREE.Object3D;
    scene.add(group);
    
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 100 );
    scene.add( light );

    loadFBX();

    var geometry = new THREE.CircleGeometry( 25, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00000} );
    var circle1 = new THREE.Mesh( geometry, material );
    circle1.position.set(-100, 30, -100)
    scene.add( circle1 );
    var circle2 = new THREE.Mesh( geometry, material );
    circle2.position.set(0, 30, -100)
    scene.add( circle2 );
    var circle3 = new THREE.Mesh( geometry, material );
    circle3.position.set(100, 30, -100)
    scene.add( circle3 );
    var circle4 = new THREE.Mesh( geometry, material );
    circle4.position.set(-100, -30, -100)
    scene.add( circle4 );
    var circle5 = new THREE.Mesh( geometry, material );
    circle5.position.set(0, -30, -100)
    scene.add( circle5 );
    var circle6 = new THREE.Mesh( geometry, material );
    circle6.position.set(100, -30, -100)
    scene.add( circle6 );
    
    raycaster = new THREE.Raycaster();
   
    timer = Date.now() + 30000;
    score_l = $("#score");
    time = $("#time");
    reset = $("#reset");
        
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    window.addEventListener( 'resize', onWindowResize);

}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( group.children, true );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[0].object;
        DeadAnimation(CLICKED);
        score += 10;
        score_l.text("Score:" + score);
    } 

}

function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    if(robot_idle && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat*0.001);
        KF.update();
    }

    UpAnimation(robot_idle);

    /*rand = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
    count += 1;

    if (count > 200 && rand != last){
        console.log(rand);
        UpAnimation(robots[rand]);
        count = 0;
        last = rand;
    }
    if (rand == last)
        last = 7;
    */
    time.text("Time:" + Math.round((timer - now)/1000));

    if (Date.now() >= timer)
    {
        //return;
    }
}