import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
const UserPage = () => {
  return (
    <>
    <UserHeader/>
    <UserPost likes={1200} replies={481} postImg="/post1.png" postTitle="Let's talk about Threads."/>
    <UserPost likes={1210} replies={81} postImg="/post2.png" postTitle="Let's Learn."/>
    <UserPost likes={450} replies={311} postImg="/post3.png" postTitle="Elon suckss!!."/>
    <UserPost likes={210} replies={50}  postTitle="What is life without pics."/>
    
    </>
  )
}

export default UserPage