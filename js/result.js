document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const rollNumber = document.getElementById('rollNumber').value;
    const examination = document.getElementById('examination').value;
    const regulation = document.getElementById('regulation').value;

    try {
        const response = await fetch(`http://127.0.0.1:5000/result?roll_number=${rollNumber}&examination=${encodeURIComponent(examination)}&regulation=${regulation}`);
        const data = await response.json();

        if (response.ok) {
            // Redirect to view.html with data
            localStorage.setItem('resultData', JSON.stringify(data));
            window.location.href = 'view.html';
        } else {
            document.getElementById('result').innerText = data.error;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'An error occurred.';
    }
});
