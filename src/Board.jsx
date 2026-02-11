import './Board.css'
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Board() {
    //getting functions ready for the marker, text box, and sticky note
    const [penColor, setPenColor] = useState('#000000');
    const [penSize, setPenSize] = useState(5);
    const [markerEnabled, setMarkerEnabled] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen');

    const [eraserEnabled, setEraserEnabled] = useState(false);

    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [textBoxColor, setTextBoxColor] = useState('#000000');
    const [textBoxes, setTextBoxes] = useState([]);
    const [draggingTextBoxId, setDraggingTextBoxId] = useState(null);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0})
    const [textBoxFontSize, setTextBoxFontSize] = useState('20');

    const [isAddingStickyNote, setIsAddingStickyNote] = useState(false);
    const [stickyNoteTextContent, setStickyNoteTextContent] = useState('');
    const [stickyNoteColor, setStickyNoteColor] = useState('#FFFF88');
    const [stickyNoteTextColor, setStickyNoteTextColor] = useState('#000000');
    const [stickyNotes, setStickyNotes] = useState([]);
    const [draggingStickyNoteId, setDraggingStickyNoteId] = useState(null);
    const [dragStickyNoteOffset, setDragStickyNoteOffset] = useState({x:0, y:0});
    const [stickyNoteTextSize, setStickyNoteTextSize] = useState('20');

    const canvasRef = useRef(null);
    const boardRef = useRef(null);
    const templateCanvasRef = useRef(null);

    const handleMarker = () => {
        console.log('Marker pressed!')
        closeEverything();
        setTool('pen');
        //displays where the user can choose their color and size
        //only then can they actually draw on the board
        setMarkerEnabled(true); //WHEN THE USER HITS ANYTHING ELSE = FALSE
    }
    const closeMarkerPopup = () => {
        setMarkerEnabled(false);
    }
    //for the drawing
    const getMousePos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };
    const startDrawing = (e) => {
        if(!markerEnabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getMousePos(e, canvas);
        setIsDrawing(true);
        if(tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = penSize * 2;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penSize;
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
    };
    const draw = (e) => {
        if(!isDrawing || !markerEnabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getMousePos(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };
    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
    };
    const handleEraser = () => {
        closeEverything();
        setTool('eraser');
        setMarkerEnabled(true);
        setEraserEnabled(true);
    }
    const handleClearBoard = () => {
        //erases EVERYTHING, but for now just the marker (because that's what I have coded up)
        //clearing marker
        const canvas = canvasRef.current;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //clearing text box
        setTextBoxes([]);
        //clearing sticky note
        setStickyNotes([]);
        //resetting any template/what was uploaded before
        const canvas2 = templateCanvasRef.current;
        const ctx2 = templateCanvasRef.current.getContext('2d');
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        setCurrentTemplate('none');

        setIsDrawing(false);
        setIsAddingTextBox(false);
        setIsAddingStickyNote(false);
        isChoosingTemplate(false);
        setTool('pen');
    }

    
    const handleTextBox = () => {
        console.log('Text box pressed!')
        closeEverything();
        setTool('text');
        //displays an area where the user can type something in a text box
        //and then they can drag it somewhere on the canvas
        setIsAddingTextBox(true);
    }
    const closeTextBox = () => {
        //eventually add dragging functionality here
        if(textContent.trim() === '') {
            setIsAddingTextBox(false);
            return;
        }
        const newTextBox = {
            id: Date.now(),
            text: textContent,
            textColor: textBoxColor,
            fontSize: textBoxFontSize,
            x: 50,
            y: 50
        };
        setTextBoxes(prev => [...prev, newTextBox]);
        console.log(textBoxes);
        setTextContent('');
        setIsAddingTextBox(false); 
    }
    const handleDragTextBox = (e, box) => {
        e.stopPropagation();
        const boardRect = boardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;
        setDraggingTextBoxId(box.id);
        setDragOffset({
            x: mouseX - box.x,
            y: mouseY - box.y
        });
    };
    const handleTextBoxMove = (e) => {
        if(draggingTextBoxId === null) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;
        setTextBoxes(prev =>
            prev.map(box =>
                box.id === draggingTextBoxId
                    ? {
                        ...box,
                        x: mouseX - dragOffset.x,
                        y: mouseY - dragOffset.y
                    }
                    : box
            )
        );
    };
    const handleTextBoxUp = () => {
        setDraggingTextBoxId(null);
    }

    const handleStickyNote = () => {
        console.log('Sticky note pressed!');
        closeEverything();
        setTool('Sticky-Note');
        /*displays something very similar to text box only their text will appear on the front of 
        a colored stickynote. The color can also change. (so it's like a combination of marker and
        text box)*/
        setIsAddingStickyNote(true);

    }
    const closeStickyNote = () => {
        if(stickyNoteTextContent.trim() === '') {
            setIsAddingStickyNote(false);
            return;
        }
        const newStickyNote = {
            id: Date.now(),
            text: stickyNoteTextContent,
            color: stickyNoteColor,
            textColor: stickyNoteTextColor,
            fontSize: stickyNoteTextSize,
            x: 50,
            y: 50
        }
        setStickyNotes(prev => [...prev, newStickyNote]);
        console.log(stickyNotes);
        setStickyNoteTextContent('');
        setIsAddingStickyNote(false);
    }
    const handleDragStickyNote = (e, note) => {
        e.stopPropagation();
        const boardRect = boardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;
        setDraggingStickyNoteId(note.id);
        setDragStickyNoteOffset({
            x: mouseX - note.x,
            y: mouseY - note.y
        });
    }
    const handleStickyNoteMove = (e) => {
        if(draggingStickyNoteId === null) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;
        setStickyNotes(prev =>
            prev.map(note =>
                note.id === draggingStickyNoteId
                    ? {
                        ...note,
                        x: mouseX - dragStickyNoteOffset.x,
                        y: mouseY - dragStickyNoteOffset.y
                    }
                    : note
            )
        );
    }
    const handleStickyNoteUp = () => {
        setDraggingStickyNoteId(null);
    }

    const determineItemMove = (e) => {
        handleStickyNoteMove(e);
        handleTextBoxMove(e);
    }

    const determineItemUp = () => {
        handleStickyNoteUp();
        handleTextBoxUp();
    }

    const closeEverything = () => {
        isChoosingTemplate(false);
        setIsAddingStickyNote(false);
        setIsDrawing(false);
        setIsAddingTextBox(false);
        setMarkerEnabled(false);
        setDownloadSelected(false);
        setUploadSelected(false);
        isLibraryOpen(false);
        setUploadSelected(false);
        setEraserEnabled(false);
    }
    //templates
    const [choosingTemplate, isChoosingTemplate] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState('none');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleTemplate = () => {
        closeEverything();
        isChoosingTemplate(true);
    }

    const closeTemplate = () => {
        isChoosingTemplate(false);
    }

    const drawTemplate = (template) => {
        const canvas = templateCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 2;
        setCurrentTemplate(template);
        switch(template) {
            case 'tchart':
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 50);
                ctx.lineTo(canvas.width, 50);
                ctx.stroke();
                break;
            case 'grid':
                for(let i = 50; i < canvas.height; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(canvas.width, i);
                    ctx.stroke();
                }
                for(let i = 50; i < canvas.width; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, canvas.height);
                    ctx.stroke();
                }
                break;
            case 'venn':
                ctx.beginPath();
                ctx.arc(370, 345, 200, 0, 2 * Math.PI);  // Left circle
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(610, 345, 200, 0, 2 * Math.PI);  // Right circle
                ctx.stroke();
                break;
            case 'quadrants':
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
                break;
            case 'timeline':
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(50, canvas.height / 2);
                ctx.lineTo(canvas.width - 50, canvas.height / 2);
                ctx.stroke();
                ctx.lineWidth = 2;
                for(let i = 100; i < canvas.width - 50; i += 100) {
                    ctx.beginPath();
                    ctx.moveTo(i, canvas.height / 2 - 20);
                    ctx.lineTo(i, canvas.height / 2 + 20);
                    ctx.stroke();
                }
                break;
            case 'mindmap':
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, 2 * Math.PI);
                ctx.stroke();
                const branches = 6;
                for(let i = 0; i < branches; i++) {
                    const angle = (i / branches) * 2 * Math.PI;
                    ctx.beginPath();
                    ctx.moveTo(canvas.width / 2, canvas.height / 2);
                    ctx.lineTo(
                        canvas.width / 2 + Math.cos(angle) * 150,
                        canvas.height / 2 + Math.sin(angle) * 150
                    );
                    ctx.stroke();
                }
                break;
        }
        closeTemplate();
    }

    //download
    const [downloadSelected, setDownloadSelected] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [downloadData, setDownloadData] = useState([]);
    
    const handleOpenDownload = () => {
        //a popup that displays so the user can name their board
        closeEverything();
        setDownloadSelected(true);
    }
    const handleCloseDownload = () => {
        setDownloadSelected(false);
    }
    const handleDownload = () => {
        if(!boardName.trim()) {
            alert('Please enter a name for your board');
            return;
        }
        const canvas = canvasRef.current;
        const canvasImage = canvas.toDataURL('image/png');
        const boardData = {
            boardName: boardName,
            template: currentTemplate,
            canvasImage: canvasImage,
            textBoxes: textBoxes,
            stickyNotes: stickyNotes
        };
        const jsonString = JSON.stringify(boardData);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${boardName}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setBoardName('');
        handleCloseDownload();
    }

    //upload
    const [uploadSelected, setUploadSelected] = useState(false);
    const [uploadData, setUploadData] = useState('');
    const fileInputRef = useRef(null);

    const handleOpenUpload = () => {
        closeEverything();
        fileInputRef.current.click();
    };
    const handleUpload = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const boardData = JSON.parse(event.target.result);
                if(boardData.template && boardData.template !== 'none') {
                    drawTemplate(boardData.template);
                }
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = boardData.canvasImage;
                setTextBoxes(boardData.textBoxes || []);
                setStickyNotes(boardData.stickyNotes || []);
                setBoardName(boardData.boardName || '');
                setCurrentTemplate(boardData.template || 'none');
                alert('Board loaded successfully')
            } catch (error) {
                alert('Error loading file');
                console.error(error);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    //login stuff
    //nagivating
    const navigate = useNavigate();
    const handleLogin = () => {
        navigate('/Login'); //state stuff can go in ehre too
    }
    //if the user is logged in, change the stuff that is displayed/enabled (see below)
    const [loggedIn, isLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if(userId) {
            isLoggedIn(true);
            setUsername(userId);
        }
    }, []);
    const handleLogout = () => {
        // const userId = localStorage.getItem('userId')
        // localStorage.removeItem(`library_${userId}`);
        localStorage.removeItem('userId');
        isLoggedIn(false);
    }
    //library buttons
    const [savingToLibrary, isSavingToLibrary] = useState(false);
    //using the boardName, setBoardName thing from before
    const handleOpenSaveToLibrary = () => {
        closeEverything();
        isSavingToLibrary(true);
    }
    const handleCloseSaveLibrary = () => {
        isSavingToLibrary(false);
    }
    const handleSaveLibrary = () => {
        if(!boardName.trim()) {
            isSavingToLibrary(false);
            handleCloseSaveLibrary();
            // alert('Please enter a name for your board');
            return;
        }
        const canvas = canvasRef.current;
        const canvasImage = canvas.toDataURL('image/png');
        const boardData = {
            boardName: boardName,
            template: currentTemplate,
            canvasImage: canvasImage,
            textBoxes: textBoxes,
            stickyNotes: stickyNotes
        };
        const jsonString = JSON.stringify(boardData);
        const updatedBoards = {
            ...boards,
            [boardName]: jsonString
        };
        setBoards(updatedBoards);
        localStorage.setItem(`library_${userId}`, JSON.stringify(updatedBoards));
        setBoardName('');
        isSavingToLibrary(false);
    }
    //opening the library
    const [openLibrary, isLibraryOpen] = useState(false);
    const userId = localStorage.getItem('userId');
    const [boards, setBoards] = useState(() => {
        const board = localStorage.getItem(`library_${userId}`);
        return board ? JSON.parse(board) : {};
    })
    const handleOpenLibrary = () => {
        closeEverything();
        isLibraryOpen(true);
    }
    const handleLibraryClose = () => {
        isLibraryOpen(false);
    }
    //console.log('Received boards:', boards);
    const handleLoadBoard = (boardName) => {
        const selectedBoard = boards[boardName];
        try {
            const board = JSON.parse(selectedBoard);
            if(board.template && board.template!== 'none') {
                drawTemplate(board.template);
            }
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = board.canvasImage;
            setTextBoxes(board.textBoxes || []);
            setStickyNotes(board.stickyNotes || []);
            setBoardName(board.boardName || '');
            setCurrentTemplate(board.template || 'none');
        } catch (error) {
            alert('Error loading image'); //there is an error with showing the image. template and drawing shows up, not text box or sticky note
            console.error(error);
        }
        handleLibraryClose();
    };

    

    return (
        <div>
            <div className="login-area">
                {/* a button for login (leads to a login/create account screen) that will be replaced by the username if logged in */}
                {/* if the user is logged in, enable a save button and then a button that can go to their library */}
                {/* <button onClick={handleLogin}>Login</button> */}
                {!loggedIn ? (
                    <button onClick={handleLogin}>Login</button>
                ) : (
                    <>
                        <span className="username">
                            {username}
                        </span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
            <div className="main-content">
                <div className="canvas-section">
                    <div
                        ref={boardRef}
                        className="canvas"
                        style={{ position: 'relative', width: '980px', height:'690px' }}
                        onMouseMove={determineItemMove} 
                        onMouseUp={determineItemUp}
                        onMouseLeave={determineItemUp}
                    >
                        <canvas 
                            ref={templateCanvasRef}
                            width={980}
                            height={690}
                            style={{ position: 'absolute', top:0, left:0, zIndex:0 }}
                        />
                        <canvas
                            ref={canvasRef}
                            width={980}
                            height={690}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            style={{ position: 'absolute', top:0, left:0, zIndex:1, borderLeft: '1px solid black', borderRight:'2px solid black', borderTop:'2px solid black', borderBottom: '2px solid black', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                            
                        />
                        {textBoxes.map((box) => (
                            <div
                                key={box.id}
                                onMouseDown={(e) => {if (tool !== 'eraser') handleDragTextBox(e, box)}}
                                style={{
                                    position: 'absolute',
                                    left: box.x,
                                    top: box.y,
                                    zIndex: 10,
                                    padding: '1px 5px',
                                    background: 'transparent',
                                    border: '1px dashed gray',
                                    userSelect: 'none',
                                    color: box.textColor,
                                    fontSize: `${box.fontSize}px`,
                                    cursor: tool === 'eraser' ? 'default' : 'move',
                                }}
                            >
                                {tool === 'eraser' && (
                                    <button
                                        onClick={() => setTextBoxes(prev => prev.filter(b => b.id  !== box.id))}
                                        style={{
                                            position:'absolute',
                                            top:'-10px',
                                            right:'-10px',
                                            width:'20px',
                                            height:'20px',
                                            background:'#ff6b6b',
                                            color:'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor:'pointer',
                                            fontSize:'12px',
                                            padding:0,
                                            fontWeight:'bold',
                                            zIndex:1000
                                        }}
                                    >
                                        x
                                    </button>
                                )}
                                {box.text}
                            </div>
                        ))}
                        {stickyNotes.map((note) => ( 
                            <div
                                key={note.id}
                                onMouseDown={(e) => { if (tool !== 'eraser') handleDragStickyNote(e, note)}}
                                style={{
                                    position: 'absolute',
                                    left: note.x,
                                    top: note.y,
                                    zIndex: 10,
                                    padding: '10px',
                                    background: note.color,
                                    color: note.textColor,
                                    cursor: tool === 'eraser' ? 'default' : 'move',
                                    userSelect: 'none',
                                    fontSize: `${note.fontSize}px`,
                                    width: '150px',
                                    height: '150px',
                                    boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
                                    overflow: 'auto',         
                                    wordWrap: 'break-word'
                                }}
                            >
                                {tool === 'eraser' && (
                                    <button
                                        onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== note.id))}
                                        style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            width: '20px',
                                            height: '20px',
                                            background: '#ff6b6b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            padding: 0,
                                            fontWeight: 'bold',
                                            zIndex: 1000
                                        }}
                                    >
                                        x
                                    </button>
                                )}
                                {note.text}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="side-bar">
                    <div className="btnGroups">
                        <div className="designBtns">
                            <button onClick={handleMarker} className="toolBtn">Marker</button>
                            <button onClick={handleTextBox} className="toolBtn">Text Box</button>
                            <button onClick={handleStickyNote} className="toolBtn">Sticky Note</button>
                            <button onClick={handleTemplate} className="toolBtn">Use Template</button>
                        </div>
                        <div className="eraseBtns">
                            <button onClick={handleEraser} className="dangerBtn">Eraser</button>
                            <button onClick={handleClearBoard} className="dangerBtn">Clear Board</button>
                        </div>
                        <div className="downloadBtns">
                            <button onClick={handleOpenDownload} className="fileBtn">Download</button>
                            <button onClick={handleOpenUpload} className="fileBtn">Upload</button>
                            {/*this thing is hidden and for the upload operation */}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept=".json"
                                onChange={handleUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {loggedIn && (
                            <div className="libraryBtns">
                                <button onClick={handleOpenSaveToLibrary} className="libraryBtn">Save to Library</button>
                                <button onClick={handleOpenLibrary} className="libraryBtn">Upload from Library</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {markerEnabled && (
                <div className="popup-overlay" onClick={closeMarkerPopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        {eraserEnabled ? (
                            <h2>Eraser Settings</h2>
                        ) : (
                            <>
                                <h2>Marker Settings</h2>
                                <label>
                                    Color:
                                    <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
                                </label> 
                            </>
                        )}
                        <label>
                            Size:
                            <input type="range" min="1" max="20" value={penSize} onChange={(e) => setPenSize(e.target.value)} />
                        </label>
                        <button onClick={closeMarkerPopup}>Done</button>
                    </div>
                </div>
            )}
            {isAddingTextBox && (
                <div className="popup-overlay">
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Text Box</h2>
                        <label>
                            Text:
                            <input type="text" value={textContent} rows={4} placeholder="Enter your text..." onChange={(e) => setTextContent(e.target.value)} />
                        </label>
                        <label>
                            Text Color:
                            <input type="color" value={textBoxColor} onChange={(e) => setTextBoxColor(e.target.value)} />
                        </label>
                        <label>
                            Text Size:
                            <input type="range" min="1" max="72" value={textBoxFontSize} onChange={(e) => setTextBoxFontSize(e.target.value)} />
                        </label>
                        <button onClick={closeTextBox}>Done</button>
                    </div>
                </div>
            )}
            {isAddingStickyNote && (
                <div className="popup-overlay" onClick={closeStickyNote}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Sticky Note</h2>
                        <label>
                            Sticky Note Text:
                            <input type="text" value={stickyNoteTextContent} rows={4} placeholder="Enter your text..." onChange={(e) => setStickyNoteTextContent(e.target.value)} />
                        </label>
                        <label>
                            Sticky Note Text Color:
                            <input type="color" value={stickyNoteTextColor} onChange={(e) => setStickyNoteTextColor(e.target.value)} />
                        </label>
                        <label>
                            Text Size:
                            <input type="range" min="10" max="40" value={stickyNoteTextSize} onChange={(e) => setStickyNoteTextSize(e.target.value)} />
                        </label>
                        <label>
                            Sticky Note Color:
                            <input type="color" value={stickyNoteColor} onChange={(e) => setStickyNoteColor(e.target.value)} />
                        </label>
                        <button onClick={closeStickyNote}>Done</button>
                    </div>
                </div>
            )}
            {choosingTemplate && ( //eventually add images to these buttons of what the templates look like
                <div className="popup-overlay" onClick={closeTemplate}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Choose a Template:</h2>
                        <button onClick={() => drawTemplate('tchart')}>T-Chart</button> 
                        <button onClick={() => drawTemplate('grid')}>Grid</button>
                        <button onClick={() => drawTemplate('venn')}>Venn Diagram</button>
                        <button onClick={() => drawTemplate('quadrants')}>Four Quadrants</button>
                        <button onClick={() => drawTemplate('timeline')}>Timeline</button>
                        <button onClick={() => drawTemplate('mindmap')}>Mind Map</button>
                        <button onClick={() => drawTemplate('clear')}>None</button>
                    </div>
                </div>
            )}
            {downloadSelected && (
                <div className="popup-overlay" onClick={handleCloseDownload}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Download board to computer</h2>
                        <label>
                            Enter a name for the board:
                            <input type="text" value={boardName} rows={4} placeholder="Enter a name to download..." onChange={(e) => setBoardName(e.target.value)} />
                        </label>
                        <button onClick={handleDownload}>Done</button>
                    </div>
                </div>
            )}
            {savingToLibrary && (
                <div className="popup-overlay" onClick={handleCloseSaveLibrary}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Save board to library for later access</h2>
                        <label>
                            Enter a name for the board:
                            <input type="text" value={boardName} rows={4} placeholder="Enter a name to save..." onChange={(e) => setBoardName(e.target.value)} />
                        </label>
                        <button onClick={handleSaveLibrary}>Done</button>
                    </div>
                </div>
            )}
            {openLibrary && (
                <div className="popup-overlay" onClick={handleLibraryClose}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Select a Board</h2>
                        <div className="board-list">
                            {Object.keys(boards).length > 0 ? (
                                Object.keys(boards).map((boardName) => (
                                    <button
                                        key={boardName}
                                        onClick={() => handleLoadBoard(boardName)}
                                        className="board-button"
                                    >
                                        {boardName}
                                    </button>
                                ))
                            ) : (
                                <p>No boards saved yet.</p>
                            )}
                        </div>
                        <button onClick={handleLibraryClose}>Leave Library</button>
                    </div>
                </div>
            )}
        </div>
    )
}

/* There is just going to be a whiteboard where the user can add things (like text boxes, predefined
organization layouts (like a T chart), sticky notes, marker draw, etc.), a place for them to save their 
board to their computer (download it somehow), a place to name it (for the download), and a place to upload
previous boards */

export default Board;