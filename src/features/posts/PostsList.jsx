/* eslint-disable no-unused-vars */
import { useSelector } from "react-redux";
import { selectPostIds, useGetPostsQuery } from "./postSlice"
import PostsExcerpt from "./PostsExcerpt";

const PostsList = () => {
  const { isLoading, isSuccess, isError, error } = useGetPostsQuery();
  const orderedPostIds = useSelector(selectPostIds);
  console.log(useSelector(selectPostIds))
  

    if (isLoading) {
      return(<div>Loading...</div>)
    } 
    if (isError) {
      return(<div>Error....</div>)
    }

    return(
      <div>
        {
          orderedPostIds.map(postId => <PostsExcerpt key={postId} postId={postId} />)
        }
      </div>
    )
    
}

export default PostsList