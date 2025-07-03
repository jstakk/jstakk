function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to display clock immediately
updateClock();

// Three.js setup
let scene, camera, renderer, polyhedron;
let targetShapeVertices = null;
let morphStartTime = null;
const morphDuration = 1000; // 1 second for morphing animation

// Polyhedron movement variables
let polyhedronVelocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    0 // No Z movement for now, keep it planar
);
const polyhedronSpeed = 0.03; // Constant speed

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('polyhedronCanvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight); // Attach point light to camera
    scene.add(camera); // Ensure camera (with light) is part of the scene

    createPolyhedron();

    camera.position.z = 5;

    animate();
    setInterval(changeShape, 60000); // Change shape every minute
}

function getRandomPolyhedronGeometry() {
    // Max 21 faces means max 19 for detail in Three.js (since PolyhedronGeometry uses detail parameter)
    // For IcosahedronGeometry, detail 0 gives 20 faces.
    // For DodecahedronGeometry, detail 0 gives 12 faces.
    // Let's try to create something more varied.
    // A Dodecahedron has 12 faces. An Icosahedron has 20 faces.
    // We can use PolyhedronGeometry for more complex shapes, but it requires vertices and indices.
    // For simplicity in generating "random faces up to 21", let's pick between a few standard ones
    // or use a sphere with low polygon count to simulate this.
    // Using Icosahedron with varying detail can give us 20*(4^detail) faces. So detail 0 = 20 faces.
    // Using Dodecahedron gives 12 faces.
    // Tetrahedron: 4 faces
    // Octahedron: 8 faces
    // BoxGeometry: 6 faces

    const type = Math.floor(Math.random() * 5);
    let geometry;
    let faces;

    switch (type) {
        case 0:
            geometry = new THREE.TetrahedronGeometry(1.5); // 4 faces
            faces = 4;
            break;
        case 1:
            geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // 6 faces
            faces = 6;
            break;
        case 2:
            geometry = new THREE.OctahedronGeometry(1.5); // 8 faces
            faces = 8;
            break;
        case 3:
            geometry = new THREE.DodecahedronGeometry(1.5); // 12 faces
            faces = 12;
            break;
        case 4:
        default:
            // IcosahedronGeometry with detail 0 has 20 faces.
            // Max faces requested is 21. This is the closest standard geometry.
            geometry = new THREE.IcosahedronGeometry(1.5, 0); // 20 faces
            faces = 20;
            break;
    }
    console.log(`New shape: ${faces} faces`);
    return geometry;
}


function createPolyhedron() {
    if (polyhedron) {
        scene.remove(polyhedron);
        polyhedron.geometry.dispose();
        polyhedron.material.dispose();
    }

    const geometry = getRandomPolyhedronGeometry();
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00, // Green color for visibility
        wireframe: true,
        metalness: 0.5,
        roughness: 0.5
    });
    polyhedron = new THREE.Mesh(geometry, material);
    scene.add(polyhedron);
}

function changeShape() {
    console.log("Changing shape...");
    const newGeometry = getRandomPolyhedronGeometry();
    targetShapeVertices = newGeometry.attributes.position.array;
    // Ensure the current geometry is non-indexed or handle indexed geometries appropriately
    // For simplicity, we'll assume current and target geometries have same vertex count for morphing
    // This is a simplification. Proper morphing between arbitrary geometries is complex.
    // A better approach might be to cross-fade or use geometries that are designed to be morphed.

    // If vertex counts differ, just swap to the new geometry without smooth morphing for now.
    if (polyhedron.geometry.attributes.position.array.length !== targetShapeVertices.length) {
        console.warn("Vertex count mismatch, swapping geometry directly without morphing.");
        scene.remove(polyhedron);
        polyhedron.geometry.dispose(); // Dispose old geometry
        polyhedron.material.dispose(); // Dispose old material (if not reused)

        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            wireframe: true,
            metalness: 0.5,
            roughness: 0.5
        });
        polyhedron = new THREE.Mesh(newGeometry, material);
        scene.add(polyhedron);
        targetShapeVertices = null; // Reset target
        return;
    }

    morphStartTime = Date.now();
}

function animate() {
    requestAnimationFrame(animate);

    if (polyhedron) {
        polyhedron.rotation.x += 0.005;
        polyhedron.rotation.y += 0.005;

        // Movement logic
        polyhedron.position.add(polyhedronVelocity);

        // Boundary check and reflection
        // Calculate visible width/height at polyhedron's depth (camera.position.z - polyhedron.position.z)
        // Assuming polyhedron stays roughly at z=0 for now relative to camera at z=5
        const vFOV = THREE.MathUtils.degToRad(camera.fov); // Vertical FOV in radians
        const height = 2 * Math.tan(vFOV / 2) * camera.position.z; // Visible height at z=0
        const width = height * camera.aspect;

        const bounds = {
            x: width / 2,
            y: height / 2
        };

        // Adjust bounds based on polyhedron size (approximate)
        const polyhedronSize = 1.5; // Should ideally get this from geometry bounding box
        const effectiveBoundsX = bounds.x - polyhedronSize / 2;
        const effectiveBoundsY = bounds.y - polyhedronSize / 2;

        let collision = false;
        if (polyhedron.position.x > effectiveBoundsX || polyhedron.position.x < -effectiveBoundsX) {
            polyhedronVelocity.x *= -1;
            polyhedron.position.x = Math.max(-effectiveBoundsX, Math.min(effectiveBoundsX, polyhedron.position.x)); // Clamp position
            collision = true;
        }
        if (polyhedron.position.y > effectiveBoundsY || polyhedron.position.y < -effectiveBoundsY) {
            polyhedronVelocity.y *= -1;
            polyhedron.position.y = Math.max(-effectiveBoundsY, Math.min(effectiveBoundsY, polyhedron.position.y)); // Clamp position
            collision = true;
        }

        if (collision) {
            // Assign new random direction, but maintain current reflection logic for simplicity
            // For a truly random new direction after collision:
            const randomAngle = Math.random() * Math.PI * 2;
            polyhedronVelocity.x = Math.cos(randomAngle) * polyhedronSpeed;
            polyhedronVelocity.y = Math.sin(randomAngle) * polyhedronSpeed;
            // Ensure it moves away from the edge it hit
            if (polyhedron.position.x >= effectiveBoundsX && polyhedronVelocity.x > 0) polyhedronVelocity.x *= -1;
            if (polyhedron.position.x <= -effectiveBoundsX && polyhedronVelocity.x < 0) polyhedronVelocity.x *= -1;
            if (polyhedron.position.y >= effectiveBoundsY && polyhedronVelocity.y > 0) polyhedronVelocity.y *= -1;
            if (polyhedron.position.y <= -effectiveBoundsY && polyhedronVelocity.y < 0) polyhedronVelocity.y *= -1;
        }


        // Morphing logic
        if (targetShapeVertices && morphStartTime) {
            const elapsedTime = Date.now() - morphStartTime;
            let progress = elapsedTime / morphDuration;
            if (progress >= 1) {
                progress = 1;
                // Ensure final shape is exactly the target
                polyhedron.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(targetShapeVertices), 3));
                targetShapeVertices = null;
                morphStartTime = null;
                console.log("Morph complete.");
            } else {
                const currentVertices = polyhedron.geometry.attributes.position.array;
                const newVertices = new Float32Array(currentVertices.length);
                for (let i = 0; i < currentVertices.length; i++) {
                    newVertices[i] = currentVertices[i] + (targetShapeVertices[i] - currentVertices[i]) * progress;
                }
                polyhedron.geometry.setAttribute('position', new THREE.BufferAttribute(newVertices, 3));
                polyhedron.geometry.attributes.position.needsUpdate = true;
            }
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Initialize 3D content when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3D);
} else {
    init3D();
}
