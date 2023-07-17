import {login, logout} from "./login";
import '@babel/polyfill';
import {displayMap} from "./mapbox";
import {updateSettings} from "./updateSettings";
import {signup} from "./signup";
import {bookTour} from "./stripe";
import {leaveReview} from "./reviews";

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const signupForm = document.querySelector('.form--signup');
const bookBtn = document.getElementById('book-tour');
// submit review
const reviewDataForm = document.querySelector('.modal-contents');
if(reviewDataForm) {
    reviewDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const review = document.getElementById('review').value;
        const rating = Number(document.getElementById('ratings').value);
        const {user, tour} = JSON.parse(reviewDataForm.dataset.ids);

        leaveReview(review, rating, tour, user);

        document.getElementById('review').textContent = '';
        document.getElementById('ratings').textContent = '';
    })
}

// DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);

    displayMap(locations);
}
;


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}
;

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        // upload photo
        form.append('photo', document.getElementById('photo').files[0]);
        // console.log(form);
        updateSettings(form, 'data');
    });

if (userPasswordForm)
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save--password').textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings(
            {
                passwordCurrent,
                password,
                passwordConfirm
            }, 'password'
        );
        // clear input fields
        document.querySelector('.btn--save--password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

    });

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        signup(name, email, password, passwordConfirm);
    });
}

if(bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    });
}


