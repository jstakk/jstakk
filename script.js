// Three.js variabler
let scene, camera, renderer;
let squareMeshes = []; // Array for å holde referanser til firkant-meshes
const totalSquares = 60;
const numCols = 10;
const numRows = totalSquares / numCols; // Blir 6
const squareSize = 0.8; // Størrelse på hver firkant
const squareSpacing = 0.2; // Avstand mellom firkanter
const gridColorHex = 0x444444; // Mørk grå for inaktive/bakgrunnsruter (litt lysere)
const activeColorHex = 0xffffff; // Hvit for aktive ruter


// Kube-relaterte variabler og funksjoner er fjernet

function getRandomColor() { // Beholder denne.
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

function interpolateColor(color1, color2, factor) { // Beholder denne for klokken, eller hvis landskapet trenger den.
    const r = Math.round(color1.r + (color2.r - color1.r) * factor);
    const g = Math.round(color1.g + (color2.g - color1.g) * factor);
    const b = Math.round(color1.b + (color2.b - color1.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
}

let clockColor = { r: 100, g: 100, b: 200 }; // Startfarge for klokken
let targetClockColor = getRandomColor();
let lastColorChangeMinuteForClock = new Date().getMinutes();

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    const clockElement = document.getElementById('clock');

    if (clockElement) {
        clockElement.textContent = timeString;

        // Fargeendringslogikk kun for klokken
        if (now.getMinutes() !== lastColorChangeMinuteForClock) {
            clockColor = { ...targetClockColor };
            targetClockColor = getRandomColor();
            lastColorChangeMinuteForClock = now.getMinutes();
        }
        const secondsIntoColorMinute = now.getSeconds() + (now.getMilliseconds() / 1000);
        const colorFactor = secondsIntoColorMinute / 60;
        const interpolatedRgbString = interpolateColor(clockColor, targetClockColor, colorFactor);
        clockElement.style.color = interpolatedRgbString; // Sett fargen på klokken
    }
}

// --- Three.js Initialisering ---
function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222222); // Samme som body background

    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    const gridGroup = new THREE.Group();
    const totalGridWidth = numCols * squareSize + (numCols - 1) * squareSpacing;
    const totalGridHeight = numRows * squareSize + (numRows - 1) * squareSpacing;
    const startX = -totalGridWidth / 2 + squareSize / 2;
    const startY = totalGridHeight / 2 - squareSize / 2;

    for (let i = 0; i < totalSquares; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;

        const x = startX + col * (squareSize + squareSpacing);
        const y = startY - row * (squareSize + squareSpacing);

        const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
        const material = new THREE.MeshBasicMaterial({ color: gridColorHex });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(x, y, 0);

        gridGroup.add(square);
        squareMeshes.push(square); // Lagre referanse
    }
    scene.add(gridGroup);

    // Juster kameraets Z-posisjon for å se hele rutenettet
    // Dette er en enkel heuristikk, kan trenge finjustering
    const fov = camera.fov * (Math.PI / 180);
    const largerDimension = Math.max(totalGridWidth, totalGridHeight);
    camera.position.z = (largerDimension / 2) / Math.tan(fov / 2) + 5; // +5 for litt padding


    window.addEventListener('resize', onWindowResize, false);
}

// Fjerner hele funksjonen createGridSegment
// function createGridSegment(zOffset) { ... }


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Main Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Fjerner all tidligere landskapsbevegelse og logikk for å legge til/fjerne segmenter

    // Oppdater farger på rutenettet basert på sekunder
    const now = new Date();
    const seconds = now.getSeconds();

    for (let i = 0; i < totalSquares; i++) {
        if (squareMeshes[i]) { // Sjekk om meshen eksisterer
            if (i < seconds) {
                squareMeshes[i].material.color.setHex(activeColorHex);
            } else {
                squareMeshes[i].material.color.setHex(gridColorHex);
            }
        }
    }

    renderer.render(scene, camera);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    updateClock(); // Initial call for clock setup
    requestAnimationFrame(animate); // Start animasjonsløkken
});

setInterval(updateClock, 100); // Oppdater klokken regelmessig
