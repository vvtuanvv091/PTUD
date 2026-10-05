import { useState, useEffect } from 'react';
import './NoteApp.css';

const API = 'http://localhost:5000/api/notes';

function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) throw new Error('Thêm ghi chú thất bại');
      const newNote = await res.json();

      setNotes(prev => [newNote, ...prev]);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="note-app">
      <h1>📝 Quản Lý Ghi Chú</h1>

      <form className="note-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Nội dung"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Thêm Ghi Chú</button>
      </form>

      {notes.length === 0 ? (
        <p className="empty">Chưa có ghi chú nào.</p>
      ) : (
        <ul className="note-list">
          {notes.map(note => (
            <li className="note-item" key={note._id}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <small>{new Date(note.createdAt).toLocaleString('vi-VN')}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NoteApp;