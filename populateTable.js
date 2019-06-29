//Fills and Creates the html Table
// possible dim 4x4, 4x2, 2x2
function createTable(dimensions) {
    let pattern = ['00', '01', '11', '10'];
    for (let r = 0; r < dimensions[0]; r++) {
        let row = document.createElement("tr");

        for (let c = 0; c < dimensions[1]; c++) {
            let cell;
            if (c == 0 && r == 0) {
                cell = document.createElement("th");
                cell.id = "exampleCell";
                cell.appendChild(document.createTextNode(""));

            } else if (r == 0 && c != 0) {
                cell = document.createElement("th");
                cell.appendChild(document.createTextNode(pattern[c - 1]));
            } else if (c == 0 && r != 0) {
                cell = document.createElement("th");
                cell.appendChild(document.createTextNode(pattern[r - 1]));
            }
            else {
                cell = document.createElement("td");
                cell.appendChild(document.createTextNode("0"));
            }
            //let cellText = document.createTextNode(0);
            //cell.appendChild(cellText);
            row.appendChild(cell);

        }
        table.appendChild(row);
    }
}

