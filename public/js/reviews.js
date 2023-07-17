import axios from "axios";
import {showAlert} from "./alerts";

export const leaveReview = async (review, rating, tour, user) => {
  try {
      const res = await axios({
          method: 'POST',
          url: `/api/v1/tours/${tour}/reviews`,
          data: {
              review,
              rating,
              tour,
              user
          }
      });
      if (res.data.status === 'success') {
          showAlert('success', 'Your review was successfully uploaded!');
          window.setTimeout(() => {
              location.reload();
          }, 1000)
      }
  } catch (err) {
      console.log(err)
      showAlert('error', 'You can only leave one review for each tour you have booked');
  }
}