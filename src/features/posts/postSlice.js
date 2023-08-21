/* eslint-disable no-unused-vars */
import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from 'date-fns';
import { apiSlice } from "../api/apiSlice";

// createEntityAdapter is a function that generates a set of prebuilt reducers and selectors for performing CRUD operations 
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
      transformResponse: (responseData) => {   // This works exactly like interceptors in axios
        let minutesToSubtract = 1;
        const loadedPosts = responseData.map(post => {
          // Use the sub function to subtract a certain number of minutes from the current date and then convert it to ISO
          if(!post?.date) { post.date = sub(new Date(), { minutes: minutesToSubtract++ }).toISOString()}
          if(!post?.reactions) post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post;
        });
        // Normalize the data
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [ 
        // Each object in the array has two properties: type and id
        // The type property specifies the type of data that the tag is associated with, 
        // and the id property specifies the ID of the specific piece of data.
        // { type: 'Post', id: 'LIST' }: This cache tag indicates that the entire list of posts should be invalidated and updated
        // The type specifies the type of data (in this case, 'Post'), and the id can be used to identify a specific instance of the data. 
        // Here, 'LIST' is used as a placeholder to represent the entire list of posts.
        { type: 'Post', id: 'LIST' },   
        ...result.ids.map(id => ({ type: 'Post', id }))
      ],
    }),
  }),
});


export const { useGetPostsQuery } = extendedApiSlice;

// returns the query result object(the entire object and not just the data)
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();

// creates memoized selector
const selectPostsData = createSelector(
  selectPostsResult, 
  (postsResult) => postsResult.data  // Normalized state result with ids & entities
);

// getSelectors creates selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => selectPostsData(state) ?? initialState)


