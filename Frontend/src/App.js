import './App.css';
import Main from './Components/MainComponent';
import { positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { CookiesProvider } from 'react-cookie';

function App() {
  return (
    <div className="App" >
      <AlertProvider template={AlertTemplate} position={positions.TOP_RIGHT}>
        <CookiesProvider>
          <Main />
        </CookiesProvider>
      </AlertProvider>
    </div>
  );
}

export default App;
