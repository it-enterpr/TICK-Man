import { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './App.css';
import logo from '/logo.png';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('Pro nákup a správu jízdenek se prosím přihlaste.');

  // =======================================================================
  // NOVÝ STAV pro text v inputu pro novou jízdenku
  // =======================================================================
  const [newTaskName, setNewTaskName] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Pokud se uživatel přihlásí, rovnou zkusíme načíst jeho jízdenky
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

  // =======================================================================
  // NOVÁ FUNKCE pro vytvoření jízdenky
  // =======================================================================
  const handleCreateTask = async (event) => {
    event.preventDefault(); // Zabráníme znovunačtení stránky po odeslání formuláře
    if (!user || !newTaskName.trim()) {
      return; // Nedělat nic, pokud není uživatel přihlášen nebo je text prázdný
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

      setNewTaskName(''); // Vyčistíme input pole
      fetchTasksFromServer(); // Znovu načteme seznam jízdenek, aby se zobrazila i ta nová

    } catch (error) {
      console.error('Chyba při vytváření úkolu:', error);
      // Zde by mohla být zpráva pro uživatele
    }
  };


  return (
    <div className="App">
      <div className="top-container">
        <div className="logo-area">
          <img src={logo} alt="Symchera Bus Logo" className="top-logo" />
        </div>
        <div className="user-controls">
          {user && (
            <div className="auth-container">
              <img src={user.photoURL} alt={user.displayName} className="profile-pic" />
              <span>{user.displayName}</span>
              <button onClick={handleLogout} className="auth-button logout-button">
                Odhlásit se
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="App-main">
        {user ? (
          <div className="content-box">
            <h2>Správa jízdenek</h2>

            {/* Nový formulář pro přidání jízdenky */}
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

            {message && <p>{message}</p>}

            <ul className="task-list">
              {tasks.map(task => (
                <li key={task._id}>{task.name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="content-box login-box">
            <h2>Vítejte</h2>
            <p>Pro pokračování se prosím přihlaste.</p>
            <button onClick={handleGoogleLogin} className="auth-button">
              Přihlásit se přes Google
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;