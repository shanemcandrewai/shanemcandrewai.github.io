import * as THREE from 'three';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x008800, 1, 8);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

class CustomSinCurve extends THREE.Curve {
  constructor(scale = 1) {
    super();

    this.scale = scale;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    // const tx = t * 3 - 1.5;
    const tx = t ;
    // const ty = Math.sin(2 * Math.PI * t);
    const ty = t;
    const tz = -t;

    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}

const path = new CustomSinCurve(4);
const tubegeo = new THREE.TubeGeometry(path, 64, 1, 32, true);
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const tubemesh = new THREE.Mesh(tubegeo, material);
scene.add(tubemesh);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  // tubemesh.rotation.x += 0.01;
  // tubemesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
