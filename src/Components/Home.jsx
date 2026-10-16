import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = ({ posts, onEditPost, onDeletePost }) => {
  const [editingId, setEditingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    description: "",
  });

  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      image: post.image || "",
      title: post.title,
      description: post.description,
    });
    setSelectedPost(null);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (confirmDelete) {
      onDeletePost(id);

      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
      }

      if (editingId === id) {
        setEditingId(null);
        setFormData({ image: "", title: "", description: "" });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.onerror = () => {
      window.alert(
        "The selected image could not be read. Please try another image.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();

    const updatedPost = {
      image: formData.image,
      title: formData.title || "Untitled",
      description: formData.description || "No description provided.",
    };

    onEditPost(editingId, updatedPost);

    setSelectedPost((currentPost) =>
      currentPost && currentPost.id === editingId
        ? { ...currentPost, ...updatedPost }
        : currentPost,
    );

    setEditingId(null);
    setFormData({ image: "", title: "", description: "" });
  };

  return (
    <div className="container mt-4">
      <h1>Home</h1>
      <p className="text-muted">Welcome to the Home Page</p>
      <h2 className="mt-4 mb-3" style={{textAlign:"start"}}>Latest Updates</h2>

      <div className="row g-4">
        {posts.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">No posts available.</div>
          </div>
        ) : (
          posts.map((post) => (
            <div className="col-md-4" key={post.id}>
              <div className="card shadow p-3 mb-3" style={{ width: "100%" }}>
                {post.image ? (
                  <img
                    src={post.image}
                    className="card-img-top"
                    alt={post.title}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedPost(post)}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn btn-light text-muted"
                    style={{ height: "180px" }}
                    onClick={() => handleEdit(post)}
                  >
                    No image available - click to add one
                  </button>
                )}

                {editingId === post.id ? (
                  <form className="card-body" onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-success me-2">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ image: "", title: "", description: "" });
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{post.title}</h5>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPost && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                {selectedPost.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPost(null)}
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={selectedPost.image || ""}
                  alt={selectedPost.title}
                  className="img-fluid mb-3"
                  style={{
                    borderRadius: "10px",
                    maxHeight: "250px",
                    width: "100%",
                    objectFit: "fill",
                  }}
                />
                <p style={{ textAlign: "justify" }}>{selectedPost.description}</p>
                <div className="mt-auto">
                  <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={() => handleEdit(selectedPost)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(selectedPost.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
