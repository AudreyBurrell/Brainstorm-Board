import './Board.css'
import { useState, useRef } from 'react';

function Board() {
    //getting functions ready for the marker, text box, and sticky note
    const [penColor, setPenColor] = useState('#000000');
    const [penSize, setPenSize] = useState(5);
    const [markerEnabled, setMarkerEnabled] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [isAddingStickyNote, setIsAddingStickyNote] = useState(false);
    const [stickyNoteTextContent, setStickyNoteTextContent] = useState('');
    const [stickyNoteColor, setStickyNoteColor] = useState('#ffffff')

    const canvasRef = useRef(null);

    const handleMarker = () => {
        console.log('Marker pressed!')
        setIsAddingStickyNote(false);
        setIsAddingTextBox(false);
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
    };

    const handleTextBox = () => {
        console.log('Text box pressed!')
        setMarkerEnabled(false);
        setIsAddingStickyNote(false);
        //displays an area where the user can type something in a text box
        //and then they can drag it somewhere on the canvas
        setIsAddingTextBox(true);
    }
    const closeTextBox = () => {
        //eventually add dragging functionality here
        setIsAddingTextBox(false);
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
                className="board"
                style={{ border: '2px solid black', backgroundColor: 'white' }}
            >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ cursor: markerEnabled ? 'crosshair' : 'default' }}
                />
            </div>

            <div class="designBtns">
                <button onClick={handleMarker}>Marker</button>
                <button onClick={handleTextBox}>Text Box</button>
                <button onClick={handleStickyNote}>Sticky Note</button>
            </div>
            <div class="templateBtns">
                <button>Use Template</button>
                <button>Upload</button>
            </div>
            <div class="saveBtn">
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
                <div className="popup-overlay" onClick={closeTextBox}>
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

//TO ADD
//a way that the user can erase/clear the board

export default Board;