function getSurrounding(index) {
  let returnList = [];
  let _row = Math.floor(index / columns);
  let _column = index % columns;
  //get right if on right edge
  if (_column == columns - 1) {
    if (table[index - (columns - 1)] == 1) {
      returnList.push(index - (columns - 1));
    }
  } else {
    if (table[index + 1] == 1) {
      returnList.push(index + 1);
    }
  }

  //get left if on left edge
  if (_column == 0) {
    if (table[index + (columns - 1)] == 1) {
      returnList.push(index + (columns - 1));
    }
  } else {
    if (table[index - 1] == 1) {
      returnList.push(index - 1);
    }
  }

  //get top if on top
  if (_row == 0) {
    if (table[(rows - 1) * columns + _column] == 1) {
      returnList.push((rows - 1) * columns + _column);
    }
  } else {
    if (table[(_row - 1) * columns + _column] == 1) {
      returnList.push((_row - 1) * columns + _column);
    }
  }

  //get bottom if on bottom
  if (_row == rows - 1) {
    if (table[_column] == 1) {
      returnList.push(_column);
    }
  } else {
    if (table[(_row + 1) * columns + _column] == 1) {
      returnList.push((_row + 1) * columns + _column);
    }
  }
  return returnList;
}