
import React, { useState } from 'react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        // Simple evaluation - in a real app, use a proper math library
        // Replace math functions for basic eval compatibility
        let sanitized = display
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/PI/g, 'Math.PI')
          .replace(/sqrt\(/g, 'Math.sqrt(');
        
        setDisplay(eval(sanitized).toString());
      } catch (e) {
        setDisplay('Error');
      }
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all z-50 flex items-center gap-2"
      >
        <i className="fas fa-calculator text-xl"></i>
        <span className="font-semibold">Calculator</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-gray-800 rounded-2xl shadow-2xl p-4 text-white z-50 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <i className="fas fa-calculator text-blue-400"></i>
          Scientific Cal
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="bg-gray-900 p-3 rounded-lg mb-4 text-right overflow-hidden">
        <div className="text-gray-500 text-xs h-4">Calc Engine Active</div>
        <div className="text-2xl font-mono truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['sin(', 'cos(', 'tan(', 'C', 'log(', 'PI', 'sqrt(', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')', '='].map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-2 text-sm rounded transition-colors ${
              btn === '=' ? 'bg-blue-600 hover:bg-blue-700 col-span-2' : 
              btn === 'C' ? 'bg-red-600 hover:bg-red-700' :
              isNaN(parseInt(btn)) && btn !== '.' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};
