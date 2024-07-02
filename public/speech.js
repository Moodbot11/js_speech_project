console.log("JavaScript file loaded");

let openaiApiKey = '';

async function fetchApiKey() {
    try {
        const response = await fetch('/config');
        if (!response.ok) {
            throw new Error(`Failed to fetch API key: ${response.statusText}`);
        }
        const config = await response.json();
        openaiApiKey = config.openaiApiKey;
        console.log("API key fetched successfully");
    } catch (error) {
        console.error("Error fetching API key:", error);
    }
}

async function speak(text) {
    console.log("Speaking:", text);
    try {
        if (!openaiApiKey) {
            throw new Error("API key is not set");
        }
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Ensure this is the correct model name for text-to-speech
                voice: 'alloy',
                input: text
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            return;
        }
        const data = await response.arrayBuffer();
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    } catch (error) {
        console.error("Error during TTS:", error);
    }
}

async function transcribe(audioBlob) {
    console.log("Transcribing audio");
    try {
        if (!openaiApiKey) {
            throw new Error("API key is not set");
        }
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.mp3');
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            return;
        }
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error during transcription:", error);
    }
}

async function startRecording() {
    console.log("Requesting microphone access");
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(mediaStream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            console.log("Recording stopped");
            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const transcription = await transcribe(audioBlob);
            document.getElementById('transcription').value += `\nUser: ${transcription}`;

            const responseText = "This is a response."; // Replace with actual response logic
            await speak(responseText);
            document.getElementById('transcription').value += `\nBot: ${responseText}`;
        };

        console.log("Starting recording");
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

document.getElementById('recordBtn').addEventListener('click', startRecording);

// Fetch the API key when the script loads
fetchApiKey();
