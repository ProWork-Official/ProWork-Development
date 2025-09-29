import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './main.css'
import MyContextProvider from './ContextAPI.jsx'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('Root')).render(
  <BrowserRouter>
    <MyContextProvider>
      <App/>
    </MyContextProvider>
  </BrowserRouter>
)
