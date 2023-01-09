import * as THREE from 'three';
import { FlyControls } from 'FlyControls';

const getRandomInt = (min, max) => {
  // The maximum is exclusive and the minimum is inclusive
  const ceilmin = Math.ceil(min);
  return Math.floor(Math.random() * (Math.floor(max) - ceilmin) + ceilmin);
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);
scene.fog = new THREE.Fog(0x002000, 1, 7);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new FlyControls(camera, renderer.domElement);
const clock = new THREE.Clock();

controls.movementSpeed = 1000;
controls.domElement = renderer.domElement;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = false;

const mg = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });

const curve90 = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(1, 1, 0),
);

const g1 = new THREE.TubeGeometry(curve90, 64, 0.1, 16, false);
const mxp = new THREE.Mesh(g1, mg);
const gra = new THREE.Group();

for (let level = 0; level < 2; level += 1) {
  // const par = ge tRandomInt(nodes);
  for (let xpos = -level; xpos <= level; xpos += 1) {
    for (let zpos = -level; zpos <= level; zpos += 1) {
      if (Math.abs(xpos) + Math.abs(zpos) <= level) {
        for (let direction = 0; direction < 4; direction += 1) {
          const m = mxp.clone();
          m.rotateY(Math.PI * 0.5 * direction);
          m.position.set(xpos, level, zpos);
          gra.add(m);
        }
      }
    }
  }
}

scene.add(gra);

gra.rotateY(Math.PI * 0.10);
function animate() {
  requestAnimationFrame(animate);

  // gra.rotation.y += 0.01;
  controls.movementSpeed = 1;
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

animate();
