import axios from "axios";
import {showAlert} from "./alerts";

export const bookTour = async tourId => {

    const stripe = Stripe('pk_test_51NTUzOFAU4r6MdUHxdGZnYxWtYEJ8TKuR1qUZrbZIuoMDYqnRauYivUeo7uhLV8KDfvJUQ9GXOaBF32L0YLNppO7006FzOXn94');

    try {

        // 1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

        // console.log(session);


        // 2) Create checkout form + charge credit card
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // });
        window.location.replace(session.data.session.url);
// todo tour image broken
    } catch (err) {

        console.log(err);
        showAlert('error', err);
    }

};