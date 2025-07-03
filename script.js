// Three.js variabler
let scene, camera, renderer;
let gridLines = [];
const lineSegments = 15; // Økt antall segmenter for å fylle mer av skjermen i dybden
const segmentDepth = 40; // Litt kortere segmenter for tettere effekt
const initialWidth = 2; // Startbredde på trekanten (antall celler)
const widthIncrement = 1; // Hvor mye bredden øker per segment dybde (antall celler)
const lineSpacing = 4; // Mindre avstand mellom linjene for et tettere rutenett
const cameraSpeed = 0.08; // Justert kameraets hastighet

// Kube-relaterte variabler og funksjoner er fjernet

function getRandomColor() { // Beholder denne hvis den brukes andre steder, ellers kan den fjernes hvis landskapet ikke trenger den.
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

    camera.position.z = 10; // Justert startposisjon for kameraet for bedre oversikt
    camera.position.y = 3; // Senket kameraet litt for en mer "inne i tunnelen" følelse
    camera.lookAt(0, 0, -segmentDepth); // Sikt litt nedover og fremover

    // Lag det initielle landskapet
    for (let i = 0; i < lineSegments; i++) {
        createGridSegment(i * -segmentDepth);
    }

    window.addEventListener('resize', onWindowResize, false);
}

function createGridSegment(zOffset) {
    const material = new THREE.LineBasicMaterial({ color: 0x888888 });
    const segmentGroup = new THREE.Group();
    segmentGroup.position.z = zOffset;

    // Beregn dybdeindeks basert på hvor langt unna kameraets start (0) dette segmentet er.
    // zOffset er negativ, så vi tar absoluttverdien.
    const depthIndexForWidth = Math.floor(Math.abs(zOffset / segmentDepth));

    // Øk bredden basert på dybdeindeksen.
    // currentSegmentWidth er antall "celler" eller mellomrom mellom linjene.
    // Antall langsgående linjer vil være currentSegmentWidth + 1.
    const currentSegmentWidthCount = initialWidth + depthIndexForWidth * widthIncrement;
    const totalWidth = currentSegmentWidthCount * lineSpacing;
    const halfTotalWidth = totalWidth / 2;

    // Langsgående linjer (langs Z-aksen)
    for (let i = 0; i <= currentSegmentWidthCount; i++) {
        const x = (i * lineSpacing) - halfTotalWidth;
        const points = [];
        points.push(new THREE.Vector3(x, 0, 0)); // Starten av segmentet
        points.push(new THREE.Vector3(x, 0, -segmentDepth)); // Slutten av segmentet
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        segmentGroup.add(line);
    }

    // Tverrgående linjer (langs X-aksen)
    // Vi trenger en tverrgående linje ved starten av dette segmentet (z=0 i segmentets lokale koordinater)
    // og en ved slutten (z=-segmentDepth i segmentets lokale koordinater).
    // Bredden på den tverrgående linjen ved z=-segmentDepth må matche bredden
    // til NESTE segment ved dens start (z=0).

    // Linje ved starten av segmentet (z=0 lokalt)
    const pointsStart = [];
    pointsStart.push(new THREE.Vector3(-halfTotalWidth, 0, 0));
    pointsStart.push(new THREE.Vector3(halfTotalWidth, 0, 0));
    const geometryStart = new THREE.BufferGeometry().setFromPoints(pointsStart);
    const lineStart = new THREE.Line(geometryStart, material);
    segmentGroup.add(lineStart);

    // For linjen ved slutten av segmentet (z=-segmentDepth lokalt):
    // Vi trenger bredden til segmentet som VILLE vært ved zOffset - segmentDepth.
    const nextDepthIndexForWidth = depthIndexForWidth + 1;
    const nextSegmentWidthCount = initialWidth + nextDepthIndexForWidth * widthIncrement;
    const nextTotalWidth = nextSegmentWidthCount * lineSpacing;
    const nextHalfTotalWidth = nextTotalWidth / 2;

    const pointsEnd = [];
    pointsEnd.push(new THREE.Vector3(-nextHalfTotalWidth, 0, -segmentDepth));
    pointsEnd.push(new THREE.Vector3(nextHalfTotalWidth, 0, -segmentDepth));
    const geometryEnd = new THREE.BufferGeometry().setFromPoints(pointsEnd);
    const lineEnd = new THREE.Line(geometryEnd, material);
    segmentGroup.add(lineEnd);

    scene.add(segmentGroup);
    gridLines.push(segmentGroup);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Main Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Landskap bevegelse
    // cameraSpeed er nå definert globalt
    camera.position.z += cameraSpeed;

    // Sikter kameraet kontinuerlig litt fremover og nedover for dynamisk perspektiv
    // Dette kan justeres eller fjernes hvis det gir uønsket effekt.
    // Vi sikter mot et punkt som er litt foran og under kameraets nåværende relative posisjon.
    // camera.lookAt(camera.position.x, camera.position.y -1, camera.position.z + segmentDepth);
    // For en jevnere "inn i tunnelen" effekt, kan vi sikte mot et fast punkt i horisonten
    // eller et punkt som beveger seg med landskapet.
    // For nå, la oss beholde den initielle lookAt og se hvordan det føles med bare Z-bevegelse.

    gridLines.forEach(segment => {
        // Flytt segmentet tilbake relativt til kameraets nye posisjon for å skape illusjon
        // Dette er ikke helt riktig for "uendelig" ennå.
        // Bedre: Når et segment går bak kamera, flytt det langt frem.
    });

    // Sjekk om det første segmentet (lengst "bak" i arrayet, men visuelt nærmest å forsvinne)
    // har passert kameraet.
    if (gridLines.length > 0) {
        const firstSegment = gridLines[0];
        // firstSegment.position.z er den absolutte z-posisjonen til segmentet.
        // camera.position.z er kameraets posisjon.
        // Når (camera.position.z - firstSegment.position.z) > segmentDepth (omtrent),
        // betyr det at kameraet har passert starten av dette segmentet.
        // Eller enklere: når (firstSegment.position.z + segmentDepth) < camera.position.z

        // Vi må vurdere segmentets posisjon i verdensrommet.
        // Kameraet beveger seg mot positiv Z. Objekter er på negativ Z.
        // Når kameraets Z er større enn (segmentets Z + dybden av segmentet),
        // er segmentet helt bak kameraet.
        if (camera.position.z > firstSegment.position.z + segmentDepth + camera.far/20 ) { // liten buffer
            scene.remove(firstSegment); // Fjern fra scenen
            gridLines.shift(); // Fjern fra arrayet

            // Legg til et nytt segment "lengst fremme" (dvs. lengst unna kameraet i negativ Z)
            const lastSegmentZ = gridLines.length > 0 ? gridLines[gridLines.length - 1].position.z : camera.position.z - segmentDepth;
            createGridSegment(lastSegmentZ - segmentDepth);
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
