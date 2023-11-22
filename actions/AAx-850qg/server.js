function(properties, context) {


    const stripe = require('stripe')(context.keys["Secret Key"]);
	
    var prices = properties.prices.get(0, properties.prices.length())
    var names = properties.names.get(0, properties.names.length())
    var quantities = properties.quantities.get(0, properties.quantities.length())
    var taxRates = properties.taxRates ? properties.taxRates.get(0, properties.taxRates.length()) : []
    
    let line_items = []
    
    prices.forEach((price, index) => {
        
        var item = {
            price_data: {
                currency: 'eur',
                product_data: {
                    name: names[index]
                },
                unit_amount: price,
            },
            quantity: quantities[index]
        }
        
        if (taxRates[index]) { item["dynamic_tax_rates"] = [ taxRates[index] ] }
        line_items.push(item)
            
    })
    
    //Get payment methods
    var payment_method_types = [];
    if (properties.card_payment) {
        payment_method_types.push("card");
    }
    
    if (properties.sepa_payment) {
        payment_method_types.push("sepa_debit");
    }
    
    var stripe_options = {
                success_url: properties.success_url,
                cancel_url: properties.cancel_url,
                payment_method_types: payment_method_types,
                line_items: line_items,
                mode: properties.mode,
            };
    
    // Set customer information if available
    var customer_id_field = properties.customer_id;
    var customer_email_field = properties.customer_email;
    if (properties.customer.get(customer_id_field)) {
        stripe_options["customer"] = properties.customer.get(customer_id_field);
    } else if (properties.customer.get(customer_email_field)) {
        stripe_options["customer_email"] = properties.customer.get(customer_email_field);
    }
        
    async function asyncCall(callback) {
        try {
            const session = await stripe.checkout.sessions.create(stripe_options);
            console.log(session)
            const result = {session_id: session.id}
            callback(null, result);
        } catch (err) {
            const result = err
            callback(result);
        }
    }

    console.log(context.async(asyncCall));
    
    return context.async(asyncCall)


}