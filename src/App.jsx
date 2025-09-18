import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import ProductDashboard from './pages/Dashboard'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductDashboard/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
