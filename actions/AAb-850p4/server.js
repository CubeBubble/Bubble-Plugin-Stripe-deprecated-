function(properties, context) {


    const stripe = require('stripe')(context.keys["Secret Key"]);

    async function asyncCall(callback) {
        try {
            const session = await stripe.checkout.sessions.retrieve(properties.session_id);
            const result = {paid: session.payment_status === "paid",
                            total: session.amount_total,
                            subtotal: session.amount_subtotal,
                            customer_id: session.client_reference_id
                           };
            callback(null, result);
        } catch (err) {
            const result = err
            callback(result);
        }
    }
    

    console.log(context.async(asyncCall));
    
    return context.async(asyncCall);


}