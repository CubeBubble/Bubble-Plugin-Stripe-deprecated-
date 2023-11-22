function(properties, context) {


    const stripe = require('stripe')(context.keys["Secret Key"]);

    //Get items
    var price_field = properties.item_price;
    var qty_field = properties.item_qty;
    var tax_rate_field = properties.item_tax_rate;
    var line_items = [];
    var items_length =  properties.items.length();
    for (var i=0; i<items_length; i++) {
        var obj_price = properties.items.get(i,1)[0].get(price_field);
        var obj_qty = properties.items.get(i,1)[0].get(qty_field);
        var obj_tax_rate = [properties.items.get(i,1)[0].get(tax_rate_field)];
        var obj = {};

        obj["price"] = obj_price;
        obj["quantity"] = obj_qty;
        if (properties.items.get(i,1)[0].get(tax_rate_field)) {
            obj["dynamic_tax_rates"] = obj_tax_rate;
        }

        line_items.push(obj);
    }

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
        mode: 'payment',
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