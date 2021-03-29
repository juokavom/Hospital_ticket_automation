import './App.css';
import Main from './Components/MainComponent';
import { CookiesProvider } from 'react-cookie';

function App() {
  return (
    <div className="App" >
      <CookiesProvider>
        <Main/>
      </CookiesProvider>
    </div>
  );
}

export default App;
