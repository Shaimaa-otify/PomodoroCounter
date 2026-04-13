const countEl = document.getElementById("count-el")
const pomlengthEl = document.getElementById("pomlength-el")
const breaklengthEl = document.getElementById("breaklength-el")
let countdownInterval = null
let currentTarget = null
let pausedSeconds = 0
let isPaused = false


function increment(target) {
    if (target === "pomodoro") {
        pomlengthEl.textContent = parseInt(pomlengthEl.textContent) + 5
    } else if (target === "break") {
        breaklengthEl.textContent = parseInt(breaklengthEl.textContent) + 5
    }
}

function decrement(target) {
    if (target === "pomodoro") {
        pomlengthEl.textContent = parseInt(pomlengthEl.textContent) - 5
    } else if (target === "break") {
        breaklengthEl.textContent = parseInt(breaklengthEl.textContent) - 5
    }
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function playAlert() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
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

function countdown(target) {
    if (countdownInterval) return // Prevent multiple countdowns
    
    currentTarget = target
    let minutes = 0
    if (target === "pomodoro") {
        minutes = parseInt(pomlengthEl.textContent)
    } else if (target === "break") {
        minutes = parseInt(breaklengthEl.textContent)
    }
    
    let seconds = isPaused ? pausedSeconds : minutes * 60
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
            currentTarget = null
            pausedSeconds = 0
            playAlert()
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

})


let saveEl = document.getElementById("save-el")
