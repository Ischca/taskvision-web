import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Options from './Options';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
); 