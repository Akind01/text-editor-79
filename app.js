 
        let editor = document.getElementById('editor');
        let currentFileName = 'untitled.txt';
        let undoStack = [];
        let redoStack = [];
        let isFullscreen = false;

        // Initialize undo/redo tracking
        editor.addEventListener('input', function() {
            undoStack.push(editor.value);
            redoStack = [];
            if (undoStack.length > 50) undoStack.shift();
        });

        // Dropdown functionality
        function toggleDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            const allDropdowns = document.querySelectorAll('.dropdown');
            
            allDropdowns.forEach(d => {
                if (d.id !== dropdownId) d.style.display = 'none';
            });
            
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
            }
        });

        // File operations
        function newDocument() {
            if (editor.value && confirm('Are you sure you want to create a new document? Unsaved changes will be lost.')) {
                editor.value = '';
                currentFileName = 'untitled.txt';
                undoStack = [];
                redoStack = [];
            }
        }

        function openFile() {
            document.getElementById('fileInput').click();
        }

        function handleFileOpen(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editor.value = e.target.result;
                    currentFileName = file.name;
                };
                reader.readAsText(file);
            }
        }

        function saveFile() {
            const blob = new Blob([editor.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentFileName;
            a.click();
            URL.revokeObjectURL(url);
        }

        function saveAsFile() {
            const filename = prompt('Enter filename:', currentFileName);
            if (filename) {
                currentFileName = filename.endsWith('.txt') ? filename : filename + '.txt';
                saveFile();
            }
        }

        function printDocument() {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>Print Document</title></head>
                    <body style="font-family: ${editor.style.fontFamily || 'Times New Roman'}; font-size: ${editor.style.fontSize || '14px'};">
                        <pre>${editor.value}</pre>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }

        // Edit operations
        function undoAction() {
            if (undoStack.length > 1) {
                redoStack.push(undoStack.pop());
                editor.value = undoStack[undoStack.length - 1] || '';
            }
        }

        function redoAction() {
            if (redoStack.length > 0) {
                const value = redoStack.pop();
                undoStack.push(value);
                editor.value = value;
            }
        }

        function cutText() {
            const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
            if (selectedText) {
                navigator.clipboard.writeText(selectedText);
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + editor.value.substring(end);
                editor.setSelectionRange(start, start);
            }
        }

        function copyText() {
            const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
            if (selectedText) {
                navigator.clipboard.writeText(selectedText);
            }
        }

        function pasteText() {
            navigator.clipboard.readText().then(text => {
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + text + editor.value.substring(end);
                editor.setSelectionRange(start + text.length, start + text.length);
            });
        }

        function selectAllText() {
            editor.select();
        }

        function findReplace() {
            const findText = prompt('Find:');
            if (findText) {
                const replaceText = prompt('Replace with:');
                if (replaceText !== null) {
                    editor.value = editor.value.replaceAll(findText, replaceText);
                }
            }
        }

        // Format operations
        function toggleFormat(format) {
            // Since we're using a textarea, we'll simulate formatting with CSS
            const btn = document.getElementById(format + 'Btn');
            btn.classList.toggle('active');
            
            switch(format) {
                case 'bold':
                    editor.style.fontWeight = btn.classList.contains('active') ? 'bold' : 'normal';
                    break;
                case 'italic':
                    editor.style.fontStyle = btn.classList.contains('active') ? 'italic' : 'normal';
                    break;
                case 'underline':
                    editor.style.textDecoration = btn.classList.contains('active') ? 'underline' : 'none';
                    break;
            }
        }

        function changeFontFamily() {
            const fontFamily = document.getElementById('fontFamily').value;
            editor.style.fontFamily = fontFamily;
        }

        function changeFontSize() {
            const fontSize = document.getElementById('fontSize').value;
            editor.style.fontSize = fontSize + 'px';
        }

        // Insert operations
        function insertDateTime() {
            const now = new Date();
            const dateTime = now.toLocaleString();
            const start = editor.selectionStart;
            editor.value = editor.value.substring(0, start) + dateTime + editor.value.substring(editor.selectionEnd);
            editor.setSelectionRange(start + dateTime.length, start + dateTime.length);
        }

        function insertSymbol() {
            const symbols = ['©', '®', '™', '§', '¶', '†', '‡', '•', '‰', '‱', '′', '″', '‴', '‵', '‶', '‷'];
            const symbol = prompt('Choose a symbol:\n' + symbols.join(' '));
            if (symbol && symbols.includes(symbol)) {
                const start = editor.selectionStart;
                editor.value = editor.value.substring(0, start) + symbol + editor.value.substring(editor.selectionEnd);
                editor.setSelectionRange(start + 1, start + 1);
            }
        }

        // View operations
        function toggleWordWrap() {
            editor.style.whiteSpace = editor.style.whiteSpace === 'nowrap' ? 'pre-wrap' : 'nowrap';
        }

        function toggleFullscreen() {
            const container = document.querySelector('.notepad-container');
            if (!isFullscreen) {
                container.style.position = 'fixed';
                container.style.top = '0';
                container.style.left = '0';
                container.style.width = '100vw';
                container.style.height = '100vh';
                container.style.maxWidth = 'none';
                container.style.borderRadius = '0';
                container.style.zIndex = '9999';
                isFullscreen = true;
            } else {
                container.style.position = 'relative';
                container.style.top = 'auto';
                container.style.left = 'auto';
                container.style.width = '100%';
                container.style.height = '90vh';
                container.style.maxWidth = '1200px';
                container.style.borderRadius = '8px';
                container.style.zIndex = 'auto';
                isFullscreen = false;
            }
        }

        // Help operations
        function showAbout() {
            showModal('About Online Notepad', 'A simple, feature-rich online text editor built with HTML, CSS, and JavaScript. Version 1.0');
        }

        function showHelp() {
            showModal('Help', 'Use the toolbar buttons and menu options to format your text, save files, and more. Keyboard shortcuts: Ctrl+S (Save), Ctrl+O (Open), Ctrl+N (New), Ctrl+Z (Undo), Ctrl+Y (Redo)');
        }

        // Modal functions
        function showModal(title, content) {
            document.getElementById('modalContent').innerHTML = `<h3>${title}</h3><p>${content}</p>`;
            document.getElementById('modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        saveFile();
                        break;
                    case 'o':
                        e.preventDefault();
                        openFile();
                        break;
                    case 'n':
                        e.preventDefault();
                        newDocument();
                        break;
                    case 'z':
                        e.preventDefault();
                        undoAction();
                        break;
                    case 'y':
                        e.preventDefault();
                        redoAction();
                        break;
                    case 'a':
                        e.preventDefault();
                        selectAllText();
                        break;
                }
            }
        });

        // Auto-save functionality
        setInterval(() => {
            if (editor.value) {
                localStorage.setItem('notepad-autosave', editor.value);
            }
        }, 3000);

        // Load auto-saved content on page load
        window.addEventListener('load', () => {
            const autosaved = localStorage.getItem('notepad-autosave');
            if (autosaved && !editor.value) {
                editor.value = autosaved;
            }
        });
    
