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
    renderSquare(position) {
        const [x, y] = position.split(',')
        return (
            <Square
                active={this.props.line && this.props.line.includes(position)}
                value={this.props.squares[x][y]}
                onClick={() => {
                    this.props.onClick(position)
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
                            <div className="board-row">
                                {row.map((square, colIndex) => this.renderSquare([rowIndex, colIndex].join(',')))}
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

    handleSquareClick(position) {
        const [x, y] = position.split(',')
        const { history, xIsNext, currentStep, ascSort } = this.state
        const newHistory = ascSort
            ? history.slice(0, currentStep + 1)
            : history.slice(currentStep, history.length)

        const lastHistory = newHistory[ascSort ? currentStep : 0]
        if (calculateWinner(lastHistory.squares).winner || lastHistory.squares[x][y]) {
            return;
        }
        const squares = [...lastHistory.squares]
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
                : `Go to #${stepIndex}：${item.x + 1}, ${item.y + 1}`

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
                        <button onClick={() => this.sortHistory()}>↑↓</button>
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
    // x, y 当前坐标
    // x, y - 1 上
    // x, y + 1 下
    // x - 1, y 左
    // x + 1, y 右
    // x + 1, y + 1 右下角
    // x - 1, y - 1 左上角
    // x + 1, y - 1 右上角
    // x - 1, y + 1 左下角
    const boundary = squares.length
    // 扫描斜线

    // 扫描行列
    for (let x = 0; x < boundary; x++) {
        let col = []
        let row = []
        let leftSlash = []
        let rightSlash = []


        for (let y = 0; y < boundary; y++) {
            const rowPosition = [x, y]
            const colPosition = [y, x]
            const [colX, colY] = col[col.length - 1] || []
            if (col.length && squares[colX][colY] !== squares[y][x]) {
                col = []
            } else {
                col.push(colPosition)
            }
            const [rowX, rowY] = row[row.length - 1] || []
            if (row.length && squares[rowX][rowY] !== squares[x][y]) {
                row = []
            } else {
                row.push(rowPosition)
            }

            if (col.length === lineLength) {
                return col
            }
            if (row.length === lineLength) {
                return row
            }

        }
    }
    // 扫描行

    // const lines = [
    //     [0, 1, 2],
    //     [3, 4, 5],
    //     [6, 7, 8],
    //     [0, 3, 6],
    //     [1, 4, 7],
    //     [2, 5, 8],
    //     [0, 4, 8],
    //     [2, 4, 6],
    // ]
    // for (let i = 0; i < lines.length; i++) {
    //     const [a, b, c] = lines[i]
    //     if (
    //         squares[a] &&
    //         squares[a] === squares[b] &&
    //         squares[a] === squares[c]
    //     ) {
    //         return { winner: squares[a], line: lines[i] }
    //     }
    // }
    // return {}
}

function getStatus(
    {
        squares, winner, xIsNext
    }
) {
    console.log(squares, "squares")
    if (winner) {
        return `Winner: ${winner}`
    } else if (squares.every(item => !!item)) {
        return 'Draw'
    } else {
        return `Next player: ${xIsNext ? 'X' : 'O'}`
    }
}

// 创建NxN棋盘
function initSquares(n) {
    return Array(n).fill(Array(n).fill(null))
}

// 入口
ReactDOM.render(
    <Game/>
    , document.getElementById('root'))
