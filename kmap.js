
let firstClick = false;
let currentlyCreatingSelection = false;
let boxDeleted = false;
function SelectionBox(x, y, width, length) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.placementDone = false;
    this.savedDimensions = [];
    //array of squares.
    this.hitbox = [];
    this.lineWidth = 7;

    this.square = new PIXI.Graphics();
    this.square.interactive = true;
    this.square.buttonMode = true;
    this.square.lineStyle(this.lineWidth, currentColor);
    app.stage.addChild(this.square);


    this.setProperties = function (x, y, width, length) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.width = width;
    }
    //snaps coordinates into closest corner of grid
    this.snaping = function (x, y) {
        let widthMultiplyer = Math.floor(x / sizeOfCell.width);
        let heightMultiplyer = Math.floor(y / sizeOfCell.height);
        if (widthMultiplyer == 0) {
            widthMultiplyer = 1;
        }
        if (heightMultiplyer == 0) {
            heightMultiplyer = 1;
        }
        let finalX = 0;
        let finalY = 0;

        if (x <= (widthMultiplyer * sizeOfCell.width) + 1 / 2 * sizeOfCell.width && y < (heightMultiplyer * sizeOfCell.height) + 1 / 2 * sizeOfCell.height) {
            finalX = widthMultiplyer * sizeOfCell.width;
            finalY = heightMultiplyer * sizeOfCell.height;
        } else if (x > (widthMultiplyer * sizeOfCell.width) + 1 / 2 * sizeOfCell.width && y < (heightMultiplyer * sizeOfCell.height) + 1 / 2 * sizeOfCell.height) {
            finalX = (widthMultiplyer + 1) * sizeOfCell.width;
            finalY = heightMultiplyer * sizeOfCell.height;
        } else if (x <= (widthMultiplyer * sizeOfCell.width) + 1 / 2 * sizeOfCell.width && y >= (heightMultiplyer * sizeOfCell.height) + 1 / 2 * sizeOfCell.height) {
            finalX = widthMultiplyer * sizeOfCell.width;
            finalY = (heightMultiplyer + 1) * sizeOfCell.height;
        } else if (x > (widthMultiplyer * sizeOfCell.width) + 1 / 2 * sizeOfCell.width && y >= (heightMultiplyer * sizeOfCell.height) + 1 / 2 * sizeOfCell.height) {
            finalX = (widthMultiplyer + 1) * sizeOfCell.width;
            finalY = (heightMultiplyer + 1) * sizeOfCell.height;
        }

        return new PIXI.Point(finalX, finalY);
    };
    this.createHitBox = function () {
        this.hitbox = [
            new PIXI.Rectangle(this.x, this.y - 20, this.width, this.lineWidth + 20), //top
            new PIXI.Rectangle(this.x - 20, this.y, this.lineWidth + 20, this.length), //left
            new PIXI.Rectangle(this.x + this.width - 20, this.y, this.lineWidth + 20, this.length), //right
            new PIXI.Rectangle(this.x, this.y + this.length - 20, this.width, this.lineWidth + 20) //bottom
        ];
        /*let debugSquare = new PIXI.Graphics();
       debugSquare.lineStyle(this.lineWidth, '#FFFFFF');
       debugSquare.drawRect(this.x,this.y-20,this.width,this.lineWidth +20);
   
       app.stage.addChild(debugSquare);*/
    };
    this.checkHitBox = function (x, y) {
        for (let i = 0; i < this.hitbox.length; i++) {
            if (this.hitbox[i].contains(x, y)) {
                return true;
            }
        }
    };
    this.updateBox = function (snapSize) {
        if (this.placementDone == false) {
            this.square.clear();
            let originPoint = this.snaping(this.x, this.y);
            let sizePoint = new PIXI.Point(this.x + this.width, this.y + this.length);
            if (snapSize == true) {
                sizePoint.copyFrom(this.snaping(this.x + this.width, this.y + this.length));
            }
            this.x = originPoint.x;
            this.y = originPoint.y;
            this.width = sizePoint.x - this.x;
            this.length = sizePoint.y - this.y;
            // flip origin so width and height are not negative
            if (this.width < 0) {
                this.x = this.x + this.width;
                this.width = Math.abs(this.width);
            }
            if (this.length < 0) {
                this.y = this.y + this.length;
                this.length = Math.abs(this.length);
            }
            let radius = 30;
            if (this.length < 30 || this.width < 30) {
                radius = Math.min(this.length, this.width);
            }
            if (snapSize == true) {
                //Saving dimensions since snapSize is set to true when done with selection
                this.savedDimensions.push(Math.floor(this.x / sizeOfCell.width), Math.floor(this.y / sizeOfCell.height),
                    Math.floor(this.width / sizeOfCell.width), Math.floor(this.length / sizeOfCell.height));
            }

            this.createHitBox();
            this.square.drawRoundedRect(this.x, this.y, this.width, this.length, radius);
        }
    };

    this.updateToGrid = function () {
        if (this.savedDimensions.length > 0) {
            this.placementDone = false;
            this.setProperties(this.savedDimensions[0] * sizeOfCell.width, this.savedDimensions[1] * sizeOfCell.height,
                this.savedDimensions[2] * sizeOfCell.width, this.savedDimensions[3] * sizeOfCell.height);
            this.updateBox(true);
            this.placementDone = true;
        }
    };

    this.updateBox(false);

}

function resetKmapTable(){
    clearAllSelectionBoxes();
    let tds = document.querySelectorAll('table td');
    for(let i =0; i < tds.length; i++){
        tds[i].childNodes[0].data ="0";
    }
}

function clearAllSelectionBoxes(){
    for(let i = arrayOfBoxes.length -1; i >= 0; i--){
        arrayOfBoxes[i].square.destroy();
        arrayOfBoxes.splice(i,1);
    }
}

function checkForHits(x, y) {
    for (let i = 0; i < arrayOfBoxes.length; i++) {
        if (arrayOfBoxes[i].checkHitBox(x, y)) {
            arrayOfBoxes[i].square.destroy();
            arrayOfBoxes.splice(i, 1);
            return true;
        }
    }
    return false;
}

function onPointerDown(event) {
    if (event.data.buttons == 1) {
        boxDeleted = checkForHits(event.data.global.x, event.data.global.y);
        if (event.data.global.x > sizeOfCell.width && event.data.global.y > sizeOfCell.height && !boxDeleted) {
            origin.set(event.data.global.x, event.data.global.y);
            firstClick = true;
            mousedown = true;

        }
    }
}

function onPointerUp(event) {
    if (event.data.button == 0) {
        mousedown = false;
        //snap box length and width
        if (event.data.global.x > sizeOfCell.width && event.data.global.y > sizeOfCell.height) {
            if (Math.abs(event.data.global.x - origin.x) <= 150 && Math.abs(event.data.global.y - origin.y) <= 150 && !boxDeleted) {
                updateCellText(event.data.global.x, event.data.global.y);
            }
            boxDeleted = false;
        }
        if (currentlyCreatingSelection) {
            arrayOfBoxes[arrayOfBoxes.length - 1].updateBox(true);

            arrayOfBoxes[arrayOfBoxes.length - 1].placementDone = true;
            currentlyCreatingSelection = false;
        }

    }
}

function onPointerMove(event) {
    if (mousedown == true) {
        if (findDistance(event.data.global.x, event.data.global.y, origin.x, origin.y) > 100) {
            if (firstClick) {
                let newSelectionBox;
                newSelectionBox = new SelectionBox(origin.x, origin.y, 0, 0);
                newSelectionBox.snaping(origin.x, origin.y).copyTo(origin);

                arrayOfBoxes.push(newSelectionBox);
                firstClick = false;
                currentlyCreatingSelection = true;
            }
            if (currentlyCreatingSelection) {
                arrayOfBoxes[arrayOfBoxes.length - 1].setProperties(origin.x, origin.y, event.data.global.x - origin.x, event.data.global.y - origin.y);
                arrayOfBoxes[arrayOfBoxes.length - 1].updateBox(false);
            }
        }

    }
}
function changeColor(colorToChange) {
    currentColor = parseInt(colorToChange, 16);
}

function getCellFromXY(x, y) {
    let widthMultiplyer = Math.floor(x / sizeOfCell.width);
    let heightMultiplyer = Math.floor(y / sizeOfCell.height);

    return widthMultiplyer + (heightMultiplyer * SizeofTable[0]);
}

//flips between 0 and 1
function updateCellText(x, y) {
    let widthMultiplyer = Math.floor(x / sizeOfCell.width);
    let heightMultiplyer = Math.floor(y / sizeOfCell.height);
    let cell = table.childNodes[heightMultiplyer + 1].childNodes[widthMultiplyer].childNodes[0];
    if (cell.textContent == "0") {
        table.childNodes[heightMultiplyer + 1].childNodes[widthMultiplyer].childNodes[0].textContent = "1";
    } else {
        table.childNodes[heightMultiplyer + 1].childNodes[widthMultiplyer].childNodes[0].textContent = "0";
    }

}

function findDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
function resizeCanvas(event) {
    sizeOfCell = exapmleCell.getBoundingClientRect();
    for (let i = 0; i < arrayOfBoxes.length; i++) {
        arrayOfBoxes[i].updateToGrid();
    }
}