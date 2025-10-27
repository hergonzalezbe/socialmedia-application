import React, { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { postApi, getAuthHeaders } from '../api/api'; 
import type { Post } from '../types/types'; 

const Home: React.FC = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostMessage, setNewPostMessage] = useState('');
  const [postCreationLoading, setPostCreationLoading] = useState(false);
  
  const fetchPosts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await postApi.get('/posts', getAuthHeaders(token));
            
      setPosts(response.data.posts.sort((a: Post, b: Post) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ));

    } catch (err: unknown) {
      console.error('Error fetching posts:', err);      
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'No se pudieron cargar las publicaciones.');
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPostMessage.trim() || !token || !user) return;

    setPostCreationLoading(true);
    try {
      const response = await postApi.post('/posts', { message: newPostMessage }, getAuthHeaders(token));
            
      const newPost: Post = {
        ...response.data.post,
        author: user.username, 
        authorName: user.firstName,
        likeCount: 0,
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostMessage('');
    } catch (err: unknown) {
      console.error('Error creating post:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Error al crear la publicación.');
    } finally {
      setPostCreationLoading(false);
    }
  };
  
  const handleLike = async (postId: number) => {
    if (!token) return;
    
    setPosts(prevPosts => 
        prevPosts.map(post => 
            post.id === postId ? { ...post, likeCount: post.likeCount + 1 } : post
        )
    );

    try {      
      await postApi.post(`/posts/${postId}/like`, {}, getAuthHeaders(token));      

    } catch (err: unknown) {
      console.error('Error giving like:', err);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
            post.id === postId ? { ...post, likeCount: post.likeCount - 1 } : post
        )
      );
      alert('Error al dar like.');
    }
  };

  if (loading) return <div style={{ marginTop: '20px' }}>Cargando publicaciones...</div>;
  if (error) return <div style={{ marginTop: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>    

      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'left' }}>
        <h3>Crear Nueva Publicación</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            value={newPostMessage}
            onChange={(e) => setNewPostMessage(e.target.value)}
            placeholder="¿Qué estás pensando?"
            required
            style={{ width: '100%', minHeight: '80px', padding: '10px', boxSizing: 'border-box', marginBottom: '10px', resize: 'vertical' }}
          />
          <button 
            type="submit" 
            disabled={postCreationLoading || !newPostMessage.trim()}
            style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {postCreationLoading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </div>
      
      <h2>Muro de Publicaciones</h2>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {posts.length === 0 && <p>No hay publicaciones para mostrar. ¡Sé el primero en publicar!</p>}
        {posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', textAlign: 'left', background: '#f9f9f9' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>{post.message}</p>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              Publicado por **{post.authorName}** (@{post.author}) el {new Date(post.publishedAt).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button 
                onClick={() => handleLike(post.id)}
                style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                👍 Dar Like
              </button>
              <span>Likes: **{post.likeCount}**</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;