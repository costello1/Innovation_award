// Funzione per ottenere il valore di un cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Funzione per impostare un cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quizForm');
    const submitButton = form.querySelector('button[type="submit"]');
    let userId = getCookie('userId'); // Ottieni l'ID utente dal cookie

    if (!userId) {
        userId = `user-${Math.random().toString(36).substr(2, 9)}`;
        setCookie('userId', userId, 365);
    }

    // Controlla se l'utente ha già risposto
    const checkUserSubmission = async () => {
        const response = await fetch(`https://api-7524dbiyoq-uc.a.run.app/user/${userId}`);
        const data = await response.json();
        return data.hasSubmitted;
    };

    const periodicCheck = async () => {
        const hasSubmitted = await checkUserSubmission();
        if (hasSubmitted) {
            submitButton.disabled = true;
            window.location.href = "thankyou.html";
        }
    };

    // Avvia il controllo periodico ogni secondo
    setInterval(periodicCheck, 1000);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        userId = getCookie('userId'); // Ricarica il cookie per assicurarsi che sia aggiornato

        const hasSubmitted = await checkUserSubmission();
        if (hasSubmitted) {
            window.location.href = "thankyou.html";
        } else {
            if (selectedAnswer) {
                const answerValue = selectedAnswer.value;

                // Salva la risposta nel backend
                await fetch(`https://api-7524dbiyoq-uc.a.run.app/answers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ answer: answerValue })
                });

                // Aggiorna lo stato dell'utente nel backend
                await fetch(`https://api-7524dbiyoq-uc.a.run.app/user/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ hasSubmitted: true })
                });

                window.location.href = "thankyou.html";
            } else {
                alert("Seleziona una risposta prima di inviare.");
            }
        }
    });
});
