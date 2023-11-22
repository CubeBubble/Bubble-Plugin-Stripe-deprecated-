function(properties, context) {


    const stripe = require('stripe')(context.keys["Secret Key"]);

    var prices = properties.prices.get(0, properties.prices.length())
    var names = properties.names.get(0, properties.names.length())
    var quantities = properties.quantities.get(0, properties.quantities.length())
    var taxRates = properties.taxRates ? properties.taxRates.get(0, properties.taxRates.length()) : []
    var freetrial = properties.free_trial_period;
    var payment_method_types = [];

    let line_items = []


    var stripe_options = {
        success_url: properties.success_url,
        cancel_url: properties.cancel_url,
        line_items: line_items,
        mode: properties.mode,
    };



    prices.forEach((price, index) => {

        var item = {
            price: price,
            quantity: quantities[index]
        }

        if (taxRates[index]) { item["dynamic_tax_rates"] = [ taxRates[index] ] }
        line_items.push(item)

    })



    if (properties.coupon_id != null && properties.add_reduc == "coupon"){

        var promo = properties.coupon_id.get(0, properties.coupon_id.length());
        var promos = []

        promo.forEach((id) => {
            var code_promo = {
                coupon: id
            }
            promos.push(code_promo)
        });
        
        console.log("promo : ", promos);

        stripe_options["discounts"] = promos;

    }

    if (properties.promotion_code_id != null && properties.add_reduc == "promotion code"){

        var promo = properties.promotion_code_id.get(0, properties.promotion_code_id.length());
        var promos = []

        promo.forEach((id) => {
            var code_promo = {
                promotion_code: id
            }
            promos.push(code_promo)
        });

        stripe_options["discounts"] = promos;

    }



    //Get payment methods  
    if (properties.card_payment) {
        payment_method_types.push("card");
    }

    if (properties.sepa_payment) {
        payment_method_types.push("sepa_debit");
    }
    stripe_options["payment_method_types"] = payment_method_types;



    //check if it's a sbscription or not
    var trial = {
        trial_period_days: freetrial,
    };

    freetrial != null ? stripe_options["subscription_data"] = trial : null;



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
            const result = {session_id: session.id,
                            info:JSON.stringify(session)
                           }
            callback(null, result);
        } catch (err) {
            const result = err
            callback(result);
        }
    }

    console.log(context.async(asyncCall));

    return context.async(asyncCall)


}