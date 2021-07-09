const stripe = require("stripe")("sk_test_51J3Z5tSI3BSLyVaXkQFXT3yUL1Lo4u1NmwSssoAfUwjWvm9baBWUZbrvJOMuksq64du36E6Vy3FYZrwEhX81mZIF00W4mV8BRl")
const uuid = require("uuid/v4")

exports.makepayment =  (req, res) => {
    const {products , token} = req.body
    console.log("PRODUCTS", products);

    let amount = 0;
    products.map(p => {
        amount = amount + p.price
    });

    const idempotencyKey = uuid()

    return stripe.customers.create({
        email: token.email,
        source: token.id
    })
    .then(customer => {
        stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: "a test account",
            shipping: {
                name: token.card.name,
                address: {
                    line1: token.card.address_line1,
                    line2: token.card.address_line2,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    postal_code: token.card.address_zip
                }
            }
        } , {idempotencyKey})
        .then(result => res.status(200).json(result))
        .catch(err => console.log(err))
    })
};