function upgradeToPremium() {

    fetch('/subscription/subscribe_premium/', {  // Replace with the actual endpoint that returns the session ID
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',  // This tells Django that it's an AJAX request
    },
    })
    .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
    })
    .then(data => {
      console.log(data)
      var stripe = Stripe(data.stripe_public_key);
      stripe.redirectToCheckout({
        sessionId: data.session_id
      }).then(function (result) {
        console.log(result);
      });
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}