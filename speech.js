
let openaiApiKey = '';

// Fetch the API key from the server
async function fetchApiKey() {
    const response = await fetch('/config');
    const config = await response.json();
    openaiApiKey = config.openaiApiKey;
}

// Function to speak text using OpenAI's TTS
async function speak(text) {
    try {
    Fuck you    const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'alloy',
                input: text
            })
        });

        const data = await response.arrayBuffer();
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    } catch (error) {
        console.error("Error during TTS:", error);
    }
}

// Function to transcribe audio using OpenAI's API
async function transcribe(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: formData
        });

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error during transcription:", error);
    }
}

// Function to start recording from the microphone
async function startRecording() {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(mediaStream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const transcription = await transcribe(audioBlob);
            document.getElementById('transcription').value += `\nUser: ${transcription}`;

            // Generate a response using TTS
            const responseText = "This is a response."; // Replace with actual response logic
            await speak(responseText);
            document.getElementById('transcription').value += `\nBot: ${responseText}`;
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

// Event listener for the record button
document.getElementById('recordBtn').addEventListener('click', startRecording);

// Fetch the API key when the script loads
fetchApiKey();
