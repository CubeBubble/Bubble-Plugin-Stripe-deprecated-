function(properties, context) {

    stripe.redirectToCheckout({ sessionId: properties.session_id });


}