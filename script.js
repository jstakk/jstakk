const cube = document.querySelector('.cube');
const faces = document.querySelectorAll('.face');
let currentColor = { r: 100, g: 100, b: 200 }; // Startfarge (match CSS)
let targetColor = getRandomColor();
let lastMinute = new Date().getMinutes();

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
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

function updateClockAndCube() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }

    // Kube rotasjon - flyttes til egen funksjon for jevnere animasjon
    // const rotationY = seconds * 6;
    // const rotationX = seconds * 3;
    // if (cube) {
    //     cube.style.transform = `translateZ(-100px) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    // }

    // Fargeendring
    if (now.getMinutes() !== lastMinute) {
        currentColor = { ...targetColor }; // Start på den nye fargen (bruk kopi for å unngå referanseproblemer)
        targetColor = getRandomColor();
        lastMinute = now.getMinutes();
        // console.log("New minute, new target color:", targetColor);
    }

    // Gradvis fargeovergang
    const secondsIntoMinute = now.getSeconds() + (now.getMilliseconds() / 1000); // Mer presis faktor
    const factor = secondsIntoMinute / 60; // Progresjon gjennom minuttet
    const interpolatedRgb = interpolateColor(currentColor, targetColor, factor);
    // console.log(`Factor: ${factor.toFixed(3)}, Current: ${JSON.stringify(currentColor)}, Target: ${JSON.stringify(targetColor)}, Interpolated: ${interpolatedRgb}`);


    faces.forEach(face => {
        face.style.backgroundColor = interpolatedRgb;
    });
}

let rotationState = { x: 0, y: 0 };
const rotationSpeedFactor = 0.1; // Juster for hastighet, grader per 10ms

function animateCube() {
    const now = new Date();
    const totalSecondsSinceEpoch = now.getTime() / 1000;

    // Kontinuerlig rotasjon basert på tid, ikke bare hele sekunder
    // Dette gir en jevnere bevegelse uavhengig av `setInterval` for klokken.
    rotationState.y = (totalSecondsSinceEpoch * 36) % 360; // 360 grader / 10 sekunder = 36 grader/sek
    rotationState.x = (totalSecondsSinceEpoch * 18) % 360; // 180 grader / 10 sekunder = 18 grader/sek

    if (cube) {
        cube.style.transform = `translateZ(-100px) rotateY(${rotationState.y}deg) rotateX(${rotationState.x}deg)`;
    }
    requestAnimationFrame(animateCube); // Bruk requestAnimationFrame for jevn animasjon
}


// Oppdater klokkedisplay og farger hvert sekund
setInterval(updateClockAndCube, 1000);

// Start kubeanimasjon (roterer oftere)
// setInterval(animateCube, 10); // Oppdater rotasjon hvert 10. millisekund
requestAnimationFrame(animateCube); // Start animasjonsløkken

// Initiell kall for å vise klokke og sette opp farger umiddelbart
updateClockAndCube();
