function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('download-btn').addEventListener('click', function() {
    fetch('/handle_download/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.reload();  // This will reload the page, showing the new message
        } 
        
        else if (data.status === 'limit_reached') {
            document.getElementById('download-btn').disabled = true;
            
            // Update the message
            const messageDiv = document.querySelector('.messages');
            if (!messageDiv) {
                // Create the message div if it doesn't exist
                const newMessageDiv = document.createElement('div');
                newMessageDiv.className = 'messages black-border bg-a-white p-3 mt-3';
                document.body.appendChild(newMessageDiv);
            }
            const newMessage = document.createElement('p');
            newMessage.className = 'your-css-class m-0';
            newMessage.textContent = "You've reached your download limit for this month, sugar!";
            messageDiv.appendChild(newMessage);

            // Update the download count
            const downloadsLeftElem = document.getElementById('downloads-left');
            downloadsLeftElem.textContent = "0";
        }
        
        else {
            // Show an error message or limit reached message
            document.getElementById('download-btn').disabled = true;
            alert(data.message);
        }
    });

});
