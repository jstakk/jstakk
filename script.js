const cubeElement = document.querySelector('.cube');
const cubeContainer = document.querySelector('.cube-container'); // For movement

let currentFaces = [];
let currentColor = { r: 100, g: 100, b: 200 };
let targetColor = getRandomColor();
let lastShapeChangeMinute = new Date().getMinutes();
let lastColorChangeMinute = new Date().getMinutes(); // Corrected variable name

const s = 100; // size parameter

const polyhedra = {
    cube: {
        faceTransforms: [
            `rotateY(0deg) translateZ(${s}px)`, `rotateY(180deg) translateZ(${s}px)`,
            `rotateY(90deg) translateZ(${s}px)`, `rotateY(-90deg) translateZ(${s}px)`,
            `rotateX(90deg) translateZ(${s}px)`, `rotateX(-90deg) translateZ(${s}px)`
        ],
        numSides: 6
    },
    pseudoTetrahedron: {
        faceTransforms: [
            `translateZ(${s * 0.5}px) rotate3d(1, -1, 0, 55deg) rotate3d(0,0,1,45deg) `,
            `translateZ(${s * 0.5}px) rotate3d(1, 1, 0, 55deg) rotate3d(0,0,1,-45deg)`,
            `translateZ(-${s * 0.2}px) rotate3d(1,0,0, 125deg) translateY(${s*0.3}px)`,
            `rotateX(-70deg) translateZ(${s * 0.3}px) translateY(${s*0.5}px) scale(0.9) rotateZ(180deg)`
        ],
        numSides: 4
    },
    diamond: {
        faceTransforms: [
            `translateY(-${s*0.35}px) translateZ(${s*0.35}px) rotateX(45deg)`,
            `translateX(${s*0.35}px) translateY(-${s*0.35}px) rotateY(-45deg) rotateX(45deg)`,
            `translateY(-${s*0.35}px) translateZ(-${s*0.35}px) rotateX(-45deg) rotateY(180deg)`,
            `translateX(-${s*0.35}px) translateY(-${s*0.35}px) rotateY(45deg) rotateX(45deg)`,
            `translateY(${s*0.35}px) translateZ(${s*0.35}px) rotateX(-45deg)`,
            `translateX(${s*0.35}px) translateY(${s*0.35}px) rotateY(-45deg) rotateX(-45deg)`,
            `translateY(${s*0.35}px) translateZ(-${s*0.35}px) rotateX(45deg) rotateY(180deg)`,
            `translateX(-${s*0.35}px) translateY(${s*0.35}px) rotateY(45deg) rotateX(-45deg)`,
        ].map(transform => `${transform} scale(0.7)`),
        numSides: 8
    }
};

const polyhedronKeys = Object.keys(polyhedra);
let currentPolyhedronIndex = 0;
let targetPolyhedronIndex = 0;

let transitioningShape = false;
let transitionProgress = 0;

// --- Movement Variables ---
let containerWidth = 200; // Default from CSS, matches .cube-container width/height
let containerHeight = 200;
let position = { x: 0, y: 0 };
let velocity = { dx: 0, dy: 0 };
const MOVEMENT_SPEED = 1.5; // Adjust speed as needed

function getRandomColor() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

function interpolateColor(color1, color2, factor) {
    const r = Math.round(color1.r + (color2.r - color1.r) * factor);
    const g = Math.round(color1.g + (color2.g - color1.g) * factor);
    const b = Math.round(color1.b + (color2.b - color1.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
}

function generatePolyhedronFaces(polyhedronKey, opacity = 0.7) {
    const newFaces = [];
    const polyhedron = polyhedra[polyhedronKey];
    if (!polyhedron || !polyhedron.faceTransforms) {
        console.error("Polyhedron not found or misconfigured:", polyhedronKey);
        return [];
    }
    const baseColor = interpolateColor(currentColor, targetColor, (new Date().getSeconds() + new Date().getMilliseconds()/1000)/60);

    polyhedron.faceTransforms.forEach(transform => {
        const face = document.createElement('div');
        face.classList.add('face');
        face.style.transform = transform;
        face.style.backgroundColor = baseColor;
        face.style.opacity = opacity.toFixed(2);
        cubeElement.appendChild(face);
        newFaces.push(face);
    });
    return newFaces;
}

function manageShapeChange() {
    const now = new Date();
    const currentMinute = now.getMinutes();

    if (currentMinute !== lastShapeChangeMinute && !transitioningShape) {
        lastShapeChangeMinute = currentMinute;
        transitioningShape = true;
        transitionProgress = 0;
        let newPolyhedronIndex;
        if (polyhedronKeys.length <= 1) {
            newPolyhedronIndex = 0;
        } else {
            do {
                newPolyhedronIndex = Math.floor(Math.random() * polyhedronKeys.length);
            } while (newPolyhedronIndex === currentPolyhedronIndex);
        }
        targetPolyhedronIndex = newPolyhedronIndex;
    }

    if (transitioningShape) {
        const secondsIntoMinute = now.getSeconds() + (now.getMilliseconds() / 1000);
        transitionProgress = secondsIntoMinute / 60;
        const FADE_DURATION_RATIO = 0.1; // 10% of minute to fade out, 10% to fade in

        if (transitionProgress < FADE_DURATION_RATIO && currentFaces.length > 0) {
            const fadeOutFactor = 1 - (transitionProgress / FADE_DURATION_RATIO);
            currentFaces.forEach(face => face.style.opacity = Math.max(0, fadeOutFactor * 0.7).toFixed(2));
        } else if (transitionProgress >= FADE_DURATION_RATIO) {
            if (currentPolyhedronIndex !== targetPolyhedronIndex || (currentFaces.length === 0 && cubeElement.children.length === 0)) {
                currentFaces.forEach(face => face.remove());
                currentFaces = [];
                currentPolyhedronIndex = targetPolyhedronIndex;
                const newPolyhedronKey = polyhedronKeys[currentPolyhedronIndex];
                currentFaces = generatePolyhedronFaces(newPolyhedronKey, 0); // Start transparent
            }
            const fadeInProgress = Math.min(1, (transitionProgress - FADE_DURATION_RATIO) / FADE_DURATION_RATIO);
            if (fadeInProgress >= 0) {
                currentFaces.forEach(face => face.style.opacity = Math.min(0.7, fadeInProgress * 0.7).toFixed(2));
            }
            if (transitionProgress >= FADE_DURATION_RATIO * 2 || fadeInProgress >= 1) {
                transitioningShape = false;
                currentFaces.forEach(face => face.style.opacity = 0.7);
            }
        }
    } else if (currentFaces.length === 0 && cubeElement.children.length === 0) {
        const initialKey = polyhedronKeys[currentPolyhedronIndex];
        currentFaces = generatePolyhedronFaces(initialKey, 0.7);
    }
}

function updateClockAndCube() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    const clockElement = document.getElementById('clock');
    if (clockElement) clockElement.textContent = timeString;

    manageShapeChange();

    if (now.getMinutes() !== lastColorChangeMinute) { // Corrected variable
        currentColor = { ...targetColor };
        targetColor = getRandomColor();
        lastColorChangeMinute = now.getMinutes(); // Corrected variable
    }
    const secondsIntoColorMinute = now.getSeconds() + (now.getMilliseconds() / 1000);
    const colorFactor = secondsIntoColorMinute / 60;
    const interpolatedRgbString = interpolateColor(currentColor, targetColor, colorFactor);

    currentFaces.forEach(face => { // Corrected array
        face.style.backgroundColor = interpolatedRgbString;
        if (!transitioningShape && face.style.opacity !== '0.7') {
             // Let manageShapeChange finalize opacity to avoid conflicts
        }
    });
}

// --- Movement Initialization and Update ---
function initializeMovement() {
    if (!cubeContainer) return;
    containerWidth = cubeContainer.offsetWidth || 200;
    containerHeight = cubeContainer.offsetHeight || 200;

    position.x = window.innerWidth / 2 - containerWidth / 2;
    position.y = window.innerHeight / 2 - containerHeight / 2;
    cubeContainer.style.left = `${position.x}px`;
    cubeContainer.style.top = `${position.y}px`;

    const angle = Math.random() * 2 * Math.PI;
    velocity.dx = Math.cos(angle);
    velocity.dy = Math.sin(angle);
}

function getRandomDirection() {
    const angle = Math.random() * 2 * Math.PI;
    velocity.dx = Math.cos(angle);
    velocity.dy = Math.sin(angle);
}

function updateMovement() {
    if (!cubeContainer) return;

    position.x += velocity.dx * MOVEMENT_SPEED;
    position.y += velocity.dy * MOVEMENT_SPEED;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let collision = false;
    if (position.x < 0) {
        position.x = 0;
        collision = true;
    } else if (position.x + containerWidth > screenWidth) {
        position.x = screenWidth - containerWidth;
        collision = true;
    }
    if (position.y < 0) {
        position.y = 0;
        collision = true;
    } else if (position.y + containerHeight > screenHeight) {
        position.y = screenHeight - containerHeight;
        collision = true;
    }

    if (collision) {
        getRandomDirection();
    }

    cubeContainer.style.left = `${position.x}px`;
    cubeContainer.style.top = `${position.y}px`;
}

window.addEventListener('resize', () => {
    if (!cubeContainer) return;
    containerWidth = cubeContainer.offsetWidth || 200;
    containerHeight = cubeContainer.offsetHeight || 200;
    position.x = Math.max(0, Math.min(position.x, window.innerWidth - containerWidth));
    position.y = Math.max(0, Math.min(position.y, window.innerHeight - containerHeight));
    // Update style if clamping changed position, or if re-centering.
    // initializeMovement(); // Option: re-center on resize
});

// --- Main Animation Loop ---
let rotationState = { x: 0, y: 0 };

function animate() { // Renamed from animateCube
    const now = new Date();
    const totalSecondsSinceEpoch = now.getTime() / 1000;

    rotationState.y = (totalSecondsSinceEpoch * 36) % 360;
    rotationState.x = (totalSecondsSinceEpoch * 18) % 360;
    if (cubeElement) {
        cubeElement.style.transform = `translateZ(-${s}px) rotateY(${rotationState.y}deg) rotateX(${rotationState.x}deg)`;
    }

    updateMovement();
    requestAnimationFrame(animate);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initializeMovement();
    updateClockAndCube(); // Initial call for clock and shape setup
    requestAnimationFrame(animate);
});

setInterval(updateClockAndCube, 100); // Update clock/shape/color logic more frequently
