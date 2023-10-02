document.getElementById('updateDetailsForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents normal form submission

    // Use the FormData object to gather form data
    let formData = new FormData(this);

    // Send the data using the Fetch API
    fetch('/dashboard/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {

          location.reload();
        } else {
        // Handle errors
          let allErrors = '';
          for (const [field, error] of Object.entries(data.errors)) {
              allErrors += error + '<br>'; // concatenate errors
          }
    
          const errorDiv = document.querySelector('#formErrors');
          errorDiv.innerHTML = allErrors; // update error div content
          errorDiv.style.display = 'block'; // show the error div
            
        }
    });

});


