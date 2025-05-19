import Login from './components/Login';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';  // Updated import for newer versions of antd

function App() {
  return (
    <ConfigProvider>
      <div className="App">
        <Login />
      </div>
    </ConfigProvider>
  );
}

export default App;
