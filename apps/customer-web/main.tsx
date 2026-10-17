import { createRoot } from 'react-dom/client';
import CustomerApp from './CustomerApp.js';
import '../../src/index.css';

createRoot(document.getElementById('root')!).render(<CustomerApp />);
