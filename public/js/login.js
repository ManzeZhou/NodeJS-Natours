import {showAlert} from "./alerts";
import axios from "axios";

export const login = async (email, password) => {

    try {
        const res = await axios({
            method: 'POST',
            url:'/api/v1/users/login',
            data: {
                email,
                password
            }
        });

        if(res.data.status === 'success') {
            // alert('Logged in successfully!');
            showAlert('success','Logged in successfully!');
            window.setTimeout(() => {
                // if login, direct to home page
                location.assign('/');
            }, 1500);
        }

    } catch (err) {
        console.log(err.response);
        showAlert('error', err.response.data.message);
    }

};

export const logout = async () => {
  try {
      const res = await axios({
          method: 'GET',
          url: '/api/v1/users/logout',
      });
      // reload page
      if (res.data.status === 'success') {
          // location.reload();
          // showAlert('success', 'Logout successfully!');
          location.assign('/login');
      }

  } catch (err) {
      showAlert('error', 'Error logging out! Try again.')
  }
};


// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
// });