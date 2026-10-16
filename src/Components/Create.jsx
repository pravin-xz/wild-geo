import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Create = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() && !formData.content.trim()) {
      alert("Please enter a title or description.");
      return;
    }

    let imageValue = "";

    if (formData.image) {
      imageValue = await convertToBase64(formData.image);
    }

    const newPost = {
      id: Date.now(),
      title: formData.title || "Untitled",
      description: formData.content || "No description provided.",
      image: imageValue,
    };

    onCreatePost(newPost);
    navigate("/");
  };

  return (
    <div className="container mt-4">
      <h1>Create Post</h1>
      <p className="text-muted">This is the Create Page</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">
            Select Image
          </label>
          <input
            type="file"
            className="form-control"
            id="image"
            name="image"
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter title"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="content"
            name="content"
            rows="5"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter description"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Create;
