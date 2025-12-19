import { useState, useEffect } from 'react'
import Calculator from './components/layout/Calculator.tsx';
import OperadoresInventario from './pages/OperadoresInventario.tsx';

function App() {
  return (
    <>
    <OperadoresInventario />
    <Calculator />
    </>
  )
}

export default App