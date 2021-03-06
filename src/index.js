import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Square(props) {
    return (
        <button className={`square ${props.active ? 'active' : ''}`} onClick={props.onClick}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare([x, y]) {
        return (
            <Square
                key={`${x}${y}`}
                active={this.props.line && this.props.line.some(item => item[0] === x && item[1] === y)}
                value={this.props.squares[x][y]}
                onClick={() => {
                    this.props.onClick([x, y])
                }}
            />
        );
    }

    render() {
        const { squares } = this.props
        return (
            <div>
                {
                    squares.map((row, rowIndex) => {
                        return (
                            <div className="board-row" key={rowIndex}>
                                {row.map((square, colIndex) => this.renderSquare([rowIndex, colIndex]))}
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [{ squares: initSquares(3) }],
            xIsNext: true,
            currentStep: 0,
            ascSort: true
        }
    }

    handleSquareClick([x, y]) {
        const { history, xIsNext, currentStep, ascSort } = this.state
        const newHistory = ascSort
            ? history.slice(0, currentStep + 1)
            : history.slice(currentStep, history.length)

        const lastHistory = newHistory[ascSort ? currentStep : 0]
        if (calculateWinner(lastHistory.squares).winner || lastHistory.squares[x][y]) {
            return;
        }
        const squares = [[...lastHistory.squares[0]], [...lastHistory.squares[1]], [...lastHistory.squares[2]]]
        squares[x][y] = xIsNext ? 'X' : 'O'
        this.setState({
            history: ascSort
                ? [...newHistory, { squares, x, y }]
                : [{ squares, x, y }, ...newHistory],
            xIsNext: !xIsNext,
            currentStep: ascSort ? newHistory.length : 0
        })
    }

    rollbackTo(stepIndex) {
        this.setState({
            currentStep: stepIndex,
            xIsNext: stepIndex % 2 === 0
        })
    }

    sortHistory() {
        const { ascSort, history } = this.state
        const reversedHistory = [...history].reverse()
        this.setState({
            ascSort: !ascSort,
            history: reversedHistory,
            currentStep: !ascSort ? history.length - 1 : 0
        })
    }

    render() {
        const { ascSort, xIsNext, history, currentStep } = this.state
        const current = history[currentStep]
        const { winner, line } = calculateWinner(current.squares)
        const status = getStatus({ squares: current.squares, winner, xIsNext })
        const historyList = history.map((item, stepIndex) => {
            const startIndex = ascSort ? 0 : history.length - 1
            const desc = stepIndex === startIndex
                ? 'Game Start'
                : `Go to #${stepIndex}???${item.x + 1}, ${item.y + 1}`

            return (
                <li
                    key={`${item.x}-${item.y}`}
                    className={
                        stepIndex === currentStep ? 'active ' : ''
                            + (ascSort && stepIndex > currentStep ? 'determined ' : '')
                            + (!ascSort && stepIndex < currentStep ? 'determined' : '')
                    }
                >
                    <button onClick={() => this.rollbackTo(stepIndex)}>{desc}</button>
                </li>
            )
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        line={line}
                        squares={current.squares}
                        onClick={(i) => this.handleSquareClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div className="history-title">
                        <button onClick={() => this.sortHistory()}>??????</button>
                        &nbsp;
                        Step List:
                    </div>
                    <ol className="history-list" reversed={!ascSort}>{historyList}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares, lineLength = 3) {
    // x, y ????????????
    // x, y - 1 ???
    // x, y + 1 ???
    // x - 1, y ???
    // x + 1, y ???
    // x + 1, y + 1 ?????????
    // x - 1, y - 1 ?????????
    // x + 1, y - 1 ?????????
    // x - 1, y + 1 ?????????
    // const boundary = squares.length
    // // ????????????
    //
    // // ????????????
    // for (let x = 0; x < boundary; x++) {
    //     let col = []
    //     let row = []
    //     let leftSlash = []
    //     let rightSlash = []
    //
    //
    //     for (let y = 0; y < boundary; y++) {
    //         const rowPosition = [x, y]
    //         const colPosition = [y, x]
    //         const [colX, colY] = col[col.length - 1] || []
    //         if (col.length && squares[colX][colY] !== squares[y][x]) {
    //             col = []
    //         } else {
    //             col.push(colPosition)
    //         }
    //         const [rowX, rowY] = row[row.length - 1] || []
    //         if (row.length && squares[rowX][rowY] !== squares[x][y]) {
    //             row = []
    //         } else {
    //             row.push(rowPosition)
    //         }
    //
    //         if (col.length === lineLength) {
    //             return col
    //         }
    //         if (row.length === lineLength) {
    //             return row
    //         }
    //
    //     }
    // }
    // ?????????

    const lines = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
    ]
    for (let i = 0; i < lines.length; i++) {
        const [[ax, ay], [bx, by], [cx, cy]] = lines[i]
        if (
            squares[ax][ay] &&
            squares[ax][ay] === squares[bx][by] &&
            squares[ax][ay] === squares[cx][cy]
        ) {
            return { winner: squares[ax][ay], line: lines[i] }
        }
    }
    return {}
}

function getStatus(
    {
        squares, winner, xIsNext
    }
) {
    if (winner) {
        return `Winner: ${winner}`
    } else if (squares.every(item => !!item)) {
        return 'Draw'
    } else {
        return `Next player: ${xIsNext ? 'X' : 'O'}`
    }
}

// ??????NxN??????
function initSquares(n) {
    return Array(n).fill(Array(n).fill(null))
}

// ??????
ReactDOM.render(
    <Game/>
    , document.getElementById('root'))
