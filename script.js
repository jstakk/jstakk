// Three.js variabler
let scene, camera, renderer;
let squareMeshes = []; // Array for å holde referanser til firkant-meshes
// const totalSquares = 60; // Blir dynamisk basert på numCols og numVisibleRows
const numCols = 60; // Endret til 60 kolonner
const numVisibleRows = 20; // Antall rader synlig på skjermen samtidig (juster etter behov)
const squareSize = 0.8; // Størrelse på hver firkant
const squareSpacing = 0.2; // Avstand mellom firkanter
const gridColorHex = 0x444444; // Mørk grå for inaktive/bakgrunnsruter
const activeColorHex = 0xffffff; // Hvit for aktive ruter

const totalSquaresInView = numCols * numVisibleRows;
let gridGroup; // Gruppe for å holde alle ruter, for enkel bevegelse
const rowHeight = squareSize + squareSpacing; // Total height of a row including spacing
const scrollSpeed = 0.02; // Hastighet på nedover-scrollingen, juster etter behov
let lastSecond = -1; // Holder styr på forrige sekund for å vite når en ny rad skal fargelegges
let currentRowIndex = 0; // Holder styr på hvilken "logisk" rad som er øverst


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

    camera.position.y = 0; // Juster y for å se "ned" på rutenettet
    camera.lookAt(0, 0, 0);

    gridGroup = new THREE.Group(); // Initialiser global gridGroup
    const totalGridWidth = numCols * squareSize + (numCols - 1) * squareSpacing;
    // totalGridHeight blir dynamisk, men vi trenger startposisjon for de første radene
    const startX = -totalGridWidth / 2 + squareSize / 2;
    const initialGridHeight = numVisibleRows * squareSize + (numVisibleRows -1) * squareSpacing;
    const startY = initialGridHeight / 2 - squareSize / 2; // Start øverst for den initielle blokken

    // Create initial rows
    for (let r = 0; r < numVisibleRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const x = startX + c * (squareSize + squareSpacing);
            // Y-posisjon er relativ til gridGroup, starter fra toppen av gruppen og går nedover
            const y = (startY - r * rowHeight);

            const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
            // Gi hver rute en unik egenskap for å identifisere dens "logiske" radindeks
            const material = new THREE.MeshBasicMaterial({ color: gridColorHex });
            const square = new THREE.Mesh(geometry, material);
            square.position.set(x, y, 0);
            square.userData = { logicalRow: r, col: c }; // Lagre logisk rad og kolonne

            gridGroup.add(square);
            squareMeshes.push(square); // Dette arrayet vil nå inneholde alle ruter
        }
    }
    scene.add(gridGroup);

    // Juster kameraets Z-posisjon for å se hele bredden av rutenettet
    // Og Y for å se litt ovenfra, forbereder for perspektiv
    const fov = camera.fov * (Math.PI / 180);
    // camera.position.z = (totalGridWidth / 2) / Math.tan(fov / 2) + 20; // Juster +20 for avstand
    // camera.position.y = 10; // Løft kameraet litt for å se "ned"
    // camera.lookAt(0, -initialGridHeight / 4, 0); // Sikt litt nedover på rutenettet

    // Forbedret kameraposisjon for 3D-effekt
    camera.position.set(0, 15, 30); // Flytt kameraet opp (y) og bakover (z)
    camera.rotation.x = -Math.PI / 6; // Roter kameraet nedover (ca. 30 grader)
    // camera.lookAt(0,0,0); // Kan også bruke lookAt, men direkte rotasjon gir mer kontroll her.

    // Legg til tåke for dybdeeffekt
    scene.fog = new THREE.Fog(0x222222, 20, 100); // Farge, nær, fjern


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

    // Flytt hele gridGroup nedover
    if (gridGroup) {
        gridGroup.position.y -= scrollSpeed;

        // Sjekk om den øverste raden (visuelt) har beveget seg nok til at en ny rad kan legges til på toppen
        // gridGroup.position.y er negativ når den beveger seg nedover
        if (Math.abs(gridGroup.position.y % rowHeight) < scrollSpeed && gridGroup.position.y < -0.001) { // En liten terskel for å unngå flyttallsfeil
            // En hel rad har passert toppen (eller er i ferd med å passere)
            // Flytt den nederste raden (children[0] til children[numCols-1] i squareMeshes) til toppen
            // og oppdater dens logiske radindeks og farge.

            currentRowIndex++; // Øk den logiske radindeksen for den nye øverste raden

            const now = new Date();
            const currentSecond = now.getSeconds();

            // Flytt ruter fra bunnen til toppen
            for (let c = 0; c < numCols; c++) {
                const squareIndex = (currentRowIndex % numVisibleRows) * numCols + c; // Indeks i squareMeshes for den "eldste" raden
                const squareToMove = squareMeshes[squareIndex];

                // Ny Y-posisjon for ruten (øverst i gridGroup)
                // gridGroup.children er sortert etter Y, så den nye Y-posisjonen må være høyere enn den nåværende høyeste.
                // Siden gridGroup beveger seg nedover, må vi legge til høyden av gridGroup
                // for å plassere den "over" den nåværende toppen av gruppen, relativt til gruppens anker.
                const newY = squareToMove.position.y + numVisibleRows * rowHeight;
                squareToMove.position.y = newY;
                squareToMove.userData.logicalRow = currentRowIndex; // Oppdater logisk rad

                // Fargelegging basert på sekund
                if (c === currentSecond) {
                    squareToMove.material.color.setHex(activeColorHex);
                } else {
                    squareToMove.material.color.setHex(gridColorHex);
                }
            }
            // Juster gridGroup sin posisjon for å "nullstille" scrollet for denne raden
            // slik at det ser ut som rutenettet kontinuerlig flyter.
            // Dette er ikke helt korrekt, må tenke på hvordan gridGroup.position.y påvirker dette.
            // For nå fjerner vi denne justeringen, da det er enklere å la gridGroup kontinuerlig bevege seg.
            // gridGroup.position.y += rowHeight; // Dette vil føre til et hopp.

            // Viktig: Siden vi resirkulerer ruter, og gridGroup kontinuerlig beveger seg nedover,
            // trenger vi ikke å justere gridGroup.position.y tilbake.
            // Rutene flyttes *innenfor* gridGroup.
        }
    }

    // Fargelegging av ruter som ikke er en del av den nylig resirkulerte raden
    // Dette er nødvendig hvis en rute blir synlig igjen og ikke har fått farge.
    // Eller hvis vi vil ha en "fade-out" effekt for eldre ruter. For nå, holder vi det enkelt.
    // Den nåværende logikken over fargelegger kun den nylig flyttede raden.
    // Vi må sørge for at alle synlige ruter har riktig farge basert på deres logiske rad.
    // Dette blir mer komplekst med resirkulering.
    // En enklere tilnærming for nå: Fargelegging skjer kun når en rad resirkuleres.
    // Andre ruter beholder fargen de fikk.

    renderer.render(scene, camera);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    updateClock(); // Initial call for clock setup
    requestAnimationFrame(animate); // Start animasjonsløkken
});

setInterval(updateClock, 100); // Oppdater klokken regelmessig
