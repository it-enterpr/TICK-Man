import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import logo from '/logo.png';
import './DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('Pro nákup a správu jízdenek se prosím přihlaste.');
  const [newTaskName, setNewTaskName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTasksFromServer(currentUser);
      } else {
        setTasks([]);
        setMessage('Pro nákup a správu jízdenek se prosím přihlaste.');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Chyba při přihlášení přes Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Chyba při odhlášení:", error);
    }
  };

  const fetchTasksFromServer = async (currentUser) => {
    const userToFetch = currentUser || user;
    if (!userToFetch) {
      setMessage("Pro načtení dat musíte být přihlášen.");
      return;
    }

    try {
      const token = await userToFetch.getIdToken();
      const response = await fetch('http://localhost:5000/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Chyba při komunikaci se serverem.');

      const data = await response.json();
      setTasks(data);
      setMessage(data.length > 0 ? '' : 'Zatím nemáte žádné jízdenky.');

    } catch (error) {
      console.error("Chyba při načítání úkolů:", error);
      setMessage('Nepodařilo se načíst data.');
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!user || !newTaskName.trim()) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTaskName }),
      });

      if (!response.ok) throw new Error('Nepodařilo se vytvořit úkol.');

      setNewTaskName('');
      fetchTasksFromServer();

    } catch (error) {
      console.error('Chyba při vytváření úkolu:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        {user ? (
          <div className="content-box">
            <div className="dashboard-title-section">
              <h2>Správa jízdenek</h2>
              <div className="quick-actions">
                <Link to="/bus/search" className="quick-action-button">
                  🚌 Koupit jízdenku
                </Link>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="task-form">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Zadejte novou jízdenku (např. Praha - Brno)"
                className="task-input"
              />
              <button type="submit" className="auth-button">Přidat</button>
            </form>

            {message && <p className="message">{message}</p>}

            <ul className="task-list">
              {tasks.map(task => (
                <li key={task._id} className="task-item">
                  <span className="task-name">{task.name}</span>
                  <div className="task-actions">
                    <button className="task-button edit">Upravit</button>
                    <button className="task-button delete">Smazat</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="content-box login-box">
            <h2>Vítejte v TICK-Man</h2>
            <p>Pro pokračování se prosím přihlaste.</p>
            <button onClick={handleGoogleLogin} className="auth-button">
              Přihlásit se přes Google
            </button>
            <div className="login-features">
              <h3>Co můžete dělat:</h3>
              <div className="feature-links">
                <Link to="/bus/search" className="feature-link">
                  🚌 Kupovat jízdenky na autobus
                </Link>
                <Link to="/profile" className="feature-link">
                  📱 Spravovat své rezervace
                </Link>
                <Link to="/profile" className="feature-link">
                  👤 Správa profilu
                </Link>
                <Link to="/settings" className="feature-link">
                  ⚙️ Nastavení aplikace
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;