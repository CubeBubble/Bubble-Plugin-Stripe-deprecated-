function(properties, context) {

 const stripe = require('stripe')(context.keys["Secret Key"]);


    async function asyncCall(callback) {
        try {

            const session = await stripe.customers.create({
                email: properties.email,
            });

            const result = {
                			cust_id: session.id
                           }
            callback(null, result);
        } catch (err) {
            const result = err
            callback(result);
        }
    }

    return context.async(asyncCall);

}