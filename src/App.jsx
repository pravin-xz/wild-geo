import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import About from "./Components/About";
import Contact from "./Components/Contact";
import NavBar from "./Components/NavBar";
import Create from "./Components/Create";

const STORAGE_KEY = "my-posts";


const App = () => {
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    return savedPosts ? JSON.parse(savedPosts) : defaultPosts;
  });
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const filteredPosts = posts.filter((post) => {
    const keyword = searchText.toLowerCase();
    return (
      post.title.toLowerCase().includes(keyword) ||
      post.description.toLowerCase().includes(keyword)
    );
  });

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const editPost = (id, updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post,
      ),
    );
  };

  const deletePost = (id) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
  };

  return (
    <>
      <BrowserRouter>
        <NavBar searchText={searchText} onSearchChange={setSearchText} />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                posts={filteredPosts}
                onEditPost={editPost}
                onDeletePost={deletePost}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/create" element={<Create onCreatePost={addPost} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
