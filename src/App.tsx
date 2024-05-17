import React from 'react';
import "./App.css";
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Swap from './pages/Swap';
import Indexes from './pages/Indexes';
import Factory from './pages/Factory';
import SetDetails from './pages/SetDetails';
import { useAccount} from 'wagmi';

const App: React.FC = () => {
  const { address, status } = useAccount();

  return (
    <div className="App">
      <Header status={status} address={address} />
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Factory status={status}/>} />
          <Route path="/indexes" element={<Indexes status={status} />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/set/:address" element={<SetDetails userWallet={address}/>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
