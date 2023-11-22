
function(properties, context) {

    const stripe = require('stripe')(context.keys["Secret Key"]);
    var applies_to = properties.applies_to.get(0, properties.applies_to.length())

    
    var stripe_options={};

    if (properties.type == 'net reduction' && properties.quantity != null){
        stripe_options = {
            amount_off: properties.value,
            name: properties.name,
            applies_to: {
                products: applies_to,
            },
            duration: 'forever',
            currency: 'EUR',
            max_redemptions: properties.quantity,
            redeem_by: properties.times_redeemed,


        };

    }else if (properties.type == 'net reduction' && properties.quantity == null){
        stripe_options = {
            amount_off: properties.value,
            name: properties.name,
            applies_to: {
                products: applies_to,
            },
            duration: 'forever',
            currency: 'EUR',
            redeem_by: properties.times_redeemed,

        };
    }else if (properties.type == 'percentage' && properties.quantity == null){
        stripe_options = {
            percent_off: properties.value,
            name: properties.name,
            applies_to: {
                products: applies_to,
            },
            duration: 'forever',
            redeem_by: properties.times_redeemed,

        };
    }else if(properties.type == 'percentage' && properties.quantity != null){
        stripe_options = {
            percent_off: properties.value,
            name: properties.name,
            applies_to: {
                products: applies_to,
            },
            duration: 'forever',
            max_redemptions: properties.quantity,
            redeem_by: properties.times_redeemed,


        };
    }

    async function asyncCall(callback) {
        try {

            const session = await stripe.coupons.create(stripe_options);

            const result = {coupon_id: session.id,
                            info:JSON.stringify(session)
                           }
            callback(null, result);
        } catch (err) {
            const result = err
            callback(result);
        }
    }

	return context.async(asyncCall)

}