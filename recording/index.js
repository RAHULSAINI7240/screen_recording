const dropdownButton = document.getElementById("toggleDropdown");
const dropdownContent = document.getElementById("dropdown");
const closePopup = document.getElementById('closePopup');
const recordButton = document.getElementById("recordButton");
const recordedVideo = document.getElementById("recordedVideo");
const timerSpan = document.getElementById("timer");
const recordingStatus = document.querySelector(".recording-status");

let mediaRecorder;
let recordedChunks = [];
let timer;
let seconds = 0;

// Toggle dropdown visibility
dropdownButton.addEventListener("click", () => {
    dropdownContent.style.display = dropdownContent.style.display === "flex" ? "none" : "flex";
});

closePopup.addEventListener('click', () => {
    dropdownContent.style.display = 'none';
});

// Function to format time (MM:SS)
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

// Start the timer
const startTimer = () => {
    seconds = 0;
    recordingStatus.classList.remove("hidden");
    timer = setInterval(() => {
        seconds++;
        timerSpan.textContent = formatTime(seconds);
    }, 1000);
};

// Stop and reset the timer
const stopTimer = () => {
    clearInterval(timer);
    timerSpan.textContent = "00:00";
    recordingStatus.classList.add("hidden");
};

// Toggle recording
recordButton.addEventListener("click", async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            
            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Display recorded video preview
                recordedVideo.src = url;
                recordedVideo.classList.remove("hidden");

                // Reset timer and button text
                stopTimer();
                recordButton.textContent = "Start Recording";
            };

            mediaRecorder.start();

            // UI updates
            recordButton.textContent = "Stop Recording";
            recordButton.style.backgroundColor = "red";
            startTimer();
            
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    } else {
       
        mediaRecorder.stop();
        recordButton.textContent = "Start Recording";
        recordButton.style.backgroundColor = "green";
        stopTimer();
    }
});
