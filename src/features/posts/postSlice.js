/* eslint-disable no-unused-vars */
import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from 'date-fns';
import { apiSlice } from "../api/apiSlice";


// A function that generates a set of prebuilt reducers and selectors for performing CRUD operations 
// on a normalized state structure containing instances of a particular type of data object
// createEntityAdapter accepts a single options object parameter, with two optional fields inside.

const postsAdapter = createEntityAdapter({

  // Sort all posts by date from the newest to the oldest
  sortComparer: (a, b) => b.date.localCompare(a.date), // Check documentation
});

const initialState = postsAdapter.getInitialState();

// InjectedEndpoint enables code splitting by injecting the endpoint into the original API
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPosts: build.query({
      query: () => '/posts',
      transformResponse: responseData => {   // This works exactly like interceptors in axios
        let min = 1;
        const loadedPosts = responseData.map(post => {
          if(!post?.date) { post.date = sub(new Date(), { minutes: min })}
        })
      }
    })
  })
})
