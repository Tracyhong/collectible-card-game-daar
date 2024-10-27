import styles from './styles.module.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Users from './components/Users';
import Sets from './components/Sets';
import Cards from './components/Cards';
import Booster from './components/Booster';
import Footer from './components/Footer';

import { WalletProvider } from './wallet/WalletProvider';

export const App = () => {

  return (
    <Router>
      <WalletProvider>
        <Header />  
        <div className={styles.body}>
          <h1>Welcome to Pokémon TCG</h1>
          <Routes>
            <Route path="/" element={
             <Home/>
            } />
            <Route path="/users" element={<Users />} />
            <Route path="/sets" element={<Sets />} />
            <Route path="/cards/:setId" element={<Cards />} />
            
            <Route path="/booster" element={<Booster />} />
          </Routes>
        </div>
        <Footer />  
      </WalletProvider>
    </Router>
  );
};

export default App;
