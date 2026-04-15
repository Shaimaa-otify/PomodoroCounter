const countEl = document.getElementById("count-el")
const pomlengthEl = document.getElementById("pomlength-el")
const breaklengthEl = document.getElementById("breaklength-el")
const testModeBtn = document.getElementById("test-mode-btn")
let countdownInterval = null
let currentTarget = null
let pausedSeconds = 0
let isPaused = false
let audioContext = null
let alertInterval = null
let isTestMode = true


function increment(target) {
    if (target === "pomodoro") {
        pomlengthEl.textContent = parseInt(pomlengthEl.textContent) + 1
    } else if (target === "break") {
        breaklengthEl.textContent = parseInt(breaklengthEl.textContent) + 1
    }
}

function decrement(target) {
    if (target === "pomodoro") {
        pomlengthEl.textContent = parseInt(pomlengthEl.textContent) - 1
    } else if (target === "break") {
        breaklengthEl.textContent = parseInt(breaklengthEl.textContent) - 1
    }
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function updateTestModeButton() {
    testModeBtn.textContent = isTestMode
        ? "Test Mode: ON (seconds)"
        : "Test Mode: OFF (minutes)"
}

function setLengthButtonsDisabled(disabled) {
    const lengthButtons = document.querySelectorAll('[data-id="increment"], [data-id="decrement"]')
    lengthButtons.forEach((button) => {
        button.disabled = disabled
    })
}

function beep() {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
}

function playAlert() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }
    beep()
    alertInterval = setInterval(beep, 700)
}

function stopAlert() {
    if (alertInterval) {
        clearInterval(alertInterval)
        alertInterval = null
    }
    document.getElementById('stop-alert-btn').style.display = 'none'
}

function launchFestiveConfetti() {
    const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8b00ff', '#ff69b4']
    // Center burst
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors })
    // Left cannon
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors }), 250)
    // Right cannon
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors }), 250)
    // Second center burst
    setTimeout(() => confetti({ particleCount: 100, spread: 120, origin: { y: 0.5 }, colors, scalar: 1.3 }), 500)
}

function countdown(target) {
    if (countdownInterval) return // Prevent multiple countdowns
    
    stopAlert()
    setLengthButtonsDisabled(true)
    currentTarget = target
    let duration = 0
    if (target === "pomodoro") {
        duration = parseInt(pomlengthEl.textContent)
        countEl.classList.add("red")
    } else if (target === "break") {
        duration = parseInt(breaklengthEl.textContent)
        countEl.classList.add("green")
    }
    
    let seconds = isPaused ? pausedSeconds : duration * (isTestMode ? 1 : 60)
    if (!isPaused) {
        pomlengthEl.textContent = "0"
        breaklengthEl.textContent = "0"
    }
    isPaused = false
    
    // Display initial time
    countEl.textContent = formatTime(seconds)
    
    countdownInterval = setInterval(() => {
        seconds--
        pausedSeconds = seconds
        countEl.textContent = formatTime(seconds)
        
        if (seconds <= 0) {
            clearInterval(countdownInterval)
            countdownInterval = null
            setLengthButtonsDisabled(false)
            currentTarget = null
            pausedSeconds = 0
            playAlert()
            launchFestiveConfetti()
            countEl.textContent = "Yay! Finished a " + (target === "pomodoro" ? "Pomodoro!" : "Break!")
            document.getElementById('stop-alert-btn').style.display = 'inline-block'
        }
    }, 1000)
}

function pauseCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
        isPaused = true
    }
}

function resumeCountdown() {
    if (isPaused && currentTarget) {
        countdown(currentTarget)
    }
}

function restartCountdown() {
    if (currentTarget) {
        stopCountdown()
        countdown(currentTarget)
    }
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
    }
    stopAlert()
    setLengthButtonsDisabled(false)
    currentTarget = null
    pausedSeconds = 0
    isPaused = false
    countEl.textContent = "00:00"
}

document.addEventListener("click", function(event) {
    if (event.target.dataset.target === "pomodoro") {
        if (event.target.dataset.id === "increment") {
            increment("pomodoro")
        } else if (event.target.dataset.id === "decrement") {
            decrement("pomodoro")
        } 
    } else if (event.target.dataset.target === "break") {
        if (event.target.dataset.id === "increment") {
            increment("break")
        } else if (event.target.dataset.id === "decrement") {
            decrement("break")
        }
    } 
    if (event.target.dataset.id === "start") {
        countdown(event.target.dataset.target)
    }
    if (event.target.dataset.id === "pause") {
        pauseCountdown()
    }
    if (event.target.dataset.id === "resume") {
        resumeCountdown()
    }
    if (event.target.dataset.id === "restart") {
        restartCountdown()
    }
    if (event.target.dataset.id === "stop") {
        stopCountdown()
    }
    if (event.target.dataset.id === "stop-alert") {
        stopAlert()
    }
    if (event.target.dataset.id === "toggle-test-mode") {
        isTestMode = !isTestMode
        updateTestModeButton()
    }

})

updateTestModeButton()


let saveEl = document.getElementById("save-el")
