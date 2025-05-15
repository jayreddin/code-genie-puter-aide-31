import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCodeModal from '@/components/QRCodeModal';
import ChromeExtensionModal from '@/components/ChromeExtensionModal';
import AppHeader from '@/components/AppHeader';

const Index = () => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isChromeModalOpen, setChromeModalOpen] = useState(false);
  
  const handleOpenQRModal = () => {
    setIsQRModalOpen(true);
  };

  const handleOpenChromeModal = () => {
    setChromeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-24">
          <h1 className="text-5xl font-bold mb-6">AI-Powered Code Assistant</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Leverage Puter.com&apos;s powerful AI models to generate, debug, and fix your code.
            Available as a Chrome extension and mobile app.
          </p>
          <div className="flex justify-center gap-6">
            <button 
              onClick={handleOpenChromeModal} 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Chrome Extension
            </button>
            <button 
              onClick={handleOpenQRModal} 
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
            >
              Mobile App
            </button>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Code Generation */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-blue-400 text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Generation</h3>
              <p className="text-gray-300">
                Generate code snippets, functions, and complete components from natural language prompts or comments.
              </p>
            </div>
            {/* Code Debugging */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-purple-400 text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c-4.97 0-9-1.79-9-4v-1.5L9 14l.05-.05C10.09 13.36 11.23 13 12 13c.77 0 1.91.36 2.95.95L15 14l6 2.5V18c0 2.21-4.03 4-9 4z"></path>
                  <path d="M12 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Debugging</h3>
              <p className="text-gray-300">
                Identify issues in your code with detailed diagnostics and suggestions for improvements.
              </p>
            </div>
            {/* Code Fixing */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-green-400 text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Fixing</h3>
              <p className="text-gray-300">
                Automatically fix bugs and errors in your code with AI-suggested solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Chrome Extension section */}
        <section id="chrome-extension" className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Chrome Extension</h2>
              <p className="text-gray-300 mb-6">
                Our Chrome extension seamlessly integrates with popular web-based code editors including GitHub, CodeSandbox, CodePen, and more.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="text-green-400 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Works with GitHub, CodeSandbox, CodePen, and more</span>
                </li>
                <li className="flex items-start">
                  <svg className="text-green-400 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Generate code directly in your editor</span>
                </li>
                <li className="flex items-start">
                  <svg className="text-green-400 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Debug and fix code with a single click</span>
                </li>
              </ul>
              <a 
                id="download-chrome"
                href="#" 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium inline-flex items-center transition-colors"
              >
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Extension
              </a>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-gray-400 text-sm">code-editor.js</div>
                </div>
                <div className="p-4 font-mono text-sm text-gray-300 overflow-hidden" style={{ maxHeight: "300px" }}>
                  <pre className="language-javascript">
{`// Generate a React component for a todo list
import React, { useState } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const handleAddTodo = () => {
    if (input.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      <div className="add-todo">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={handleAddTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            onClick={() => toggleTodo(todo.id)}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App section */}
        <section id="mobile-app" className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gray-800 rounded-lg p-8 relative" style={{ maxWidth: "300px", margin: "0 auto" }}>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 w-16 h-3 bg-gray-900 rounded-full"></div>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="p-3">
                    <div className="bg-blue-900 text-blue-300 p-3 rounded-lg text-sm mb-3">
                      // Debug this function
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-sm font-mono text-gray-300">
                      function calculateTotal(items) {'{'}<br />
                      &nbsp;&nbsp;let sum = 0;<br />
                      &nbsp;&nbsp;for (let i = 0; i &lt; items.length; i++) {'{'}<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;sum += items[i].price;<br />
                      &nbsp;&nbsp;{'}'}<br />
                      &nbsp;&nbsp;return sum;<br />
                      {'}'}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Generate</button>
                      <button className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm">Debug</button>
                      <button className="bg-pink-600 text-white px-3 py-1 rounded-md text-sm">Fix</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Mobile App</h2>
              <p className="text-gray-300 mb-6">
                Take the power of Puter&apos;s code AI with you. Our mobile app lets you edit, generate, and debug code on the go.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="text-green-400 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Built with Expo for iOS and Android compatibility</span>
                </li>
                <li className="flex items-start">
                  <svg className="text-green-400 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Full code editor with syntax highlighting</span>
                </li>
                <li className="flex items-start">
                  <svg className="text-green-400 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Save and manage your code snippets</span>
                </li>
              </ul>
              <div className="flex space-x-4">
                <button 
                  id="download-mobile"
                  onClick={handleOpenQRModal}
                  className="px-6 py-3 bg-black text-white rounded-md font-medium inline-flex items-center border border-gray-700"
                >
                  <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </button>
                <button
                  onClick={handleOpenQRModal} 
                  className="px-6 py-3 bg-black text-white rounded-md font-medium inline-flex items-center border border-gray-700"
                >
                  <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.94c-.44 0-.86-.18-1.18-.5-.32-.32-.5-.74-.5-1.18V1.74c0-.44.18-.86.5-1.18.32-.32.74-.5 1.18-.5h17.64c.44 0 .86.18 1.18.5.32.32.5.74.5 1.18v20.52c0 .44-.18.86-.5 1.18-.32.32-.74.5-1.18.5H3.18zM12 7.74l-6.2-3.56v-.01l6.2-3.56 6.27 3.56-6.27 3.57zm4.76 6.05-4.76-2.73-4.76 2.73v-5.5L12 10.54l4.76 2.75v.5z" />
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-blue-400">Puter</span>
              <span className="text-xl font-bold text-white ml-1">Code Assistant</span>
              <p className="text-gray-400 mt-2">AI-powered code assistance using Puter.com models</p>
            </div>
            <div className="flex space-x-8">
              <div>
                <h3 className="text-white font-medium mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                  <li><a href="#chrome-extension" className="hover:text-blue-400 transition-colors">Chrome Extension</a></li>
                  <li><a href="#mobile-app" className="hover:text-blue-400 transition-colors">Mobile App</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Puter Code Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <ChromeExtensionModal 
        isOpen={isChromeModalOpen}
        onClose={() => setChromeModalOpen(false)}
      />
      
      <QRCodeModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Download the Puter Code Assistant App"
        description="Scan the QR code with your phone camera to download our mobile app or open the web version"
      />
    </div>
  );
};

export default Index;
