import GnoCalculator from './components/GnoCalculator';
import { Gauge } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
    <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">🎓 GNO / YNO Hesaplayıcı</h1>
      <GnoCalculator />
    </div>
  );
}

export default App;
