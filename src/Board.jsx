import './Board.css'
import { useState, useRef } from 'react';

function Board() {
    //getting functions ready for the marker, text box, and sticky note
    const [penColor, setPenColor] = useState('#000000');
    const [penSize, setPenSize] = useState(5);
    const [markerEnabled, setMarkerEnabled] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen');

    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [textBoxes, setTextBoxes] = useState([]);
    const [draggingTextBoxId, setDraggingTextBoxId] = useState(null);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0})

    const [isAddingStickyNote, setIsAddingStickyNote] = useState(false);
    const [stickyNoteTextContent, setStickyNoteTextContent] = useState('');
    const [stickyNoteColor, setStickyNoteColor] = useState('#ffffff')

    const canvasRef = useRef(null);
    const boardRef = useRef(null);

    const handleMarker = () => {
        console.log('Marker pressed!')
        setIsAddingStickyNote(false);
        setIsAddingTextBox(false);
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
        setTool('eraser');
        setMarkerEnabled(true);
    }
    const handleClearBoard = () => {
        //erases EVERYTHING, but for now just the marker (because that's what I have coded up)
        //clearing marker
        const canvas = canvasRef.current;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //clearing text box
        //clearing sticky note
        //resetting any template/what was uploaded before

        setIsDrawing(false);
        setTool('pen');
    }

    
    const handleTextBox = () => {
        console.log('Text box pressed!')
        setMarkerEnabled(false);
        setIsAddingStickyNote(false);
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
        setMarkerEnabled(false);
        setIsAddingTextBox(false);
        /*displays something very similar to text box only their text will appear on the front of 
        a colored stickynote. The color can also change. (so it's like a combination of marker and
        text box)*/
        setIsAddingStickyNote(true);

    }
    const closeStickyNote = () => {
        setIsAddingStickyNote(false);
    }
    

    return (
        <div>
            <div
                ref={boardRef}
                className="board"
                style={{ border: '2px solid black', backgroundColor: 'white', position: 'relative' }}
                onMouseMove={handleTextBoxMove}
                onMouseUp={handleTextBoxUp}
                onMouseLeave={handleTextBoxUp}
            >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                    
                />
                {textBoxes.map((box) => (
                    <div
                        key={box.id}
                        onMouseDown={(e) => handleDragTextBox(e, box)}
                        style={{
                            position: 'absolute',
                            left: box.x,
                            top: box.y,
                            zIndex: 10,
                            padding: '1px 5px',
                            background: 'transparent',
                            border: '1px dashed gray',
                            cursor: 'move',
                            userSelect: 'none'
                        }}
                    >
                        {box.text}
                    </div>
                ))}
            </div>
            <div className="designBtns">
                <button onClick={handleMarker}>Marker</button>
                <button onClick={handleTextBox}>Text Box</button>
                <button onClick={handleStickyNote}>Sticky Note</button>
            </div>
            <div className="eraseBtns">
                <button onClick={handleEraser}>Eraser</button>
                <button onClick={handleClearBoard}>Clear Board</button>
            </div>
            <div className="templateBtns">
                <button>Use Template</button>
                <button>Upload</button>
            </div>
            <div className="saveBtn">
                <button>Download</button>
            </div>
            {markerEnabled && (
                <div className="popup-overlay" onClick={closeMarkerPopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Marker Settings</h2>
                        <label>
                            Color:
                            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
                        </label> 
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
                            Sticky Note Color:
                            <input type="color" value={stickyNoteColor} onChange={(e) => setStickyNoteColor(e.target.value)} />
                        </label>
                        <button onClick={closeStickyNote}>Done</button>
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