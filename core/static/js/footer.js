    // JavaScript to dynamically insert the email
    document.addEventListener("DOMContentLoaded", function() {
        var user = 'antdegou';
        var domain = 'gmail.com';
        var element = document.getElementById('email');
        element.innerHTML = '<a href="mailto:' + user + '@' + domain + '">' + user + '@' + domain + '</a>';
      });
  
  
  
      //JavaScript to dynamically insert the current year
      document.addEventListener('DOMContentLoaded', (event) => {
        const yearElement = document.getElementById('current-year');
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
      });