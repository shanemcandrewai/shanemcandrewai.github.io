import * as THREE from 'three';
// import * as THREE from './three.module.js'; //to avoid importmap, works but eslint gives error

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1b1c3b, 0.1, 30);
scene.background = new THREE.Color(0x5fffff);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// const renderer = new THREE.WebGLRenderer({ alpha: true });
const renderer = new THREE.WebGLRenderer({ antialias: true });
class CustomSinCurve extends THREE.Curve {
  constructor(scale = 1) {
    super();

    this.scale = scale;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const tx = t * 3 - 1.5;
    // const ty = Math.sin(2 * Math.PI * t);
    const ty = 1;
    const tz = 0;

    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}

const path = new CustomSinCurve(10);
const geometry = new THREE.TubeGeometry(path, 20, 2, 16, false);
const material = new THREE.MeshBasicMaterial({
  color: 0xf0ff00,
  transparent: true,
  opacity: 0.5,
});

const mat1 = new THREE.MeshLambertMaterial({ transparent: true });
const mat2 = new THREE.MeshLambertMaterial({ color: 0xdddddd });
const mat3 = new THREE.MeshPhongMaterial({
  color: 0xdddddd, specular: 0x009900, shininess: 30, flatShading: true,
});
const mat4 = new THREE.MeshNormalMaterial();
const mat42 = new THREE.MeshDepthMaterial({ color: 0x666666, emissive: 0xff0000 });
const mat5 = new THREE.MeshLambertMaterial({ color: 0xdddddd });
const mat6 = new THREE.MeshPhongMaterial({
  color: 0xdddddd, specular: 0x009900, shininess: 30, transparent: true,
});
const mat7 = new THREE.MeshNormalMaterial({ flatShading: true });
const mat8 = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
const mat9 = new THREE.MeshDepthMaterial();
const mat10 = new THREE.MeshLambertMaterial({ color: 0x666666, emissive: 0xff0000 });
const mat11 = new THREE.MeshPhongMaterial({
  color: 0x000000,
  specular: 0x666666,
  emissive: 0xff0000,
  shininess: 10,
  opacity: 0.9,
  transparent: true,
});
const mat12 = new THREE.MeshBasicMaterial({ transparent: true });

const mesh = new THREE.Mesh(geometry, mat42);
scene.add(mesh);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 20;
function animate() {
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
